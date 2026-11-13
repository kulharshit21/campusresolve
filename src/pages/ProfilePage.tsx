import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { isSupabaseConfigured } from '@/integrations/supabase/client';
import { formatDate } from '@/lib/utils';
import {
  User,
  Mail,
  Shield,
  Server,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, signOut, demoLogin } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your profile credentials, permissions, and backend architecture details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Identity Card */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">User Information</CardTitle>
              <CardDescription>Primary account identifiers and roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl uppercase shadow-md">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{user.full_name}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                  <div className="mt-1.5">
                    <Badge variant={user.role === 'admin' ? 'warning' : 'default'}>
                      {user.role === 'admin' ? 'Campus Administrator' : 'University Student'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> User ID
                  </span>
                  <span className="font-mono text-slate-800">{user.id}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> University Email
                  </span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Account Created
                  </span>
                  <span className="text-slate-800">{formatDate(user.created_at)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-red-500" />}
                  className="text-xs hover:text-red-600"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Persona Switcher for Viva / Project Review */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Examiner Persona Switcher
              </CardTitle>
              <CardDescription>
                Quickly toggle between Student and Admin personas to test role-based UI and RLS boundaries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant={user.role === 'student' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => demoLogin('student')}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5" />}
                  className="w-full justify-start text-xs"
                >
                  Switch to Student (Rahul)
                </Button>
                <Button
                  variant={user.role === 'admin' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => demoLogin('admin')}
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}
                  className="w-full justify-start text-xs"
                >
                  Switch to Admin (Dr. Anita)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Backend Connectivity Status Card */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                Backend Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {isSupabaseConfigured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {isSupabaseConfigured ? 'Connected to Supabase' : 'Local Dev Fixture Mode'}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                    {isSupabaseConfigured
                      ? 'Live PostgreSQL tables, Row Level Security policies, and Realtime channels are active.'
                      : 'Running local client fixtures for frontend verification. Ready to link Supabase MCP or API configuration.'}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Database:</span>
                  <span className="font-semibold text-slate-800">
                    {isSupabaseConfigured ? 'PostgreSQL 15+' : 'LocalStorage / Mock'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Model:</span>
                  <span className="font-semibold text-slate-800">PostgreSQL RLS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Realtime:</span>
                  <span className="font-semibold text-slate-800">
                    {isSupabaseConfigured ? 'Active (Websockets)' : 'Simulated'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
