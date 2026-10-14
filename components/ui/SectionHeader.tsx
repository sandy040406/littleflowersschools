import { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  children?: ReactNode;
}

export default function SectionHeader({ title, subtitle, centered = true, children }: SectionHeaderProps) {
  return (
    <div className={`mb-10 lg:mb-12 ${centered ? 'text-center' : ''}`}>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className={`text-text-secondary text-base lg:text-lg max-w-2xl leading-relaxed ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
