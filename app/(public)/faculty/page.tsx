'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Mail, Clock, UserCircle } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import { getPublicFaculty, FacultyMember } from '@/lib/content';
import { mediaUrl } from '@/lib/api';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDepartment, setActiveDepartment] = useState<string>('All');

  useEffect(() => {
    async function loadFaculty() {
      try {
        setLoading(true);
        const data = await getPublicFaculty();
        setFaculty(data);
      } catch (err) {
        console.error('Failed to load faculty', err);
      } finally {
        setLoading(false);
      }
    }
    loadFaculty();
  }, []);

  // Extract unique departments
  const departments = useMemo(() => {
    const deps = new Set(faculty.map(t => t.department).filter(Boolean) as string[]);
    return ['All', ...Array.from(deps)].sort();
  }, [faculty]);

  // Filter teachers
  const filteredTeachers = useMemo(() => {
    if (activeDepartment === 'All') return faculty;
    return faculty.filter(t => t.department === activeDepartment);
  }, [activeDepartment, faculty]);

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
          {departments.length > 1 && (
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
          )}

          {/* ===== FACULTY GRID ===== */}
          {loading ? (
            <div className="text-center py-16 text-text-muted">Loading faculty profiles...</div>
          ) : filteredTeachers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeachers.map((teacher) => (
                <Card key={teacher.id} padding="none" hover className="flex flex-col h-full overflow-hidden">
                  <div className="relative h-64 bg-soft-blue flex items-center justify-center">
                    {teacher.photo_url ? (
                      <Image
                        src={mediaUrl(teacher.photo_url)}
                        alt={teacher.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-school-blue/40">
                        <UserCircle size={64} />
                      </div>
                    )}
                    {/* Subject Badge */}
                    {teacher.subject && (
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-navy text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-border/50">
                        {teacher.subject}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-navy mb-1">{teacher.name}</h3>
                    <p className="text-school-blue font-semibold text-sm mb-2">
                      {teacher.designation || 'Educator'}
                    </p>

                    {teacher.department && (
                      <div className="mb-3">
                        <span className="inline-block text-[11px] font-medium text-navy/80 bg-soft-blue px-2.5 py-0.5 rounded-md border border-school-blue/15">
                          {teacher.department}
                        </span>
                      </div>
                    )}
                    
                    {teacher.bio ? (
                      <p className="text-text-secondary text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                        &quot;{teacher.bio}&quot;
                      </p>
                    ) : (
                      <p className="text-text-muted text-sm italic mb-6 flex-grow">
                        Committed to shaping bright futures.
                      </p>
                    )}
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-border">
                      {teacher.experience && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Clock size={14} className="text-gold-dark flex-shrink-0" />
                          <span>{teacher.experience} experience</span>
                        </div>
                      )}
                      {teacher.email && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Mail size={14} className="text-school-blue flex-shrink-0" />
                          <a href={`mailto:${teacher.email}`} className="hover:text-school-blue transition-colors truncate">
                            {teacher.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-soft-blue rounded-xl border border-border border-dashed">
              <h3 className="text-lg font-semibold text-navy mb-1">No faculty members found</h3>
              <p className="text-text-secondary text-sm">Profiles will be updated soon.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
