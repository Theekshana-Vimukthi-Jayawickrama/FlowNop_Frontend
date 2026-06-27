import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold text-text-muted select-none">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3.5 py-2 bg-surface text-text-main text-sm rounded-lg border border-border-color focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
            error ? 'border-danger focus:border-danger focus:ring-danger' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
