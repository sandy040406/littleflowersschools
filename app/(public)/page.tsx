import Image from 'next/image';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  BookOpen,
  Trophy,
  Shield,
  Monitor,
  Sparkles,
  ArrowRight,
  Calendar,
  Camera,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
  Play,
  Star,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import HeroSlider from '@/components/ui/HeroSlider';
import AlertBanner from '@/components/ui/AlertBanner';
import {
  SCHOOL_INFO,
  PLACEHOLDER_IMAGES,
  STRENGTHS_DATA,
  ACTIVITIES_DATA,
} from '@/lib/mock-data';
import { formatDate, mediaUrl } from '@/lib/utils';

async function getHomeData() {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  try {
    const [eventsRes, facultyRes, settingsRes] = await Promise.all([
      fetch(`${base}/api/gallery/events`, { next: { revalidate: 60 } }),
      fetch(`${base}/api/content/faculty`, { next: { revalidate: 60 } }),
      fetch(`${base}/api/content/settings`, { next: { revalidate: 60 } }),
    ]);
    const events = eventsRes.ok ? await eventsRes.json() : [];
    const faculty = facultyRes.ok ? await facultyRes.json() : [];
    const settings = settingsRes.ok ? await settingsRes.json() : null;
    return { events, faculty, settings };
  } catch {
    return { events: [], faculty: [], settings: null };
  }
}

export default async function HomePage() {
  const { events, faculty, settings } = await getHomeData();
  const latestEvents = events.slice(0, 3);
  const featuredFaculty = faculty.slice(0, 4);
  const schoolName = settings?.school_name || 'Little Flowers Schools';
  return (
    <>
      <AlertBanner />
      <HeroSlider />

      {/* ===== QUICK INFO STRIP ===== */}
      <section className="bg-white border-b border-border">
        <div className="section-container py-8 lg:py-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-border">
            {[
              { icon: BookOpen, title: 'Admissions Open', desc: 'For the upcoming academic session', color: 'text-school-blue' },
              { icon: GraduationCap, title: 'Academic Excellence', desc: 'Structured, quality curriculum', color: 'text-navy' },
              { icon: Users, title: 'Experienced Faculty', desc: 'Dedicated & caring teachers', color: 'text-gold-dark' },
              { icon: Trophy, title: 'Student Activities', desc: 'Sports, arts & co-curricular', color: 'text-success' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 lg:px-6 lg:py-7">
                <div className={`mt-0.5 ${item.color}`}>
                  <item.icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-semibold text-navy text-sm lg:text-base">{item.title}</h3>
                  <p className="text-text-secondary text-xs lg:text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT PREVIEW ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={PLACEHOLDER_IMAGES.school}
                  alt="Little Flowers Schools campus"
                  width={640}
                  height={480}
                  className="w-full h-auto object-cover"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl bg-gold/20 -z-10 hidden lg:block" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-xl bg-school-blue/10 -z-10 hidden lg:block" />
            </div>

            {/* Content */}
            <div>
              <Badge variant="gold" size="md">About Us</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy mt-3 mb-4">
                Welcome to {schoolName}
              </h2>
              <p className="text-text-secondary leading-relaxed mb-4">
                {settings?.about_text ||
                  `At ${schoolName}, we believe every child has unique potential waiting to be discovered. Our school provides a warm, supportive environment where academic excellence meets holistic development.`}
              </p>
              <p className="text-text-secondary leading-relaxed mb-6">
                Our experienced faculty, thoughtful curriculum, and caring community work together to nurture curious minds and build confident, well-rounded individuals ready for tomorrow&apos;s world.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Quality Education', icon: GraduationCap },
                  { label: 'Safe Environment', icon: Shield },
                  { label: 'Holistic Growth', icon: Sparkles },
                  { label: 'Modern Facilities', icon: Monitor },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <item.icon size={16} className="text-school-blue" />
                    <span className="text-text-primary font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
              <Button href="/about">
                Learn More About Us <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACADEMICS ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Our Academics"
            subtitle="A comprehensive curriculum designed to inspire learning, develop critical thinking, and prepare students for future success."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Pre-Primary', desc: 'A playful, nurturing introduction to learning through exploration and creativity.', grades: 'Nursery – KG', color: 'bg-gold/10 text-gold-dark' },
              { title: 'Primary', desc: 'Building strong foundations in literacy, numeracy, and essential skills.', grades: 'Class I – V', color: 'bg-school-blue/10 text-school-blue' },
              { title: 'Middle School', desc: 'Deepening understanding across subjects with structured academic support.', grades: 'Class VI – VIII', color: 'bg-navy/10 text-navy' },
              { title: 'Secondary', desc: 'Focused academic preparation with career guidance and skill development.', grades: 'Class IX – X', color: 'bg-success/10 text-success' },
            ].map((item) => (
              <Card key={item.title} hover>
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} mb-4`}>
                  <BookOpen size={22} />
                </div>
                <h3 className="text-lg font-semibold text-navy mb-1">{item.title}</h3>
                <p className="text-xs font-medium text-text-muted mb-2">{item.grades}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/academics" variant="outline">
              Explore Academics <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== OUR STRENGTHS ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="Our Strengths"
            subtitle="What sets Little Flowers Schools apart — a commitment to excellence in every aspect of education."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STRENGTHS_DATA.slice(0, 6).map((strength, index) => {
              const iconMap: Record<string, React.ReactNode> = {
                GraduationCap: <GraduationCap size={24} />,
                Users: <Users size={24} />,
                Sparkles: <Sparkles size={24} />,
                Shield: <Shield size={24} />,
                Monitor: <Monitor size={24} />,
                Palette: <Trophy size={24} />,
              };
              return (
                <Card key={strength.title} hover className="relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-[40px] bg-soft-blue -z-0" />
                  <div className="relative">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-navy/5 text-navy mb-4">
                      {iconMap[strength.icon] || <Star size={24} />}
                    </div>
                    <h3 className="text-lg font-semibold text-navy mb-2">{strength.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      {strength.description.slice(0, 120)}…
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {strength.highlights.slice(0, 3).map((h) => (
                        <span key={h} className="text-xs bg-soft-blue text-text-secondary px-2 py-0.5 rounded-full">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button href="/strengths" variant="outline">
              View All Strengths <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== ACTIVITIES ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Student Activities"
            subtitle="Beyond academics — enriching experiences that build character, confidence, and lifelong skills."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ACTIVITIES_DATA.slice(0, 6).map((activity) => (
              <Card key={activity.title} padding="none" hover>
                <div className="relative h-44 overflow-hidden rounded-t-xl">
                  <Image
                    src={activity.imageUrl}
                    alt={activity.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 text-white font-semibold text-lg">{activity.title}</h3>
                </div>
                <div className="p-4">
                  <p className="text-text-secondary text-sm leading-relaxed">{activity.description.slice(0, 100)}…</p>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/activities" variant="outline">
              View All Activities <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== LATEST EVENTS ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="Latest Events"
            subtitle="Stay connected with what’s happening at Little Flowers Schools."
          />
          {latestEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestEvents.map((event: any) => (
                <Card key={event.id} padding="none" hover className="flex flex-col h-full overflow-hidden">
                  <div className="relative h-48 overflow-hidden rounded-t-xl bg-soft-blue flex items-center justify-center">
                    {event.cover_url ? (
                      <Image
                        src={mediaUrl(event.cover_url)}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Camera size={40} className="text-school-blue/30" />
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="blue">{event.class_name || 'Whole School'}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                      <Calendar size={13} />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <h3 className="font-semibold text-navy mb-2 line-clamp-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-text-secondary text-sm leading-relaxed mb-3 line-clamp-2">{event.description}</p>
                    )}
                    <div className="mt-auto pt-2">
                      <Link href="/gallery" className="text-school-blue text-sm font-medium hover:underline inline-flex items-center gap-1">
                        View Gallery <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-text-muted">
              <p>No recent events announced yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== GALLERY PREVIEW ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Photo Gallery"
            subtitle="Glimpses of life at Little Flowers Schools — moments of learning, celebration, and growth."
          />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {events.filter((e: any) => e.cover_url).slice(0, 8).map((event: any) => (
              <Link key={event.id} href="/gallery" className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer block bg-white">
                <Image
                  src={mediaUrl(event.cover_url)}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/40 transition-colors duration-200 flex flex-col items-center justify-center p-3 text-center">
                  <Camera size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-1" />
                  <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate max-w-full">
                    {event.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/gallery">
              View All Photos <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== FACULTY PREVIEW ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="Our Faculty"
            subtitle="Dedicated educators who bring passion, expertise, and care to every classroom."
          />
          {featuredFaculty.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredFaculty.map((teacher: any) => (
                <Card key={teacher.id} padding="none" hover className="flex flex-col h-full overflow-hidden">
                  <div className="relative h-52 overflow-hidden rounded-t-xl bg-soft-blue flex items-center justify-center">
                    {teacher.photo_url ? (
                      <Image
                        src={mediaUrl(teacher.photo_url)}
                        alt={teacher.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <Users size={44} className="text-school-blue/30" />
                    )}
                  </div>
                  <div className="p-4 text-center flex flex-col flex-1">
                    <h3 className="font-semibold text-navy line-clamp-1">{teacher.name}</h3>
                    <p className="text-text-secondary text-sm mt-0.5">{teacher.designation || 'Educator'}</p>
                    {teacher.subject && (
                      <p className="text-school-blue text-xs font-medium mt-1">{teacher.subject}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <p>Faculty details are being updated.</p>
            </div>
          )}
          <div className="text-center mt-8">
            <Button href="/faculty" variant="outline">
              Meet Our Faculty <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>

      {/* ===== ENQUIRY CTA ===== */}
      <section className="relative py-16 lg:py-24 bg-navy overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-school-blue blur-3xl" />
        </div>
        <div className="section-container relative text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Have Questions About Admissions?
          </h2>
          <p className="text-white/60 text-base lg:text-lg max-w-xl mx-auto mb-8">
            We&apos;d love to hear from you. Reach out to learn more about our programs, admission process, and campus life.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button href="/enquiry" size="lg" className="bg-gold text-navy hover:bg-gold-light">
              Send an Enquiry <ArrowRight size={18} />
            </Button>
            <Button href="/contact" size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* ===== CONTACT PREVIEW ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="Get In Touch"
            subtitle="We&rsquo;re here to help. Reach out with any questions or visit us at our campus."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: MapPin, title: 'Address', content: SCHOOL_INFO.address, color: 'text-school-blue' },
              { icon: Phone, title: 'Phone', content: SCHOOL_INFO.phone, href: `tel:${SCHOOL_INFO.phone}`, color: 'text-navy' },
              { icon: Mail, title: 'Email', content: SCHOOL_INFO.email, href: `mailto:${SCHOOL_INFO.email}`, color: 'text-gold-dark' },
              { icon: Clock, title: 'Office Hours', content: SCHOOL_INFO.officeHours, color: 'text-success' },
            ].map((item) => (
              <Card key={item.title} hover className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-soft-blue ${item.color} mb-3`}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-semibold text-navy text-sm mb-1">{item.title}</h3>
                {item.href ? (
                  <a href={item.href} className="text-text-secondary text-sm hover:text-school-blue transition-colors">
                    {item.content}
                  </a>
                ) : (
                  <p className="text-text-secondary text-sm">{item.content}</p>
                )}
              </Card>
            ))}
          </div>
          {/* Map placeholder */}
          <div className="mt-10 rounded-xl border border-border bg-white h-64 lg:h-80 flex items-center justify-center text-text-muted">
            <div className="text-center">
              <MapPin size={32} className="mx-auto mb-2 text-border" />
              <p className="text-sm">Map will be displayed here</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
