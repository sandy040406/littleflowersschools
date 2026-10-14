import Image from 'next/image';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}

export default function PageHero({ title, subtitle, breadcrumb }: PageHeroProps) {
  return (
    <section className="relative bg-navy text-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-school-blue blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-gold blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>
      <div className="section-container relative py-14 lg:py-20">
        {breadcrumb && (
          <p className="text-white/50 text-sm mb-2 font-medium">
            Home / {breadcrumb}
          </p>
        )}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/70 text-base lg:text-lg max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-school-blue to-navy" />
    </section>
  );
}
