'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Play, X, Trash2, Camera, Video, Calendar, UploadCloud } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { api, mediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { getSession } from '@/lib/session';

interface MediaOut {
  id: number;
  url: string;
  media_type: 'image' | 'video';
  title: string | null;
  created_at: string;
  uploaded_by: number | null;
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
  created_by: number | null;
  media?: MediaOut[];
}

export default function TeacherEventGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<EventOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaOut | null>(null);

  const session = getSession();
  const currentUserId = session?.userId;

  useEffect(() => {
    if (eventId) fetchEventDetails();
  }, [eventId]);

  async function fetchEventDetails() {
    try {
      setLoading(true);
      const data = await api<EventOut>(`/api/gallery/events/${eventId}`);
      setEvent(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load event details', 'error');
      router.push('/teacher/gallery');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteMedia(mediaId: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this media?')) return;
    try {
      await api(`/api/gallery/media/${mediaId}`, { method: 'DELETE' });
      showToast('Media deleted successfully', 'success');
      // Remove from state
      if (event && event.media) {
        setEvent({
          ...event,
          media: event.media.filter(m => m.id !== mediaId),
          photo_count: event.media.find(m => m.id === mediaId)?.media_type === 'image' ? event.photo_count - 1 : event.photo_count,
          video_count: event.media.find(m => m.id === mediaId)?.media_type === 'video' ? event.video_count - 1 : event.video_count,
        });
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete media', 'error');
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading event details...</div>;
  }

  if (!event) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link href="/teacher/gallery" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-school-blue transition-colors">
        <ArrowLeft size={16} /> Back to Gallery
      </Link>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-navy">{event.title}</h1>
            {event.class_name ? (
              <Badge variant="blue">{event.class_name}</Badge>
            ) : (
              <Badge variant="gold">Whole School</Badge>
            )}
            {event.visibility === 'private' && (
              <Badge variant="gray">Private</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-text-secondary">
            <span className="flex items-center gap-1.5"><Calendar size={16}/> {formatDate(event.event_date)}</span>
            <span className="flex items-center gap-1.5"><Camera size={16}/> {event.photo_count} Photos</span>
            <span className="flex items-center gap-1.5"><Video size={16}/> {event.video_count} Videos</span>
          </div>
        </div>
        <Button href={`/teacher/gallery/upload?eventId=${event.id}`} icon={<UploadCloud size={16} />}>
          Upload Media
        </Button>
      </div>

      <Card className="border-border/60">
        {event.media && event.media.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {event.media.map(media => (
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
                
                {/* Delete Media Button */}
                {(currentUserId === media.uploaded_by || session?.role === 'admin') && (
                  <button 
                    onClick={(e) => handleDeleteMedia(media.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 text-error rounded shadow opacity-0 group-hover:opacity-100 hover:bg-error hover:text-white transition-all z-10"
                    title="Delete Media"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted">
            <Camera size={48} className="mx-auto mb-4 opacity-30" />
            <p>No media uploaded for this event yet.</p>
            <Button href={`/teacher/gallery/upload?eventId=${event.id}`} variant="outline" className="mt-4">
              Upload First File
            </Button>
          </div>
        )}
      </Card>

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
          <div className="p-4 text-center text-white/70 text-sm flex justify-center items-center gap-4">
            <span>{formatDate(selectedMedia.created_at)}</span>
            {(currentUserId === selectedMedia.uploaded_by || session?.role === 'admin') && (
              <button 
                onClick={(e) => {
                  handleDeleteMedia(selectedMedia.id, e as any);
                  setSelectedMedia(null);
                }}
                className="text-error hover:text-red-400 font-semibold"
              >
                Delete File
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
