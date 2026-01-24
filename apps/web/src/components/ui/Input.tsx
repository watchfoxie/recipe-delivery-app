import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-brown font-medium mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/50">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-[0.75rem] border-2 
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon ? 'pr-10' : ''}
              ${error 
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
                : 'border-cream-dark focus:border-brown focus:ring-cream'}
              bg-white text-brown placeholder:text-brown/40
              focus:outline-none focus:ring-2
              transition-all duration-200
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/50">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">
            <i className="fas fa-exclamation-circle mr-1"></i>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-brown/60">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
