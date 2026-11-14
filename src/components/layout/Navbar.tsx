import React, { useState, useEffect } from 'react';
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
  Search,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { QuickSearchModal } from '@/components/common/QuickSearchModal';
import { NotificationDrawer } from '@/components/common/NotificationDrawer';
import { ReviewerPersonaSwitcher } from '@/components/common/ReviewerPersonaSwitcher';

export const Navbar: React.FC = () => {
  const { user, isAdmin, isStudent, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Global keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                    CampusResolve
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 -mt-1 hidden xs:inline">
                    Issue Management
                  </span>
                </div>
              </Link>

              {/* Backend connectivity indicator badge */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-600">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                <span>{isSupabaseConfigured ? 'Live Cloud Database' : 'Local Dev Fixture Mode'}</span>
              </div>
            </div>

            {/* Center Quick Search Trigger */}
            <div className="hidden md:flex flex-1 max-w-xs mx-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-all text-xs"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search tickets or campus...</span>
                </div>
                <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded">
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Desktop Navigation & Actions */}
            <nav className="hidden md:flex items-center gap-2">
              {/* Persona Switcher Pill */}
              <ReviewerPersonaSwitcher />

              {/* Search Icon button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              </button>

              {user ? (
                <>
                  {isStudent && (
                    <>
                      <Link
                        to="/student/dashboard"
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
                          Report Issue
                        </Button>
                      </Link>
                    </>
                  )}

                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/admin/dashboard')
                          ? 'bg-amber-50 text-amber-900 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 font-semibold text-amber-700">
                        <Shield className="w-4 h-4 text-amber-600" />
                        Admin Portal
                      </span>
                    </Link>
                  )}

                  {/* User Profile Pill & Signout */}
                  <div className="ml-2 pl-2 border-l border-slate-200 flex items-center gap-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Profile & Settings"
                    >
                      <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="hidden xl:flex flex-col text-left">
                        <span className="text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                          {user.full_name}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">
                          {user.role}
                        </span>
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2"
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

            {/* Mobile Actions & Menu Button */}
            <div className="flex md:hidden items-center gap-1.5">
              <ReviewerPersonaSwitcher />

              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none ml-1"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-2 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {user ? (
              <>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-200/60">
                  <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{user.full_name}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </div>
                </div>

                {isStudent && (
                  <div className="space-y-1">
                    <Link
                      to="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      Student Dashboard
                    </Link>
                    <Link
                      to="/student/complaints"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      My Complaints
                    </Link>
                    <Link
                      to="/student/new-complaint"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-blue-600 bg-blue-50/70 hover:bg-blue-100"
                    >
                      <PlusCircle className="w-4 h-4 text-blue-600" />
                      Report New Issue
                    </Link>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-1">
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100"
                    >
                      <Shield className="w-4 h-4 text-amber-600" />
                      Admin Portal & Incident Management
                    </Link>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <GraduationCap className="w-4 h-4 text-slate-500" />
                    Profile & Account Details
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
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
                    Register University Account
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        isAdmin={isAdmin}
      />
    </>
  );
};
