import { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 lg:p-6',
  lg: 'p-6 lg:p-8',
};

export default function Card({ children, className = '', hover = false, padding = 'md', ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-border ${paddingClasses[padding]} ${
        hover ? 'transition-all duration-200 hover:shadow-lg hover:border-border-light hover:-translate-y-0.5' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
