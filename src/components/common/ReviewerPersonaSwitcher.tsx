import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ShieldCheck, UserCheck, ChevronDown, Check, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';

export const ReviewerPersonaSwitcher: React.FC = () => {
  const { user, signIn, allRegisteredUsers } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const navigate = useNavigate();

  // Find representative demo personas
  const harshitAdmin = allRegisteredUsers.find((u) => u.email === 'harshitkulkarni608@gmail.com') || {
    email: 'harshitkulkarni608@gmail.com',
    full_name: 'Harshit Kulkarni',
    role: 'admin' as UserRole,
  };
  const anitaAdmin = allRegisteredUsers.find((u) => u.email === 'admin.anita@campus.edu') || {
    email: 'admin.anita@campus.edu',
    full_name: 'Dr. Anita Desai',
    role: 'admin' as UserRole,
  };
  const rahulStudent = allRegisteredUsers.find((u) => u.email === 'rahul.student@campus.edu') || {
    email: 'rahul.student@campus.edu',
    full_name: 'Rahul Sharma',
    role: 'student' as UserRole,
  };
  const priyaStudent = allRegisteredUsers.find((u) => u.email === 'priya.student@campus.edu') || {
    email: 'priya.student@campus.edu',
    full_name: 'Priya Patel',
    role: 'student' as UserRole,
  };

  const personas = [
    {
      name: 'Harshit Kulkarni',
      role: 'admin' as UserRole,
      email: harshitAdmin.email,
      label: 'Chief Administrator (Staff)',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      name: 'Dr. Anita Desai',
      role: 'admin' as UserRole,
      email: anitaAdmin.email,
      label: 'Campus Admin (Reviewer)',
      color: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    {
      name: 'Rahul Sharma',
      role: 'student' as UserRole,
      email: rahulStudent.email,
      label: 'Student (CS Dept, Hostel 4)',
      color: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      name: 'Priya Patel',
      role: 'student' as UserRole,
      email: priyaStudent.email,
      label: 'Student (ECE Dept, Hostel 2)',
      color: 'bg-teal-100 text-teal-800 border-teal-300',
    },
  ];

  const handleSwitch = async (p: (typeof personas)[0]) => {
    setIsSwitching(true);
    setIsOpen(false);

    try {
      await signIn(p.email, 'password123');
      if (p.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      console.error('Persona switch error:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all focus:outline-none border border-slate-700"
        title="1-Click Reviewer Persona Switcher"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Role:</span>
        <span className="text-amber-300 font-bold max-w-[120px] truncate">
          {user ? user.full_name.split(' ')[0] : 'Demo Switcher'}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-200 z-50 p-2 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Reviewer Persona
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Switch perspective instantly for evaluation without re-typing passwords.
              </p>
            </div>

            <div className="py-1 space-y-1">
              {personas.map((p) => {
                const isActive = user?.email.toLowerCase() === p.email.toLowerCase();

                return (
                  <button
                    key={p.email}
                    onClick={() => handleSwitch(p)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          p.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {p.role === 'admin' ? (
                          <ShieldCheck className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs truncate">{p.name}</span>
                          <span className={`text-[9px] font-bold uppercase px-1 py-0.2 rounded border ${p.color}`}>
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{p.label}</p>
                      </div>
                    </div>

                    {isActive && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
