import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/auth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Logo from '../components/ui/Logo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginInputs = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const toast = useToast();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Disabled account states
  const [disabledAccount, setDisabledAccount] = useState<{ email: string; reason: string } | null>(null);
  const [reactivationSuccess, setReactivationSuccess] = useState<string | null>(null);
  const [reactivationReasonInput, setReactivationReasonInput] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInputs) => {
    setFormError(null);
    try {
      await login(data);
      navigate('/tasks');
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.disabled) {
        setDisabledAccount({
          email: error.response.data.email,
          reason: error.response.data.disabledReason,
        });
        setReactivationSuccess(null);
        setReactivationReasonInput('');
      } else {
        const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
        setFormError(msg);
      }
    }
  };

  const onFormError = () => {
    toast.error('Please fill in all required fields.');
  };

  const handleReactivationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabledAccount || !reactivationReasonInput.trim()) return;
    setIsRequesting(true);
    setFormError(null);
    try {
      await authApi.requestReactivation(disabledAccount.email, reactivationReasonInput);
      setReactivationSuccess('Your request for reactivation has been submitted successfully.');
      setDisabledAccount(null);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to submit reactivation request.';
      setFormError(msg);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-6 select-none">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-lg shadow-primary/5 border border-border-color/80 mb-3 animate-float">
            <Logo className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            FlowNop Task Management
          </h1>
          <p className="text-xs text-text-muted mt-1 font-semibold">Sign in to collaborate on tasks</p>
        </div>

        <Card className="shadow-xl">
          {disabledAccount ? (
            <>
              <h2 className="text-xl font-bold mb-2 text-danger">Account Disabled</h2>
              <p className="text-xs text-text-muted mb-4 font-semibold">
                Your login credentials are correct, but your account has been disabled.
              </p>

              <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-xl text-left">
                <span className="font-bold block uppercase text-[10px] text-danger/80 mb-1">Reason for disablement:</span>
                <p className="font-semibold italic text-text-main">{disabledAccount.reason}</p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleReactivationSubmit} className="flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-muted select-none">
                    Submit Reactivation Appeal
                  </label>
                  <textarea
                    className="w-full px-3.5 py-2 bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all disabled:opacity-50 min-h-[100px] resize-none"
                    placeholder="Provide a reason why your account should be reactivated (minimum 10 characters)..."
                    value={reactivationReasonInput}
                    onChange={(e) => setReactivationReasonInput(e.target.value)}
                    disabled={isRequesting}
                    required
                  />
                </div>

                <Button type="submit" className="w-full mt-2" isLoading={isRequesting} disabled={reactivationReasonInput.trim().length < 10}>
                  Submit Request
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setDisabledAccount(null);
                    setFormError(null);
                  }}
                  disabled={isRequesting}
                >
                  Back to Login
                </Button>
              </form>
            </>
          ) : reactivationSuccess ? (
            <>
              <h2 className="text-xl font-bold mb-2 text-success">Request Submitted</h2>
              <p className="text-xs text-text-muted mb-4 font-semibold">
                Your reactivation request has been successfully recorded.
              </p>

              <div className="mb-4 p-4 bg-success/15 border border-success/25 text-success text-xs font-semibold rounded-xl">
                {reactivationSuccess}
              </div>

              <p className="text-xs text-text-muted mb-6 leading-relaxed">
                An administrator will review your appeal and decide on recovering your account. You can attempt to sign in later to verify account activation.
              </p>

              <Button
                type="button"
                className="w-full"
                onClick={() => {
                  setReactivationSuccess(null);
                  setFormError(null);
                }}
              >
                Back to Login
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-4 text-text-main">Login</h2>

              {formError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit, onFormError)} className="flex flex-col gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  disabled={isSubmitting}
                  {...register('email')}
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex justify-between items-center select-none">
                    <label className="text-xs font-semibold text-text-muted">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline font-bold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    disabled={isSubmitting}
                    {...register('password')}
                  />
                </div>

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                  Sign In
                </Button>
              </form>

              <div className="mt-5 text-center text-xs text-text-muted font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-bold">
                  Sign Up
                </Link>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
