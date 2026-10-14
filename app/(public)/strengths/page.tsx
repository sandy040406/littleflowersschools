import { GraduationCap, Users, Sparkles, Shield, Target, Monitor, Palette, Handshake, CheckCircle2 } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import { STRENGTHS_DATA } from '@/lib/mock-data';

export const metadata = {
  title: 'Our Strengths',
};

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={32} />,
  Users: <Users size={32} />,
  Sparkles: <Sparkles size={32} />,
  Shield: <Shield size={32} />,
  Monitor: <Monitor size={32} />,
  Palette: <Palette size={32} />,
  Target: <Target size={32} />,
  Handshake: <Handshake size={32} />,
};

export default function StrengthsPage() {
  return (
    <>
      <PageHero
        title="Our Strengths"
        subtitle="The core pillars that make Little Flowers Schools a trusted choice for parents and a nurturing home for students."
        breadcrumb="Our Strengths"
      />

      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container max-w-5xl">
          <div className="space-y-12 lg:space-y-16">
            {STRENGTHS_DATA.map((strength, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={strength.title} 
                  className={`flex flex-col md:flex-row gap-8 lg:gap-12 bg-white rounded-2xl shadow-sm border border-border p-8 lg:p-10 ${
                    !isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Icon Column */}
                  <div className="md:w-1/3 flex flex-col items-center text-center justify-center border-b md:border-b-0 md:border-r border-border pb-6 md:pb-0 md:pr-8">
                    <div className="w-20 h-20 rounded-2xl bg-school-blue/10 text-school-blue flex items-center justify-center mb-6">
                      {iconMap[strength.icon]}
                    </div>
                    <h2 className="text-2xl font-bold text-navy">{strength.title}</h2>
                  </div>

                  {/* Content Column */}
                  <div className="md:w-2/3 md:pl-4">
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                      {strength.description}
                    </p>
                    
                    <div className="bg-soft-blue rounded-xl p-5">
                      <h4 className="text-sm font-bold text-navy uppercase tracking-wider mb-3">Key Highlights</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {strength.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />
                            <span className="text-text-primary text-sm font-medium">{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
