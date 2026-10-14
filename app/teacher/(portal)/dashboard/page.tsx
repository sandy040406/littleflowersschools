'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Calendar, 
  Image as ImageIcon,
  ChevronRight,
  UploadCloud,
  PlusCircle,
  Video,
  Clock
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getMockUser } from '@/lib/auth';
import { MOCK_TEACHERS, MOCK_CLASSES, MOCK_EVENTS, MOCK_MEDIA } from '@/lib/mock-data';
import { getGreeting, formatDate } from '@/lib/utils';
import { Teacher, SchoolClass, SchoolEvent, MediaItem } from '@/lib/types';

export default function TeacherDashboard() {
  const user = getMockUser('teacher');
  const [teacherData, setTeacherData] = useState<Teacher | null>(null);
  const [assignedClasses, setAssignedClasses] = useState<SchoolClass[]>([]);
  const [recentUploads, setRecentUploads] = useState<MediaItem[]>([]);
  const [recentEvents, setRecentEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    if (user) {
      const teacher = MOCK_TEACHERS.find(t => t.id === user.id) || MOCK_TEACHERS[0];
      setTeacherData(teacher);

      const classes = teacher.assignedClasses.map(
        classId => MOCK_CLASSES.find(c => c.id === classId)!
      );
      setAssignedClasses(classes);
      
      // Get events related to their classes (plus some public ones for demo)
      const classIds = classes.map(c => c.id);
      const events = MOCK_EVENTS.filter(e => 
        e.visibility === 'public' || (e.classId && classIds.includes(e.classId))
      ).slice(0, 3);
      setRecentEvents(events);

      // Get their recent uploads
      const uploads = MOCK_MEDIA.filter(m => m.uploadedBy === teacher.id).slice(0, 4);
      setRecentUploads(uploads);
    }
  }, [user]);

  const greeting = getGreeting();

  if (!teacherData) return <div className="p-8 text-center text-text-muted">Loading...</div>;

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
            {greeting}, {teacherData.name.split(' ')[0]}
          </h1>
          <p className="text-text-secondary">Here is an overview of your classes and recent activities.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button href="/teacher/gallery/upload" variant="outline" icon={<UploadCloud size={16} />}>
            Upload Media
          </Button>
          <Button href="#" className="bg-gold hover:bg-gold-dark text-white" icon={<PlusCircle size={16} />}>
            Create Event
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Assigned Classes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Users size={20} className="text-school-blue" /> My Assigned Classes
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {assignedClasses.map((cls) => (
                <Card key={cls.id} hover padding="sm" className="border-school-blue/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-navy text-lg">{cls.name}</h3>
                      <p className="text-sm text-school-blue font-medium mb-3">Section {cls.section}</p>
                    </div>
                    <div className="bg-soft-blue text-navy text-xs font-bold px-2 py-1 rounded">
                      {cls.studentCount} Students
                    </div>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-text-secondary">
                      {cls.classTeacherId === teacherData.id ? 'Class Teacher' : 'Subject Teacher'}
                    </span>
                    <Link href={`/teacher/gallery/${cls.id}`} className="text-sm font-semibold text-school-blue flex items-center gap-1 hover:underline">
                      Class Gallery <ChevronRight size={14} />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Events */}
          <div>
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-school-blue" /> Recent Events
            </h2>
            <Card padding="none" className="overflow-hidden">
              <ul className="divide-y divide-border">
                {recentEvents.map(event => (
                  <li key={event.id} className="p-4 hover:bg-soft-blue/50 transition-colors flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-soft-blue flex-shrink-0 overflow-hidden relative">
                        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy text-sm mb-1">{event.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-text-secondary">
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(event.date)}</span>
                          <span className="text-border">•</span>
                          <span>{event.className || 'All Classes'}</span>
                        </div>
                      </div>
                    </div>
                    <Link href={`/teacher/gallery/upload?eventId=${event.id}`} className="text-school-blue hover:text-navy p-2 rounded-lg hover:bg-school-blue/10 transition-colors" title="Upload Media">
                      <UploadCloud size={18} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          
          {/* Recent Uploads */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <ImageIcon size={20} className="text-gold-dark" /> My Recent Uploads
              </h2>
              <Link href="/teacher/gallery" className="text-xs font-medium text-school-blue hover:underline">
                View All
              </Link>
            </div>

            {recentUploads.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recentUploads.map(media => (
                  <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden group">
                    <Image src={media.thumbnailUrl} alt="Upload" fill className="object-cover" />
                    <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[10px] text-white font-medium truncate">{media.fileName}</p>
                    </div>
                    {media.fileType === 'video' && (
                      <div className="absolute top-1 right-1 bg-navy/80 rounded p-1">
                        <Video size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-soft-blue rounded-lg border border-border border-dashed">
                <p className="text-sm text-text-secondary">You haven't uploaded any media recently.</p>
              </div>
            )}
            
            <Button href="/teacher/gallery/upload" className="w-full mt-4" variant="outline" size="sm">
              Upload New Media
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
