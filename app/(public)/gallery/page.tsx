'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, ZoomIn, Calendar, Camera, Video, X } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
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
  cover_url: string | null;
  photo_count: number;
  video_count: number;
  media?: MediaOut[];
}

export default function PublicGalleryPage() {
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

  return (
    <>
      <PageHero
        title="Public Gallery"
        subtitle="Explore the vibrant life, achievements, and memorable moments at Little Flowers Schools."
        breadcrumb="Gallery"
      />

      <section className="py-16 lg:py-24">
        <div className="section-container">
          <SectionHeader
            title="School Memories"
            subtitle="Take a look at the various events and activities that make our school a dynamic place of learning."
          />

          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading gallery...</div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group relative bg-white rounded-xl shadow-sm border border-border overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="relative h-56 bg-soft-blue flex items-center justify-center overflow-hidden">
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
                  </div>
                  
                  <div className="p-4 border-t border-border flex flex-col flex-1">
                    <h3 className="font-semibold text-navy text-base truncate mb-1 group-hover:text-school-blue transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                      <Calendar size={12} />
                      <span>{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border/50 text-xs font-medium text-text-secondary">
                      <span className="flex items-center gap-1"><Camera size={14} className="text-school-blue"/> {event.photo_count}</span>
                      <span className="flex items-center gap-1"><Video size={14} className="text-gold-dark"/> {event.video_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-soft-blue rounded-xl border border-border border-dashed">
              <h3 className="text-lg font-semibold text-navy mb-2">No events found</h3>
              <p className="text-text-secondary">There are currently no public events to display.</p>
            </div>
          )}
        </div>
      </section>

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
    </>
  );
}


