import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-muted select-none">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3.5 py-2 bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-text-muted/50 disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[80px] ${
            error ? 'border-danger focus:border-danger focus:ring-danger' : ''
          } ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
