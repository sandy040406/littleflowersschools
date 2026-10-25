import Image from 'next/image';
import { Trophy, Music, PartyPopper, Users, Award, MapPin, Heart, ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ACTIVITIES_DATA } from '@/lib/mock-data';
import { mediaUrl } from '@/lib/api';
import type { ActivityItem } from '@/lib/content';

export const metadata = {
  title: 'Student Activities',
};

async function getActivitiesSettings() {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/content/settings`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

// Map string icon names to actual Lucide components
const iconMap: Record<string, React.ReactNode> = {
  Trophy: <Trophy size={28} />,
  Music: <Music size={28} />,
  PartyPopper: <PartyPopper size={28} />,
  Users: <Users size={28} />,
  Award: <Award size={28} />,
  MapPin: <MapPin size={28} />,
  Heart: <Heart size={28} />,
};

export default async function ActivitiesPage() {
  const settings = await getActivitiesSettings();
  let activities: ActivityItem[] = ACTIVITIES_DATA;
  if (settings?.activities_json) {
    try {
      const parsed = JSON.parse(settings.activities_json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        activities = parsed;
      }
    } catch {}
  }

  return (
    <>
      <PageHero
        title="Student Activities"
        subtitle="Education beyond the classroom walls. Discover the diverse opportunities we provide for students to explore their passions and develop new skills."
        breadcrumb="Activities"
      />

      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="A Vibrant Campus Life"
            subtitle="We believe that a well-rounded education includes rich experiences outside of traditional academics. Our activities program is designed to build character, teamwork, leadership, and creativity."
          />

          <div className="space-y-16 lg:space-y-24">
            {activities.map((activity, index) => {
              const isEven = index % 2 === 0;
              const bullets = activity.bullets && activity.bullets.length > 0
                ? activity.bullets
                : activity.title === 'Sports'
                ? ['Athletics & Track Events', 'Team Sports (Cricket, Football, Kho-Kho)', 'Indoor Games & Chess']
                : activity.title === 'Clubs'
                ? ['Science & Innovation Club', 'Eco & Nature Club', 'Literary & Debate Society']
                : ['Regular weekly practice sessions', 'Expert guidance & mentorship', 'Showcases, annual days & competitions'];
              
              return (
                <div key={activity.id || activity.title} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${!isEven ? 'lg:rtl' : ''}`}>
                  {/* Image Side */}
                  <div className={`relative ${!isEven ? 'lg:order-2' : ''}`}>
                    <div className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl bg-soft-blue">
                      <Image
                        src={mediaUrl(activity.imageUrl)}
                        alt={activity.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                    {/* Decorative Elements */}
                    <div className={`absolute -bottom-6 ${isEven ? '-right-6' : '-left-6'} w-32 h-32 rounded-full bg-soft-blue -z-10`} />
                    <div className={`absolute -top-6 ${isEven ? '-left-6' : '-right-6'} w-24 h-24 rounded-xl bg-gold/10 -z-10`} />
                  </div>

                  {/* Content Side */}
                  <div className={`${!isEven ? 'lg:order-1 lg:ltr' : ''}`}>
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-school-blue/10 text-school-blue mb-6">
                      {iconMap[activity.icon || 'Trophy'] || <Trophy size={28} />}
                    </div>
                    <h2 className="text-3xl font-bold text-navy mb-4">{activity.title}</h2>
                    <p className="text-lg text-text-secondary leading-relaxed mb-6">
                      {activity.description}
                    </p>
                    
                    {/* Bullet points */}
                    <ul className="space-y-3 mb-8">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-3 text-text-secondary">
                          <div className="w-1.5 h-1.5 rounded-full bg-school-blue" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== GALLERY HIGHLIGHT ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container text-center">
          <h2 className="text-3xl font-bold text-navy mb-4">See our students in action</h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            Browse our gallery to see photos and videos from recent sports days, cultural festivals, and club activities.
          </p>
          <div className="flex justify-center gap-4">
            <Button href="/gallery" variant="primary" size="lg">
              View Gallery <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
