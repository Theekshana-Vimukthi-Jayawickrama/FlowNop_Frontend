import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import authApi from '../api/auth';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Logo from '../components/ui/Logo';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordInputs = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const toast = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInputs) => {
    setFormError(null);
    setSuccessMessage(null);
    try {
      await authApi.forgotPassword(data.email);
      setSuccessMessage('We have sent a secure password reset link to your email address.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong. Please check your input.';
      setFormError(msg);
    }
  };

  const onFormError = () => {
    toast.error('Please fill in all required fields.');
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
          <p className="text-xs text-text-muted mt-1 font-semibold">Recover your security credentials</p>
        </div>

        <Card className="shadow-xl">
          {successMessage ? (
            <div className="text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-text-main">Check Your Inbox</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                {successMessage} Please check your email inbox and click on the verification link to proceed.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-bold transition-all">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2 text-text-main text-left">Forgot Password</h2>
              <p className="text-xs text-text-muted mb-5 font-semibold text-left">
                Enter your registered email address and we'll send you a time-limited reset link.
              </p>

              {formError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2 text-left">
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

                <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                  Send Reset Link
                </Button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-xs text-text-muted hover:text-text-main font-bold mt-2 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
