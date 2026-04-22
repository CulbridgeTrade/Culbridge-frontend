'use client';

import * as React from 'react';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
          <div className="relative z-50 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export const DialogTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => <button ref={ref} {...props}>{children}</button>
);
DialogTrigger.displayName = 'DialogTrigger';

export function DialogContent({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogDescription({ children }: { children?: React.ReactNode }) {
  return <p className="text-sm text-gray-500 mt-2">{children}</p>;
}

export function DialogHeader({ children }: { children?: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }: { children?: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}