import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types';

interface RegisteredAccount {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; user?: UserProfile }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
  allRegisteredUsers: RegisteredAccount[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCOUNTS_STORAGE_KEY = 'campusresolve_registered_accounts';
const SESSION_STORAGE_KEY = 'campusresolve_active_session';

const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    id: 'st-0000-0000-0000-000000000001',
    full_name: 'Rahul Sharma',
    email: 'rahul.student@campus.edu',
    password: 'password123',
    role: 'student',
    created_at: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
  },
  {
    id: 'st-0000-0000-0000-000000000002',
    full_name: 'Priya Patel',
    email: 'priya.p@campus.edu',
    password: 'password123',
    role: 'student',
    created_at: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
  },
  {
    id: 'ad-0000-0000-0000-000000000001',
    full_name: 'Dr. Anita Desai (Campus Admin)',
    email: 'admin.anita@campus.edu',
    password: 'admin123',
    role: 'admin',
    created_at: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
  },
];

function getStoredAccounts(): RegisteredAccount[] {
  const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
  try {
    const parsed = JSON.parse(data);
    // Ensure initial accounts exist if array was empty
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return parsed;
  } catch {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: RegisteredAccount[]) {
  localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<RegisteredAccount[]>(getStoredAccounts);

  // Load existing profile from Supabase or LocalStorage
  const loadSupabaseProfile = async (
    userId: string,
    userEmail: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return {
          id: userId,
          full_name: userEmail.split('@')[0],
          email: userEmail,
          role: 'student',
        };
      }

      return {
        id: data.id,
        full_name: data.full_name || userEmail.split('@')[0],
        email: data.email || userEmail,
        role: data.role || 'student',
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // 1. First check if there is an active local saved session
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        try {
          const parsedUser = JSON.parse(savedSession);
          if (mounted && parsedUser?.id) {
            setUser(parsedUser);
            setIsLoading(false);
            return;
          }
        } catch {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }

      // 2. If Supabase is configured, check Supabase session
      if (isSupabaseConfigured) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user && mounted) {
            const profile = await loadSupabaseProfile(
              session.user.id,
              session.user.email || ''
            );
            if (mounted && profile) {
              setUser(profile);
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
            }
          }
        } catch (err) {
          console.error('Supabase auth check error:', err);
        }
      }

      if (mounted) setIsLoading(false);

      // Listen for Supabase auth state changes if configured
      if (isSupabaseConfigured) {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;
          if (session?.user) {
            const profile = await loadSupabaseProfile(
              session.user.id,
              session.user.email || ''
            );
            if (mounted && profile) {
              setUser(profile);
              localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
            }
          } else {
            // Keep local session if not explicitly signed out
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    if (isSupabaseConfigured) {
      const p = await loadSupabaseProfile(user.id, user.email);
      if (p) {
        setUser(p);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(p));
      }
    }
  };

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: Error | null; user?: UserProfile }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const currentAccounts = getStoredAccounts();

    // 1. Check local persistent accounts repository
    const matched = currentAccounts.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );

    if (matched) {
      // Verify password
      if (matched.password && matched.password !== password) {
        return {
          error: new Error('Incorrect password. Please verify your credentials and try again.'),
        };
      }

      const activeProfile: UserProfile = {
        id: matched.id,
        full_name: matched.full_name,
        email: matched.email,
        role: matched.role,
        created_at: matched.created_at,
      };

      setUser(activeProfile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(activeProfile));

      // Also attempt Supabase sign-in in background if configured
      if (isSupabaseConfigured) {
        supabase.auth.signInWithPassword({ email: normalizedEmail, password }).catch(() => {});
      }

      return { error: null, user: activeProfile };
    }

    // 2. If not found locally, and Supabase is configured, try Supabase Auth directly
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (error) {
          return { error: new Error(error.message) };
        }

        if (data.user) {
          const profile = await loadSupabaseProfile(data.user.id, data.user.email || normalizedEmail);
          if (profile) {
            setUser(profile);
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));

            // Also register in local registry for fast retrieval
            currentAccounts.push({
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              role: profile.role,
              password,
              created_at: profile.created_at || new Date().toISOString(),
            });
            saveStoredAccounts(currentAccounts);
            setAccounts(currentAccounts);
            return { error: null, user: profile };
          }
        }

        return { error: null };
      } catch (err: any) {
        return { error: new Error(err.message || 'Authentication failed.') };
      }
    }

    // Account not found anywhere
    return {
      error: new Error(
        'No account found with this email address. Please click "Register here" to create a new profile.'
      ),
    };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'student'
  ): Promise<{ error: Error | null; needsConfirmation?: boolean }> => {
    const normalizedEmail = email.trim().toLowerCase();
    const currentAccounts = getStoredAccounts();

    // Check if account already exists
    const existing = currentAccounts.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      return {
        error: new Error('An account with this email address already exists. Please log in.'),
      };
    }

    // Generate deterministic/unique ID
    const newUserId =
      role === 'admin'
        ? `ad-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`
        : `st-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    const newAccount: RegisteredAccount = {
      id: newUserId,
      full_name: fullName.trim(),
      email: normalizedEmail,
      password,
      role,
      created_at: new Date().toISOString(),
    };

    currentAccounts.push(newAccount);
    saveStoredAccounts(currentAccounts);
    setAccounts(currentAccounts);

    const newProfile: UserProfile = {
      id: newAccount.id,
      full_name: newAccount.full_name,
      email: newAccount.email,
      role: newAccount.role,
      created_at: newAccount.created_at,
    };

    // Auto-login newly registered user immediately!
    setUser(newProfile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newProfile));

    // If Supabase is configured, create Supabase user in background
    if (isSupabaseConfigured) {
      supabase.auth
        .signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: fullName, role },
          },
        })
        .catch((err) => {
          console.warn('Supabase remote signup warning (local profile active):', err);
        });
    }

    return { error: null, needsConfirmation: false };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  };

  const demoLogin = (selectedRole: UserRole) => {
    const currentAccounts = getStoredAccounts();
    const target =
      currentAccounts.find((acc) => acc.role === selectedRole) ||
      (selectedRole === 'admin' ? INITIAL_ACCOUNTS[2] : INITIAL_ACCOUNTS[0]);

    const profile: UserProfile = {
      id: target.id,
      full_name: target.full_name,
      email: target.email,
      role: target.role,
      created_at: target.created_at,
    };

    setUser(profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isAdmin,
        isStudent,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        demoLogin,
        allRegisteredUsers: accounts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
