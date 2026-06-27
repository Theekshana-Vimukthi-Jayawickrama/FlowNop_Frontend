import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label className="text-xs font-semibold text-text-muted select-none">
            {label}
          </label>
        )}
        <div className="relative w-full">
          <input
            ref={ref}
            type={inputType}
            className={`w-full px-3.5 py-2 ${
              isPassword ? 'pr-10' : ''
            } bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-text-muted/50 disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? 'border-danger focus:border-danger focus:ring-danger' : ''
            } ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main focus:outline-none select-none transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 shrink-0" />
              ) : (
                <Eye className="w-4 h-4 shrink-0" />
              )}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
