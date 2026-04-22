'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'default', ...props }, ref) => (
    <button
      className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 ${
        variant === 'outline' 
          ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50' 
          : 'text-white bg-black hover:bg-gray-800'
      } ${className || ''}`}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
);

Button.displayName = 'Button';

export { Button };
export default Button;