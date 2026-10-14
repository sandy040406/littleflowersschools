import Link from 'next/link';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  id?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-school-blue text-white hover:bg-school-blue-dark active:bg-school-blue-dark shadow-sm',
  secondary: 'bg-navy text-white hover:bg-navy-light active:bg-navy-dark shadow-sm',
  outline: 'border-2 border-school-blue text-school-blue hover:bg-school-blue/5 active:bg-school-blue/10',
  ghost: 'text-text-secondary hover:bg-soft-blue hover:text-text-primary',
  danger: 'bg-error text-white hover:bg-error/90 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3 text-base rounded-lg gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  loading,
  icon,
  ...props
}: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:ring-2 focus-visible:ring-school-blue focus-visible:ring-offset-2 ${
    disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'
  }`;

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if ('href' in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  const { onClick, type = 'button', ...rest } = props as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
