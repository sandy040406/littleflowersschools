'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Calendar, Camera, Video, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { api, mediaUrl } from '@/lib/api';

interface MediaOut {
  id: number;
  url: string;
  media_type: 'image' | 'video';
  title: string | null;
  created_at: string;
}

interface EventOut {
  id: number;
  title: string;
  description: string | null;
  event_date: string;
  category: string;
  class_name: string | null;
  cover_url: string | null;
  photo_count: number;
  video_count: number;
  visibility: 'public' | 'private';
  media?: MediaOut[];
}

export default function ParentGalleryPage() {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState<EventOut | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaOut | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await api<EventOut[]>('/api/gallery/events');
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEventClick(event: EventOut) {
    setSelectedEvent(event);
    setLoadingEvent(true);
    try {
      const data = await api<EventOut>(`/api/gallery/events/${event.id}`);
      setSelectedEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvent(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading gallery...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">School Gallery</h1>
        <p className="text-text-secondary">View photos and videos from school events and classes.</p>
      </div>

      {events.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} onClick={() => handleEventClick(event)} className="cursor-pointer group h-full">
              <Card hover padding="none" className="h-full flex flex-col overflow-hidden border-border/60">
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
                  {/* Badges */}
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
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-navy text-lg leading-tight group-hover:text-school-blue transition-colors truncate">
                      {event.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-4">
                    <Calendar size={14} />
                    {formatDate(event.event_date)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                      <Camera size={16} className="text-school-blue" />
                      {event.photo_count} <span className="hidden xs:inline">Photos</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                      <Video size={16} className="text-gold-dark" />
                      {event.video_count} <span className="hidden xs:inline">Videos</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-20 border-dashed bg-white/50">
          <Camera size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-navy mb-2">No Events Found</h3>
          <p className="text-text-secondary max-w-sm mx-auto">
            There are currently no gallery events available. Check back later!
          </p>
        </Card>
      )}

      {/* Event Details Modal */}
      <Modal
        isOpen={!!selectedEvent && !selectedMedia}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title || 'Event Gallery'}
        size="xl"
      >
        {selectedEvent && (
          <div className="p-1 min-h-[50vh]">
            {loadingEvent ? (
              <div className="text-center py-12 text-text-muted">Loading media...</div>
            ) : selectedEvent.media && selectedEvent.media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedEvent.media.map(media => (
                  <div 
                    key={media.id} 
                    className="relative aspect-square bg-black/5 rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedMedia(media)}
                  >
                    {media.media_type === 'image' ? (
                      <Image 
                        src={mediaUrl(media.url)} 
                        alt="Gallery image" 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform" 
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy/10">
                        <Video size={32} className="text-navy/40" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={32} className="text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">No media available for this event.</div>
            )}
          </div>
        )}
      </Modal>

      {/* Fullscreen Media Viewer */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm animate-fade-in">
          <div className="p-4 flex justify-end">
            <button 
              onClick={() => setSelectedMedia(null)}
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            {selectedMedia.media_type === 'image' ? (
              <Image
                src={mediaUrl(selectedMedia.url)}
                alt="Fullscreen media"
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <video 
                src={mediaUrl(selectedMedia.url)} 
                controls 
                autoPlay 
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
            )}
          </div>
          <div className="p-4 text-center text-white/70 text-sm">
            {formatDate(selectedMedia.created_at)}
          </div>
        </div>
      )}
    </div>
  );
}


