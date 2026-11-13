import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  Menu,
  X,
  LogOut,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/integrations/supabase/client';

export const Navbar: React.FC = () => {
  const { user, isAdmin, isStudent, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  CampusResolve
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 -mt-1">
                  Issue Management System
                </span>
              </div>
            </Link>

            {/* Backend connectivity indicator badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Dev Fixture Mode'}</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {isStudent && (
                  <>
                    <Link
                      to="/student/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/student/dashboard')
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </span>
                    </Link>

                    <Link
                      to="/student/complaints"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/student/complaints')
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <ClipboardList className="w-4 h-4" />
                        My Complaints
                      </span>
                    </Link>

                    <Link to="/student/new-complaint">
                      <Button size="sm" variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                        New Complaint
                      </Button>
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin/dashboard')
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-4 h-4" />
                        Admin Portal
                      </span>
                    </Link>
                  </>
                )}

                {/* User Profile Pill & Signout */}
                <div className="ml-4 pl-4 border-l border-slate-200 flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs uppercase">
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                        {user.full_name}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg mb-3">
                <div className="h-9 w-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user.full_name}</div>
                  <div className="text-xs text-blue-600 font-medium uppercase">{user.role}</div>
                </div>
              </div>

              {isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/student/complaints"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    My Complaints
                  </Link>
                  <Link
                    to="/student/new-complaint"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 font-semibold"
                  >
                    + Submit New Complaint
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
                >
                  Admin Portal & Analytics
                </Link>
              )}

              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Profile & Settings
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Register Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
