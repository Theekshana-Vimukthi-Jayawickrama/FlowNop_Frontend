import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import authApi from '../api/auth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Logo from '../components/ui/Logo';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInputs>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInputs) => {
    setFormError(null);
    setSuccessMessage(null);

    if (!token) {
      setFormError('Security token is missing. Please request a new password reset link.');
      return;
    }

    try {
      await authApi.resetPassword(token, data.password);
      setSuccessMessage('Your password has been reset successfully.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.';
      setFormError(msg);
    }
  };

  const onFormError = () => {
    toast.error('Please fill in all required fields.');
  };

  if (!token) {
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
          </div>
          <Card className="shadow-xl">
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-danger/15 text-danger flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-text-main">Invalid Request</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                No password reset token was provided. Please use the original link sent to your email or request a new one.
              </p>
              <Link to="/forgot-password" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-bold transition-all">
                Request Reset Link
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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
          <p className="text-xs text-text-muted mt-1 font-semibold">Establish your new credentials</p>
        </div>

        <Card className="shadow-xl">
          {successMessage ? (
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-text-main">Password Updated</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                {successMessage} You can now log in using your new credentials.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-bold transition-all">
                <ArrowLeft className="w-4 h-4" />
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2 text-text-main text-left">Reset Password</h2>
              <p className="text-xs text-text-muted mb-5 font-semibold text-left">
                Please enter and confirm your new password below.
              </p>

              {formError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit, onFormError)} className="flex flex-col gap-4">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  disabled={isSubmitting}
                  {...register('password')}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                />

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                  Reset Password
                </Button>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
