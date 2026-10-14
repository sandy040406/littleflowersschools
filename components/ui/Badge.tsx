interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'blue' | 'gold' | 'gray';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses = {
  default: 'bg-soft-blue text-text-secondary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  error: 'bg-error-light text-error',
  blue: 'bg-school-blue/10 text-school-blue',
  gold: 'bg-gold/10 text-gold-dark',
  gray: 'bg-navy/10 text-navy',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({ children, variant = 'default', size = 'sm', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}
