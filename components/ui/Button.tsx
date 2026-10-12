import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-black hover:bg-sky-300',
  secondary: 'border border-white/15 bg-white/5 text-white hover:border-white/30 hover:bg-white/10',
  ghost: 'text-muted hover:text-white',
  danger: 'text-muted hover:text-rose-300',
};

const sizes: Record<ButtonSize, string> = {
  md: 'px-6 py-2.5 text-xs tracking-[0.16em]',
  sm: 'px-4 py-2 text-[11px] tracking-[0.16em]',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cn(
    base,
    variants[variant],
    variant === 'ghost' || variant === 'danger'
      ? size === 'sm'
        ? 'px-3 py-2 text-[11px] tracking-[0.16em]'
        : 'px-3 py-2 text-xs tracking-[0.16em]'
      : sizes[size],
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonClasses(variant, size), className)}
      {...props}
    />
  );
});
