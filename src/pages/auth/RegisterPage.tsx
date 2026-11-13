import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { ShieldAlert, UserPlus, Lock, Mail, User } from 'lucide-react';
import { UserRole } from '@/types';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: signUpError, needsConfirmation } = await signUp(
      email,
      password,
      fullName,
      role
    );

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message || 'Registration failed.');
      return;
    }

    if (needsConfirmation) {
      setSuccessMsg(
        'Registration successful! Please check your email to confirm your account, or sign in.'
      );
    } else {
      // Auto signed in
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join CampusResolve to report and track campus issues</p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Enter your details to create your university profile</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="error" className="mb-4">
                {error}
              </Alert>
            )}

            {successMsg && (
              <Alert variant="success" className="mb-4">
                {successMsg}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. Rahul Sharma"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="University Email"
                type="email"
                placeholder="name@campus.edu"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Minimum 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Must be at least 6 characters long"
              />

              <Select
                label="Account Role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                helperText="Select 'Student' to report issues or 'Admin' for management evaluation"
              >
                <option value="student">Student (Complaint Reporter)</option>
                <option value="admin">Campus Administrator (Staff / Manager)</option>
              </Select>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Register Profile
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="ml-1 text-blue-600 font-semibold hover:underline">
              Log in here
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
