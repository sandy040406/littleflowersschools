'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Mail, Phone, BookOpen, GraduationCap, Clock } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import { MOCK_TEACHERS, PLACEHOLDER_IMAGES } from '@/lib/mock-data';

export default function FacultyPage() {
  const [activeDepartment, setActiveDepartment] = useState<string>('All');

  // Extract unique departments
  const departments = useMemo(() => {
    const deps = new Set(MOCK_TEACHERS.map(t => t.department));
    return ['All', ...Array.from(deps)].sort();
  }, []);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    if (activeDepartment === 'All') return MOCK_TEACHERS;
    return MOCK_TEACHERS.filter(t => t.department === activeDepartment);
  }, [activeDepartment]);

  return (
    <>
      <PageHero
        title="Our Faculty"
        subtitle="Meet the passionate educators who inspire, guide, and nurture our students every single day."
        breadcrumb="Faculty"
      />

      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="Dedicated to Excellence"
            subtitle="Our teachers are not just subject matter experts; they are mentors, facilitators, and role models committed to student success."
          />

          {/* ===== FILTER ===== */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeDepartment === dept
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-soft-blue text-text-secondary hover:bg-school-blue/10 hover:text-school-blue'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* ===== FACULTY GRID ===== */}
          {filteredTeachers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} padding="none" hover className="flex flex-col h-full overflow-hidden">
                  <div className="relative h-64 bg-soft-blue">
                    <Image
                      src={teacher.photoUrl}
                      alt={teacher.name}
                      fill
                      className="object-cover"
                    />
                    {/* Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-navy text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {teacher.subject}
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-navy mb-1">{teacher.name}</h3>
                    <p className="text-school-blue font-medium text-sm mb-4">{teacher.designation}</p>
                    
                    <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-grow">
                      "{teacher.bio}"
                    </p>
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Clock size={14} className="text-gold flex-shrink-0" />
                        <span>{teacher.experience} experience</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <Mail size={14} className="text-school-blue flex-shrink-0" />
                        <a href={`mailto:${teacher.email}`} className="hover:text-school-blue transition-colors truncate">
                          {teacher.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-soft-blue rounded-xl border border-border">
              <p className="text-text-secondary">No faculty members found for this department.</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== PROFESSIONAL DEVELOPMENT ===== */}
      <section className="py-16 lg:py-24 bg-navy text-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Continuous Professional Development</h2>
              <p className="text-white/70 leading-relaxed mb-6 text-lg">
                We believe that the best teachers are lifelong learners themselves. Our faculty undergoes regular training to stay updated with the latest pedagogical trends and technologies.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-school-blue/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <BookOpen size={16} className="text-school-blue" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Regular Workshops</h4>
                    <p className="text-white/60 text-sm">Monthly sessions on child psychology, inclusive education, and modern teaching aids.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <GraduationCap size={16} className="text-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Subject Matter Expertise</h4>
                    <p className="text-white/60 text-sm">Annual symposiums and conferences to deepen knowledge in their respective fields.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={PLACEHOLDER_IMAGES.school}
                alt="Teachers in a workshop"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-navy/20" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
