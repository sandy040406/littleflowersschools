'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  GraduationCap, 
  Calendar, 
  Image as ImageIcon,
  ChevronRight,
  Clock,
  MapPin,
  FileText,
  Phone
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getMockUser } from '@/lib/auth';
import { MOCK_PARENTS, MOCK_STUDENTS, MOCK_EVENTS, MOCK_CLASSES } from '@/lib/mock-data';
import { getGreeting, formatDate } from '@/lib/utils';
import { Parent, Student, SchoolClass } from '@/lib/types';

export default function ParentDashboard() {
  const user = getMockUser('parent');
  const [parentData, setParentData] = useState<Parent | null>(null);
  const [childrenData, setChildrenData] = useState<{ student: Student, schoolClass: SchoolClass }[]>([]);

  useEffect(() => {
    if (user) {
      // Get parent data
      const parent = MOCK_PARENTS.find(p => p.id === user.id) || MOCK_PARENTS[0];
      setParentData(parent);

      // Get children data
      const kids = parent.children.map(childId => {
        const student = MOCK_STUDENTS.find(s => s.id === childId)!;
        const schoolClass = MOCK_CLASSES.find(c => c.id === student.classId)!;
        return { student, schoolClass };
      });
      setChildrenData(kids);
    }
  }, [user]);

  const greeting = getGreeting();
  
  // Get recent events (first 2)
  const recentEvents = MOCK_EVENTS.slice(0, 2);

  if (!parentData) return <div className="p-8 text-center text-text-muted">Loading...</div>;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
          {greeting}, {parentData.name.split(' ')[0]}
        </h1>
        <p className="text-text-secondary">Here's what's happening with your children today.</p>
      </div>

      {/* Children Section */}
      <div>
        <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
          <GraduationCap size={20} className="text-school-blue" /> My Children
        </h2>
        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          {childrenData.map(({ student, schoolClass }) => (
            <Card key={student.id} hover className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-soft-blue flex-shrink-0 flex items-center justify-center text-xl font-bold text-school-blue">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-navy leading-tight">{student.name}</h3>
                <p className="text-sm font-medium text-school-blue mb-3">
                  {schoolClass.name} – Section {student.section}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-text-primary">Roll No:</span> {student.rollNumber}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-text-primary">Status:</span> 
                    <span className="text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Active
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content (Events & Updates) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Recent Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Calendar size={20} className="text-school-blue" /> Recent School Events
              </h2>
              <Link href="/parent/gallery" className="text-sm font-medium text-school-blue hover:underline">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {recentEvents.map(event => (
                <Card key={event.id} padding="none" hover className="flex flex-col sm:flex-row overflow-hidden">
                  <div className="sm:w-40 h-40 sm:h-auto relative bg-soft-blue flex-shrink-0">
                    <Image 
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-navy">{event.title}</h3>
                        <span className="text-xs font-medium bg-soft-blue text-school-blue px-2 py-0.5 rounded-full">
                          {event.category}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted flex items-center gap-1 mb-2">
                        <Clock size={12} /> {formatDate(event.date)}
                      </p>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                        {event.description}
                      </p>
                    </div>
                    <Link 
                      href={`/parent/gallery/${event.id}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-school-blue hover:text-navy transition-colors mt-auto"
                    >
                      View Event Gallery <ChevronRight size={16} />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Gallery Updates */}
          <Card className="border-school-blue/20">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-school-blue" /> New in Gallery
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-soft-blue overflow-hidden relative flex-shrink-0">
                  <Image src={MOCK_EVENTS[2].imageUrl} alt="Event" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy leading-tight mb-1">Photos from Science Exhibition</p>
                  <p className="text-xs text-text-secondary mb-2">Added 2 days ago for Class IV</p>
                  <Link href={`/parent/gallery/${MOCK_EVENTS[2].id}`} className="text-xs font-medium text-school-blue hover:underline">
                    View Photos
                  </Link>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-soft-blue overflow-hidden relative flex-shrink-0">
                  <Image src={MOCK_EVENTS[1].imageUrl} alt="Event" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy leading-tight mb-1">Sports Day Videos</p>
                  <p className="text-xs text-text-secondary mb-2">Added last week</p>
                  <Link href={`/parent/gallery/${MOCK_EVENTS[1].id}`} className="text-xs font-medium text-school-blue hover:underline">
                    Watch Videos
                  </Link>
                </div>
              </div>
            </div>
            <Button href="/parent/gallery" variant="outline" size="sm" className="w-full mt-4">
              Go to My Gallery
            </Button>
          </Card>

          {/* Quick Links */}
          <Card>
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText size={20} className="text-school-blue" /> Quick Links
            </h2>
            <div className="space-y-2">
              <Link href="/parent/gallery" className="flex items-center justify-between p-3 rounded-lg hover:bg-soft-blue transition-colors text-sm font-medium text-navy">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} className="text-text-muted" /> View Gallery
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <Link href="/activities" className="flex items-center justify-between p-3 rounded-lg hover:bg-soft-blue transition-colors text-sm font-medium text-navy">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-text-muted" /> School Activities
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <Link href="/contact" className="flex items-center justify-between p-3 rounded-lg hover:bg-soft-blue transition-colors text-sm font-medium text-navy">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-text-muted" /> Contact School
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
