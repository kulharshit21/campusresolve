import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import {
  ShieldAlert,
  ArrowRight,
  Wifi,
  Zap,
  Droplet,
  BookOpen,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, isAdmin, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = (role: 'student' | 'admin') => {
    demoLogin(role);
    navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Project Review Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              University Final Review Project — Nov 2026
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              A Smart Campus <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                Complaint & Issue Resolution
              </span>{' '}
              System
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              CampusResolve replaces informal, untracked campus complaints with an institutional
              real-time platform. Students submit issues with photos, and administrators manage
              transparency with live audit timelines.
            </p>

            {/* Call to Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to={isAdmin ? '/admin/dashboard' : '/student/dashboard'}>
                  <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Go to {isAdmin ? 'Admin Portal' : 'Student Dashboard'}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Register as Student
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="outline">
                      Administrator Login
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo Selector for Reviewers */}
            <div className="mt-10 p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm max-w-lg mx-auto">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Quick Demonstration Access for Panel Review:
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto text-xs"
                  onClick={() => handleQuickDemo('student')}
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Test as Student (Rahul)
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full sm:w-auto text-xs"
                  onClick={() => handleQuickDemo('admin')}
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Test as Admin (Dr. Anita)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Categories Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Structured Campus Coverage
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Every Campus Problem, One Centralized Registry
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Wi-Fi & Network', icon: <Wifi className="w-5 h-5 text-blue-600" />, desc: 'Access points, lab connectivity' },
              { title: 'Electrical & AC', icon: <Zap className="w-5 h-5 text-amber-500" />, desc: 'Power trips, switchboards, lights' },
              { title: 'Water & Plumbing', icon: <Droplet className="w-5 h-5 text-sky-500" />, desc: 'Washroom leaks, drinking water' },
              { title: 'Classrooms & Labs', icon: <BookOpen className="w-5 h-5 text-indigo-600" />, desc: 'Projectors, benches, mics' },
            ].map((cat, i) => (
              <div
                key={i}
                className="p-5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all"
              >
                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{cat.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Lifecycle Transparency
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              From Report to Resolution in 3 Steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-blue-100 absolute top-4 right-4">01</span>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Student Reports Issue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student specifies location, category, uploads photographic evidence, and receives an
                immutable tracking identifier (e.g. CR-2026-1001).
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-amber-100 absolute top-4 right-4">02</span>
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Admin Manages & Dispatches</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Campus admin inspects report, dispatches maintenance technicians, and transitions status
                to "In Progress" with timestamped logs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-extrabold text-emerald-100 absolute top-4 right-4">03</span>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-Time Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Admin records resolution notes. The student dashboard reflects completion in real time
                without requiring manual page refreshes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                University Rubric Compliance
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Architected for Security, Speed, and Institutional Accountability
              </h2>
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">PostgreSQL Row Level Security (RLS):</strong>{' '}
                    Strict database isolation ensures students can only access their own submissions,
                    while administrators have authorized oversight.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Supabase Realtime Subscriptions:</strong>{' '}
                    Websocket channel subscriptions automatically push status changes to active client
                    sessions.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Comprehensive Audit Trail:</strong> Every state
                    transition is permanently captured in status history tables with changer identity
                    and notes.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-slate-400">PostgreSQL Database Schema</span>
              </div>
              <pre className="mt-4 text-xs font-mono text-blue-300 overflow-x-auto leading-relaxed">
{`-- Row Level Security (RLS) Policy Example
CREATE POLICY "Students can view only own complaints"
ON public.complaints
FOR SELECT
TO authenticated
USING (
  student_id = (SELECT auth.uid()) 
  OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  )
);`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
