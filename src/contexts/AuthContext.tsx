import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: UserRole
  ) => Promise<{ error: Error | null; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  demoLogin: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STUDENT: UserProfile = {
  id: 'st-0000-0000-0000-000000000001',
  full_name: 'Rahul Sharma',
  email: 'rahul.student@campus.edu',
  role: 'student',
  created_at: new Date().toISOString(),
};

const DEMO_ADMIN: UserProfile = {
  id: 'ad-0000-0000-0000-000000000001',
  full_name: 'Dr. Anita Desai (Campus Admin)',
  email: 'admin.anita@campus.edu',
  role: 'admin',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing profile from Supabase or LocalStorage demo
  const loadProfile = async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        console.warn('Profile fetch warning:', error?.message);
        // Fallback default profile
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
    } catch (err) {
      console.error('Failed to load profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      if (!isSupabaseConfigured) {
        // Check for saved demo session
        const savedDemo = localStorage.getItem('campusresolve_demo_user');
        if (savedDemo) {
          try {
            if (mounted) setUser(JSON.parse(savedDemo));
          } catch {
            localStorage.removeItem('campusresolve_demo_user');
          }
        }
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await loadProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const profile = await loadProfile(session.user.id, session.user.email || '');
          if (mounted) setUser(profile);
        } else {
          if (mounted) setUser(null);
        }
        if (mounted) setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    if (isSupabaseConfigured) {
      const p = await loadProfile(user.id, user.email);
      if (p) setUser(p);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Demo authentication
      if (email.toLowerCase().includes('admin')) {
        const u = { ...DEMO_ADMIN, email };
        setUser(u);
        localStorage.setItem('campusresolve_demo_user', JSON.stringify(u));
      } else {
        const u = { ...DEMO_STUDENT, email };
        setUser(u);
        localStorage.setItem('campusresolve_demo_user', JSON.stringify(u));
      }
      return { error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const profile = await loadProfile(data.user.id, data.user.email || email);
        setUser(profile);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = 'student'
  ) => {
    if (!isSupabaseConfigured) {
      const newUser: UserProfile = {
        id: 'user-' + Date.now(),
        full_name: fullName,
        email,
        role,
        created_at: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem('campusresolve_demo_user', JSON.stringify(newUser));
      return { error: null, needsConfirmation: false };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) return { error };

      const needsConfirmation = !data.session;

      if (data.user && data.session) {
        // Profile created by database trigger, load it
        const profile = await loadProfile(data.user.id, email);
        setUser(profile);
      }

      return { error: null, needsConfirmation };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('campusresolve_demo_user');
    setUser(null);
  };

  const demoLogin = (selectedRole: UserRole) => {
    const demo = selectedRole === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
    setUser(demo);
    localStorage.setItem('campusresolve_demo_user', JSON.stringify(demo));
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
