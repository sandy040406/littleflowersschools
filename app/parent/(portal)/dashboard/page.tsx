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
  Phone,
  Loader2,
  Bell,
  Pin
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useSession } from '@/lib/session';
import { api, mediaUrl } from '@/lib/api';
import { getParentNotices, Notice } from '@/lib/notices';
import { getGreeting, formatDate } from '@/lib/utils';

interface ChildData {
  id: number;
  name: string;
  admission_number: string;
  class_name: string;
  section: string;
  roll_number?: string | null;
  admission_date?: string | null;
  is_active: boolean;
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

export default function ParentDashboard() {
  const session = useSession();
  const [children, setChildren] = useState<ChildData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [kids, evts, ntc] = await Promise.all([
          api<ChildData[]>('/api/auth/me/children').catch(() => []),
          api<EventData[]>('/api/gallery/events').catch(() => []),
          getParentNotices().catch(() => []),
        ]);
        if (mounted) {
          setChildren(kids || []);
          setEvents(evts || []);
          setNotices(ntc || []);
        }
      } catch (err) {
        console.error('Failed to load parent dashboard data', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const greeting = getGreeting();
  const parentName = session?.name || 'Parent';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-text-muted">
        <Loader2 size={32} className="animate-spin text-school-blue mb-3" />
        <p className="text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">
          {greeting}, {parentName.split(' ')[0]}
        </h1>
        <p className="text-text-secondary">Here's what's happening with your children today.</p>
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy flex items-center gap-2">
            <GraduationCap size={20} className="text-school-blue" /> My Children
          </h2>
          <Link href="/parent/children" className="text-sm font-medium text-school-blue hover:underline flex items-center gap-1">
            View Profiles <ChevronRight size={16} />
          </Link>
        </div>
        {children.length === 0 ? (
          <Card className="p-6 text-center text-text-secondary">
            <p>No student records are currently linked to this parent account.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
            {children.map((child) => (
              <Link key={child.id} href="/parent/children" className="block focus:outline-none">
                <Card hover className="flex items-start gap-4 h-full cursor-pointer hover:border-school-blue/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-soft-blue flex-shrink-0 flex items-center justify-center text-xl font-bold text-school-blue">
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-navy leading-tight">{child.name}</h3>
                    <p className="text-sm font-medium text-school-blue mb-3">
                      {child.class_name} – Section {child.section}
                    </p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text-primary">Adm No:</span> {child.admission_number}
                      </div>
                      {child.roll_number && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-text-primary">Roll No:</span> {child.roll_number}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text-primary">Status:</span> 
                        <span className={child.is_active ? "text-success flex items-center gap-1" : "text-danger flex items-center gap-1"}>
                          <span className={`w-1.5 h-1.5 rounded-full ${child.is_active ? 'bg-success' : 'bg-danger'}`}></span>
                          {child.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Content (Notices & Events) */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Latest Circulars & Notices */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <Bell size={20} className="text-school-blue" /> Latest Circulars & Notices
              </h2>
              <Link href="/parent/notices" className="text-sm font-medium text-school-blue hover:underline flex items-center gap-1">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            {notices.length === 0 ? (
              <Card className="p-6 text-center text-text-secondary text-sm">
                No new circulars or notices for your family.
              </Card>
            ) : (
              <div className="space-y-3">
                {notices.slice(0, 3).map((notice) => (
                  <Link key={notice.id} href="/parent/notices" className="block focus:outline-none">
                    <Card
                      hover
                      className={`p-4 transition-all border-l-4 ${
                        notice.is_pinned
                          ? 'border-l-gold bg-amber-50/10'
                          : notice.target_class
                          ? 'border-l-purple-600 bg-purple-50/10'
                          : 'border-l-school-blue'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          {notice.is_pinned && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-navy border border-gold/30">
                              <Pin size={10} className="rotate-45" /> Pinned
                            </span>
                          )}
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-soft-blue text-school-blue capitalize">
                            {notice.category}
                          </span>
                          {notice.target_class ? (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                              For: {notice.target_class}
                            </span>
                          ) : (
                            <span className="text-[11px] text-text-muted px-2 py-0.5 rounded bg-gray-100">
                              Whole School
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={12} /> {formatDate(notice.publish_date)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-navy leading-snug hover:text-school-blue transition-colors">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

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
            
            {events.length === 0 ? (
              <Card className="p-8 text-center text-text-secondary">
                No school events posted yet.
              </Card>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 3).map((event) => (
                  <Card key={event.id} padding="none" hover className="flex flex-col sm:flex-row overflow-hidden">
                    <div className="sm:w-40 h-40 sm:h-auto relative bg-soft-blue flex-shrink-0">
                      {event.cover_url ? (
                        <Image 
                          src={mediaUrl(event.cover_url)}
                          alt={event.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full min-h-[140px] flex items-center justify-center text-school-blue/40">
                          <Calendar size={36} />
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-navy">{event.title}</h3>
                          <span className="text-xs font-medium bg-soft-blue text-school-blue px-2 py-0.5 rounded-full capitalize">
                            {event.category}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted flex items-center gap-1 mb-2">
                          <Clock size={12} /> {formatDate(event.event_date)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <Link 
                        href={`/parent/gallery`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-school-blue hover:text-navy transition-colors mt-auto"
                      >
                        View Event Gallery <ChevronRight size={16} />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Gallery Updates */}
          <Card className="border-school-blue/20">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <ImageIcon size={20} className="text-school-blue" /> New in Gallery
            </h2>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.slice(0, 2).map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-soft-blue overflow-hidden relative flex-shrink-0">
                      {event.cover_url ? (
                        <Image src={mediaUrl(event.cover_url)} alt={event.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-school-blue/50">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-navy leading-tight mb-1 truncate">{event.title}</p>
                      <p className="text-xs text-text-secondary mb-2">{formatDate(event.event_date)}</p>
                      <Link href={`/parent/gallery`} className="text-xs font-medium text-school-blue hover:underline">
                        View Photos ({event.photo_count || 0})
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-secondary">No recent photos uploaded.</p>
            )}
            <Button href="/parent/gallery" variant="outline" size="sm" className="w-full mt-4">
              Go to Gallery
            </Button>
          </Card>

          {/* Quick Links */}
          <Card>
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <FileText size={20} className="text-school-blue" /> Quick Links
            </h2>
            <div className="space-y-2">
              <Link href="/parent/notices" className="flex items-center justify-between p-3 rounded-lg hover:bg-soft-blue transition-colors text-sm font-medium text-navy">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-text-muted" /> Circulars & Notices
                </div>
                <ChevronRight size={16} className="text-text-muted" />
              </Link>
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
