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

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Little Flowers Schools"
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
                <p>
                  Founded with a vision to provide quality education in a nurturing environment, Little Flowers Schools has grown into a respected institution dedicated to holistic child development.
                </p>
                <p>
                  We believe that education is not just about academic achievement, but about building character, fostering creativity, and preparing students to navigate a complex and changing world with confidence and compassion.
                </p>
                <p>
                  Our dedicated faculty, modern facilities, and student-centered approach ensure that every child receives the attention and opportunities they need to discover their unique potential.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-4/3 relative z-10">
                <Image
                  src={PLACEHOLDER_IMAGES.school}
                  alt="Little Flowers Schools Campus"
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
      <section className="py-16 lg:py-24 bg-navy text-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card className="bg-white/5 border-white/10 text-white" padding="lg">
              <div className="w-14 h-14 rounded-full bg-school-blue/20 flex items-center justify-center mb-6">
                <Target size={28} className="text-school-blue" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                To provide a stimulating learning environment that encourages curiosity, critical thinking, and a lifelong love for learning, empowering students to become responsible and contributing members of society.
              </p>
            </Card>
            <Card className="bg-white/5 border-white/10 text-white" padding="lg">
              <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mb-6">
                <Lightbulb size={28} className="text-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed text-lg">
                To be a center of educational excellence that nurtures the holistic development of every child, fostering a community of confident, compassionate, and capable individuals ready to embrace the future.
              </p>
            </Card>
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
