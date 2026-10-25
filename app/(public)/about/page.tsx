import Image from 'next/image';
import { Target, Lightbulb, Heart, Shield, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PLACEHOLDER_IMAGES } from '@/lib/mock-data';

export const metadata = {
  title: 'About',
};

async function getAboutSettings() {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/content/settings`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

interface ParsedPoint {
  num: number;
  title?: string;
  text: string;
}

function parseStatementPoints(rawText: string): ParsedPoint[] {
  if (!rawText) return [];
  const text = rawText.trim();
  const numberSplit = text
    .split(/(?:^|\s+)(?=\d+[\.\)])/g)
    .map((s) => s.trim())
    .filter(Boolean);

  let rawList: string[] = [];
  if (numberSplit.length > 1) {
    rawList = numberSplit;
  } else if (text.includes('\n')) {
    rawList = text.split('\n').map((s) => s.trim()).filter(Boolean);
  } else {
    rawList = [text];
  }

  return rawList.map((item, idx) => {
    const clean = item.replace(/^\d+[\.\)]\s*/, '').trim();
    const colonIdx = clean.indexOf(':');
    if (colonIdx > 0 && colonIdx < 50) {
      return {
        num: idx + 1,
        title: clean.slice(0, colonIdx).trim(),
        text: clean.slice(colonIdx + 1).trim(),
      };
    }
    return { num: idx + 1, text: clean };
  });
}

export default async function AboutPage() {
  const settings = await getAboutSettings();
  const schoolName = settings?.school_name || 'Little Flowers Schools';
  const aboutText = settings?.about_text;
  const missionText =
    settings?.mission_text ||
    'To provide a stimulating learning environment that encourages curiosity, critical thinking, and a lifelong love for learning, empowering students to become responsible and contributing members of society.';
  const visionText =
    settings?.vision_text ||
    'To be a center of educational excellence that nurtures the holistic development of every child, fostering a community of confident, compassionate, and capable individuals ready to embrace the future.';

  const missionPoints = parseStatementPoints(missionText);
  const visionPoints = parseStatementPoints(visionText);

  return (
    <>
      <PageHero
        title={`About ${schoolName}`}
        subtitle="Discover our history, our philosophy, and our commitment to nurturing the next generation of confident learners."
        breadcrumb="About"
      />

      {/* ===== INTRODUCTION ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
                A Legacy of Learning and Excellence
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                {aboutText ? (
                  aboutText.split('\n\n').map((para: string, idx: number) => (
                    <p key={idx}>{para}</p>
                  ))
                ) : (
                  <>
                    <p>
                      Founded with a vision to provide quality education in a nurturing environment, {schoolName} has grown into a respected institution dedicated to holistic child development.
                    </p>
                    <p>
                      We believe that education is not just about academic achievement, but about building character, fostering creativity, and preparing students to navigate a complex and changing world with confidence and compassion.
                    </p>
                    <p>
                      Our dedicated faculty, modern facilities, and student-centered approach ensure that every child receives the attention and opportunities they need to discover their unique potential.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-4/3 relative z-10">
                <Image
                  src={PLACEHOLDER_IMAGES.school}
                  alt={`${schoolName} Campus`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-gold rounded-2xl z-0 hidden lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & VISION ===== */}
      <section className="py-16 lg:py-24 bg-navy text-white relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-school-blue/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-gold text-xs font-bold uppercase tracking-widest block mb-2">Our Guiding Light</span>
            <h2 className="text-3xl lg:text-4xl font-bold !text-white">Our Mission &amp; Vision</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission Card */}
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl p-6 lg:p-8 flex flex-col shadow-xl hover:border-white/25 transition-all">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-xl bg-school-blue/20 border border-school-blue/40 flex items-center justify-center shrink-0 shadow-inner">
                  <Target size={28} className="text-school-blue-light" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-school-blue-light font-semibold block mb-0.5">Core Purpose</span>
                  <h3 className="text-2xl lg:text-3xl font-bold !text-white tracking-tight">Our Mission</h3>
                </div>
              </div>

              <div className="space-y-3.5 flex-1">
                {missionPoints.map((point) => (
                  <div
                    key={point.num}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition-colors"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-school-blue text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {point.num}
                    </span>
                    <div className="flex-1 text-sm lg:text-base leading-relaxed text-white/90">
                      {point.title && (
                        <span className="font-semibold text-white block mb-0.5">
                          {point.title}:
                        </span>
                      )}
                      <p className="text-white/80">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-2xl p-6 lg:p-8 flex flex-col shadow-xl hover:border-white/25 transition-all">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0 shadow-inner">
                  <Lightbulb size={28} className="text-gold" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-gold-light font-semibold block mb-0.5">Future Direction</span>
                  <h3 className="text-2xl lg:text-3xl font-bold !text-white tracking-tight">Our Vision</h3>
                </div>
              </div>

              <div className="space-y-3.5 flex-1">
                {visionPoints.map((point) => (
                  <div
                    key={point.num}
                    className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] transition-colors"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-gold text-navy-dark font-bold text-xs flex items-center justify-center shadow-sm">
                      {point.num}
                    </span>
                    <div className="flex-1 text-sm lg:text-base leading-relaxed text-white/90">
                      {point.title && (
                        <span className="font-semibold text-gold-light block mb-0.5">
                          {point.title}:
                        </span>
                      )}
                      <p className="text-white/80">{point.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CORE VALUES ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Our Core Values"
            subtitle="The principles that guide our interactions, decisions, and educational approach every single day."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: 'Compassion', desc: 'Fostering empathy, kindness, and respect for all individuals in our community.', color: 'text-error' },
              { icon: Sparkles, title: 'Excellence', desc: 'Striving for the highest standards in academics, arts, sports, and personal conduct.', color: 'text-gold-dark' },
              { icon: Shield, title: 'Integrity', desc: 'Building strong moral character, honesty, and responsibility in every student.', color: 'text-navy' },
              { icon: BookOpen, title: 'Curiosity', desc: 'Encouraging a questioning mind and a passion for discovering new knowledge.', color: 'text-school-blue' },
            ].map((value) => (
              <Card key={value.title} className="text-center" hover>
                <div className={`w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 ${value.color}`}>
                  <value.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold text-navy mb-3">{value.title}</h3>
                <p className="text-text-secondary">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRINCIPAL'S MESSAGE ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
            <div className="grid lg:grid-cols-5">
              <div className="lg:col-span-2 relative h-[400px] lg:h-auto">
                <Image
                  src={PLACEHOLDER_IMAGES.principal}
                  alt="Principal"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="lg:col-span-3 p-8 lg:p-12">
                <h2 className="text-2xl font-bold text-navy mb-2">Message from the Principal</h2>
                <h3 className="text-school-blue font-medium mb-6">Dr. Meena Sharma</h3>
                <div className="space-y-4 text-text-secondary leading-relaxed italic">
                  <p>
                    "Welcome to Little Flowers Schools. It is a privilege to lead an institution where every day is filled with the joy of learning and the excitement of discovery."
                  </p>
                  <p>
                    "We believe that a school should be a place where children feel safe to express themselves, challenged to reach their potential, and supported in their individual journeys. Our commitment is to provide an environment that balances academic rigor with holistic development."
                  </p>
                  <p>
                    "Education is a partnership between the school, the students, and the parents. Together, we can build a strong foundation for our children, equipping them not just with knowledge, but with the values, resilience, and skills they need for a fulfilling life."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FACILITIES ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Our Environment"
            subtitle="Thoughtfully designed spaces that inspire creativity, encourage collaboration, and support comprehensive learning."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { img: PLACEHOLDER_IMAGES.classroom, title: 'Smart Classrooms', desc: 'Spacious, well-lit classrooms equipped with interactive displays and ergonomic seating.' },
              { img: PLACEHOLDER_IMAGES.library, title: 'Resource Library', desc: 'A vast collection of books, digital resources, and quiet reading spaces.' },
              { img: PLACEHOLDER_IMAGES.science, title: 'Science Laboratories', desc: 'Fully equipped labs for Physics, Chemistry, and Biology to encourage hands-on learning.' },
              { img: PLACEHOLDER_IMAGES.computer, title: 'Computer Labs', desc: 'Modern computing facilities with high-speed internet and the latest software.' },
              { img: PLACEHOLDER_IMAGES.playground, title: 'Sports Facilities', desc: 'Expansive playgrounds and courts for various indoor and outdoor sports.' },
              { img: PLACEHOLDER_IMAGES.music, title: 'Arts & Music Rooms', desc: 'Dedicated studios for visual arts, classical music, and contemporary dance.' },
            ].map((facility) => (
              <Card key={facility.title} padding="none" hover className="overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={facility.img}
                    alt={facility.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-navy mb-2">{facility.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{facility.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-16 lg:py-20 text-center">
        <div className="section-container">
          <h2 className="text-2xl sm:text-3xl font-bold text-navy mb-4">
            Want to learn more about our admissions?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto mb-8">
            We welcome you to visit our campus, meet our faculty, and experience the vibrant learning environment at Little Flowers Schools.
          </p>
          <div className="flex justify-center gap-4">
            <Button href="/enquiry" size="lg">
              Admissions Enquiry <ArrowRight size={18} />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
