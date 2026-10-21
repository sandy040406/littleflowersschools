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
  Clock,
  BookOpen,
  Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/session';
import { api, mediaUrl } from '@/lib/api';
import { getGreeting, formatDate } from '@/lib/utils';

interface ClassSummary {
  name: string;
  section: string;
  student_count: number;
}

interface EventData {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  category: string;
  class_name?: string | null;
  section?: string | null;
  visibility: string;
  cover_url?: string | null;
  photo_count?: number;
  video_count?: number;
}

interface MediaData {
  id: number;
  event_id: number;
  uploaded_by?: number | null;
  file_name: string;
  url: string;
  media_type: 'image' | 'video';
  file_size: number;
  title?: string | null;
  visibility: string;
  created_at: string;
}

interface TeacherDashboardSummary {
  my_events_count: number;
  total_events_count: number;
  my_uploads_count: number;
  classes: ClassSummary[];
  recent_events: EventData[];
  my_recent_uploads: MediaData[];
}

export default function TeacherDashboard() {
  const session = useSession();
  const [summary, setSummary] = useState<TeacherDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const data = await api<TeacherDashboardSummary>('/api/gallery/teacher-summary');
        if (mounted) {
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load teacher dashboard data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const greeting = getGreeting();
  const teacherName = session?.name || 'Teacher';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-text-muted">
        <Loader2 size={32} className="animate-spin text-school-blue mb-3" />
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  const assignedClasses = summary?.classes || [];
  const recentEvents = summary?.recent_events || [];
  const recentUploads = summary?.my_recent_uploads || [];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
            {greeting}, {teacherName.split(' ')[0]}
          </h1>
          <p className="text-text-secondary">Here is an overview of your classes and recent activities.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button href="/teacher/gallery/upload" variant="outline" icon={<UploadCloud size={16} />}>
            Upload Media
          </Button>
          <Button href="/teacher/gallery" className="bg-gold hover:bg-gold-dark text-white" icon={<PlusCircle size={16} />}>
            Create Event
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm" className="flex items-center gap-3 border-border/60">
          <div className="w-12 h-12 rounded-xl bg-school-blue/10 text-school-blue flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">My Events</p>
            <p className="text-xl font-bold text-navy">{summary?.my_events_count ?? 0}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3 border-border/60">
          <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold-dark flex items-center justify-center">
            <ImageIcon size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">My Uploads</p>
            <p className="text-xl font-bold text-navy">{summary?.my_uploads_count ?? 0}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3 border-border/60">
          <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Total Events</p>
            <p className="text-xl font-bold text-navy">{summary?.total_events_count ?? 0}</p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3 border-border/60">
          <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Classes</p>
            <p className="text-xl font-bold text-navy">{assignedClasses.length}</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Assigned Classes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Users size={20} className="text-school-blue" /> School Classes
              </h2>
            </div>
            
            {assignedClasses.length === 0 ? (
              <Card className="p-6 text-center text-text-secondary">
                No active student classes currently registered.
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {assignedClasses.map((cls, idx) => (
                  <Card key={`${cls.name}-${cls.section}-${idx}`} hover padding="sm" className="border-school-blue/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-navy text-lg">{cls.name}</h3>
                        <p className="text-sm text-school-blue font-medium mb-3">Section {cls.section}</p>
                      </div>
                      <div className="bg-soft-blue text-navy text-xs font-bold px-2 py-1 rounded">
                        {cls.student_count} Student{cls.student_count === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="pt-3 border-t border-border flex justify-between items-center">
                      <span className="text-xs text-text-secondary">
                        Active Class
                      </span>
                      <Link href={`/teacher/gallery`} className="text-sm font-semibold text-school-blue flex items-center gap-1 hover:underline">
                        Class Gallery <ChevronRight size={14} />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Recent Events */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Calendar size={20} className="text-school-blue" /> Recent Events
              </h2>
              <Link href="/teacher/gallery" className="text-sm font-medium text-school-blue hover:underline">
                View All
              </Link>
            </div>

            {recentEvents.length === 0 ? (
              <Card className="p-6 text-center text-text-secondary">
                No events recorded yet.
              </Card>
            ) : (
              <Card padding="none" className="overflow-hidden">
                <ul className="divide-y divide-border">
                  {recentEvents.map(event => (
                    <li key={event.id} className="p-4 hover:bg-soft-blue/50 transition-colors flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-soft-blue flex-shrink-0 overflow-hidden relative">
                          {event.cover_url ? (
                            <Image src={mediaUrl(event.cover_url)} alt={event.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-school-blue/40">
                              <Calendar size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-navy text-sm mb-1">{event.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-text-secondary">
                            <span className="flex items-center gap-1"><Clock size={12} /> {formatDate(event.event_date)}</span>
                            <span className="text-border">•</span>
                            <span>{event.class_name || 'All Classes'}</span>
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
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6 lg:space-y-8">
          {/* Recent Uploads */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <ImageIcon size={20} className="text-gold-dark" /> Recent Uploads
              </h2>
              <Link href="/teacher/gallery" className="text-xs font-medium text-school-blue hover:underline">
                View All
              </Link>
            </div>

            {recentUploads.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {recentUploads.map(media => (
                  <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden group bg-soft-blue">
                    <Image src={mediaUrl(media.url)} alt="Upload" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-[10px] text-white font-medium truncate">{media.file_name}</p>
                    </div>
                    {media.media_type === 'video' && (
                      <div className="absolute top-1 right-1 bg-navy/80 rounded p-1">
                        <Video size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-soft-blue rounded-lg border border-border border-dashed">
                <p className="text-sm text-text-secondary">No media uploaded recently.</p>
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
