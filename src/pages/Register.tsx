import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Logo from '../components/ui/Logo';

const phoneValidationRefinement = (data: { countryCode: string; phoneNumber: string }, ctx: z.RefinementCtx) => {
  const { countryCode, phoneNumber } = data;
  if (!phoneNumber) return;
  
  if (countryCode === '+94') {
    if (!/^\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Sri Lankan numbers must be exactly 9 digits (e.g. 771234567)',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+91') {
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Indian mobile numbers must be 10 digits starting with 6-9',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+1') {
    if (!/^\d{10}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'US phone numbers must be exactly 10 digits',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+44') {
    if (!/^\d{10}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'UK phone numbers must be exactly 10 digits',
        path: ['phoneNumber'],
      });
    }
  } else if (countryCode === '+61') {
    if (!/^\d{9}$/.test(phoneNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Australian numbers must be exactly 9 digits',
        path: ['phoneNumber'],
      });
    }
  }
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must not exceed 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(1, 'Address is required'),
  countryCode: z.string().min(1, 'Country code is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  birthday: z
    .string()
    .min(1, 'Birthday is required')
    .refine((val) => {
      const birthDate = new Date(val);
      if (isNaN(birthDate.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 18;
    }, 'You must be at least 18 years old to register'),
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
}).superRefine(phoneValidationRefinement);

type RegisterInputs = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const toast = useToast();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      countryCode: '+94',
    },
  });

  const onSubmit = async (data: RegisterInputs) => {
    setFormError(null);
    try {
      const { countryCode, phoneNumber, ...rest } = data;
      await registerUser({
        ...rest,
        phoneNumber: `${countryCode}${phoneNumber}`,
      });
      navigate('/tasks');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      setFormError(msg);
    }
  };

  const onFormError = () => {
    toast.error('Please fill in all required fields.');
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex items-center justify-center p-4">
      <div className="w-full max-w-md my-8">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-6 select-none">
          <div className="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center shadow-lg shadow-primary/5 border border-border-color/80 mb-3 animate-float">
            <Logo className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            FlowNop Task Management
          </h1>
          <p className="text-xs text-text-muted mt-1 font-semibold">Create your secure collaborator profile</p>
        </div>

        <Card className="shadow-xl">
          <h2 className="text-xl font-bold mb-4 text-text-main">Register</h2>

          {formError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/25 text-danger text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit, onFormError)} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Your Full Name"
              error={errors.name?.message}
              disabled={isSubmitting}
              {...register('name')}
            />

            <Input
              label="Username (Email)"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register('email')}
            />

            <Input
              label="Address"
              type="text"
              placeholder="Your Address"
              error={errors.address?.message}
              disabled={isSubmitting}
              {...register('address')}
            />

            <div className="flex gap-2 items-start w-full text-left">
              <div className="w-1/3">
                <Select
                  label="Code"
                  options={[
                    { value: '+94', label: 'LK (+94)' },
                    { value: '+91', label: 'IN (+91)' },
                    { value: '+1', label: 'US (+1)' },
                    { value: '+44', label: 'UK (+44)' },
                    { value: '+61', label: 'AU (+61)' },
                  ]}
                  disabled={isSubmitting}
                  error={errors.countryCode?.message}
                  {...register('countryCode')}
                />
              </div>
              <div className="w-2/3">
                <Input
                  label="Phone Number"
                  type="text"
                  placeholder="771234567"
                  error={errors.phoneNumber?.message}
                  disabled={isSubmitting}
                  {...register('phoneNumber')}
                />
              </div>
            </div>

            <Input
              label="Birthday"
              type="date"
              error={errors.birthday?.message}
              disabled={isSubmitting}
              {...register('birthday')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              disabled={isSubmitting}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-5 text-center text-xs text-text-muted font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
