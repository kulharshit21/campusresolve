import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ShieldAlert, LogIn, Lock, Mail, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || 'Invalid email or password.');
      return;
    }

    if (from) {
      navigate(from, { replace: true });
    } else {
      if (email.toLowerCase().includes('admin')) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  };

  const handleDemoClick = (role: 'student' | 'admin') => {
    demoLogin(role);
    if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else {
      navigate('/student/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome to CampusResolve</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in with your university credentials</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your account credentials to access your portal</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="University Email"
                type="email"
                placeholder="student@campus.edu or admin@campus.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>
            </form>

            {/* Quick Demo Fill Buttons for Reviewers */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
                Reviewer Quick Sign-In
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoClick('student')}
                  className="text-xs"
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                >
                  Student Portal
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDemoClick('admin')}
                  className="text-xs"
                  leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-amber-400" />}
                >
                  Admin Portal
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="ml-1 text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
