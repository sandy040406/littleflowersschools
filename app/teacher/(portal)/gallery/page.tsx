'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, Video, Calendar, UploadCloud, Plus, X, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { api, mediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { getSession } from '@/lib/session';

interface EventOut {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  category: string;
  class_name: string | null;
  section: string | null;
  visibility: 'public' | 'private';
  cover_url: string | null;
  photo_count: number;
  video_count: number;
  created_by: number | null;
  created_at: string;
}

export default function TeacherGalleryPage() {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    event_date: new Date().toISOString().split('T')[0],
    category: 'events',
    class_name: '',
    visibility: 'public',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const data = await api<EventOut[]>('/api/gallery/events');
      setEvents(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.event_date) return;
    try {
      setCreating(true);
      const payload = {
        title: newEvent.title,
        event_date: newEvent.event_date,
        category: newEvent.category,
        class_name: newEvent.class_name || null,
        visibility: newEvent.visibility,
      };
      await api('/api/gallery/events', { method: 'POST', body: payload });
      showToast('Event created successfully', 'success');
      setShowCreate(false);
      setNewEvent({ title: '', event_date: new Date().toISOString().split('T')[0], category: 'events', class_name: '', visibility: 'public' });
      fetchEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm('Are you sure you want to delete this event? All associated media will be lost.')) return;
    try {
      await api(`/api/gallery/events/${id}`, { method: 'DELETE' });
      showToast('Event deleted successfully', 'success');
      setEvents(events.filter(e => e.id !== id));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  }

  const session = getSession();
  const currentUserId = session?.userId;

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading gallery...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">Gallery Management</h1>
          <p className="text-text-secondary">Manage photos and videos for school events and classes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowCreate(!showCreate)} variant="outline" icon={showCreate ? <X size={16}/> : <Plus size={16} />}>
            {showCreate ? 'Cancel' : 'New Event'}
          </Button>
          <Button href="/teacher/gallery/upload" icon={<UploadCloud size={16} />}>
            Upload Media
          </Button>
        </div>
      </div>

      {showCreate && (
        <Card className="border-school-blue/20 bg-soft-blue/10 animate-fade-in shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Event Title *</label>
                <input 
                  type="text" required
                  value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  placeholder="e.g. Annual Sports Day"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Date *</label>
                <input 
                  type="date" required
                  value={newEvent.event_date} onChange={e => setNewEvent({...newEvent, event_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Class Name (Optional)</label>
                <input 
                  type="text"
                  value={newEvent.class_name} onChange={e => setNewEvent({...newEvent, class_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  placeholder="e.g. Grade 10 A (Leave blank for whole school)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Visibility</label>
                <select 
                  value={newEvent.visibility} onChange={e => setNewEvent({...newEvent, visibility: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                >
                  <option value="public">Public (Website Gallery)</option>
                  <option value="private">Private (Parents & Staff Only)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Event Galleries */}
      <div>
        <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-gold-dark" /> All Events
        </h2>
        {events.length === 0 ? (
          <div className="text-center py-12 text-text-muted bg-white rounded-xl border border-border border-dashed">
            No events found. Create one to get started!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} hover padding="none" className="h-full flex flex-col overflow-hidden border-border/60 relative group">
                <Link href={`/teacher/gallery/event/${event.id}`} className="block flex-1 flex flex-col">
                  <div className="relative h-48 bg-soft-blue overflow-hidden flex items-center justify-center">
                    {event.cover_url ? (
                      <Image
                        src={mediaUrl(event.cover_url)}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <Camera size={40} className="text-school-blue/30" />
                    )}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {event.class_name ? (
                        <Badge variant="blue" size="sm" className="shadow-sm">{event.class_name}</Badge>
                      ) : (
                        <Badge variant="gold" size="sm" className="shadow-sm">Whole School</Badge>
                      )}
                      {event.visibility === 'private' && (
                        <Badge variant="gray" size="sm" className="shadow-sm">Private</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-navy truncate flex-1 pr-2 group-hover:text-school-blue transition-colors">
                        {event.title}
                      </h3>
                      <span className="text-xs font-medium text-text-muted flex-shrink-0">
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-auto pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <Camera size={14} className="text-school-blue" />
                        {event.photo_count} Photos
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
                        <Video size={14} className="text-gold-dark" />
                        {event.video_count} Videos
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Delete action for event owner or admin */}
                {(currentUserId === event.created_by || session?.role === 'admin') && (
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteEvent(event.id); }}
                    className="absolute top-3 right-3 p-2 bg-white/90 text-error rounded-full shadow hover:bg-error hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete Event"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

