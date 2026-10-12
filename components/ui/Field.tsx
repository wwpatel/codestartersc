import type { ReactNode } from 'react';

export interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  help?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, help, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-rose-300">{error}</p>
      ) : help ? (
        <p className="mt-2 text-xs text-muted">{help}</p>
      ) : null}
    </div>
  );
}
