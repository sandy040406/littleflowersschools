'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Download, Play, Image as ImageIcon, Video, AlertCircle, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { getEvent, GalleryEvent, MediaItem } from '@/lib/gallery';
import { mediaUrl } from '@/lib/api';

export default function EventGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<GalleryEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEvent(eventId);
    }
  }, [eventId]);

  async function loadEvent(id: string) {
    try {
      setLoading(true);
      const data = await getEvent(id);
      setEvent(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load event gallery', 'error');
      router.push('/parent/gallery');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-text-muted">
        <p>Event not found.</p>
        <Link href="/parent/gallery" className="text-school-blue hover:underline mt-2 inline-block">
          Back to Gallery
        </Link>
      </div>
    );
  }

  const mediaList = event.media || [];
  const photos = mediaList.filter(m => m.media_type === 'image');
  const videos = mediaList.filter(m => m.media_type === 'video');
  const currentMedia = activeTab === 'photos' ? photos : videos;

  const handleDownloadSingle = (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const downloadLink = document.createElement('a');
    downloadLink.href = mediaUrl(item.url);
    downloadLink.download = item.file_name || `media-${item.id}`;
    downloadLink.target = '_blank';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    showToast(`Downloading ${item.file_name}`, 'info');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
      {/* Back button & Header */}
      <div>
        <Link href="/parent/gallery" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-school-blue transition-colors mb-6">
          <ArrowLeft size={16} /> Back to My Gallery
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-navy">{event.title}</h1>
              <Badge variant={event.visibility === 'public' ? 'blue' : 'gold'}>
                {event.visibility === 'public' ? 'Public' : 'Private'}
              </Badge>
            </div>
            <p className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-4">
              <Calendar size={16} /> {formatDate(event.event_date)}
              {event.class_name && (
                <>
                  <span className="text-border px-1">•</span>
                  <span className="text-school-blue">{event.class_name}</span>
                </>
              )}
            </p>
            {event.description && (
              <p className="text-text-secondary max-w-3xl leading-relaxed">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6">
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
            activeTab === 'photos' ? 'text-school-blue' : 'text-text-secondary hover:text-navy'
          }`}
        >
          <ImageIcon size={18} /> 
          Photos ({photos.length})
          {activeTab === 'photos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-school-blue rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 transition-colors relative ${
            activeTab === 'videos' ? 'text-school-blue' : 'text-text-secondary hover:text-navy'
          }`}
        >
          <Video size={18} /> 
          Videos ({videos.length})
          {activeTab === 'videos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-school-blue rounded-t-full" />
          )}
        </button>
      </div>

      {/* Media Grid */}
      {currentMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentMedia.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all cursor-pointer aspect-square"
              onClick={() => setSelectedMedia(item)}
            >
              {item.media_type === 'image' ? (
                <Image
                  src={mediaUrl(item.url)}
                  alt={item.title || item.file_name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-navy/10">
                  <Video size={36} className="text-navy/40" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-navy shadow-lg group-hover:bg-school-blue group-hover:text-white transition-colors">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Hover Actions & Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between z-10">
                <span className="text-white text-xs font-medium truncate pr-2">
                  {item.title || item.file_name}
                </span>
                <button
                  onClick={(e) => handleDownloadSingle(item, e)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur transition-colors shrink-0"
                  aria-label="Download"
                  title="Download"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-xl border border-border border-dashed">
          <div className="w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center mx-auto mb-4 text-text-muted">
            {activeTab === 'photos' ? <ImageIcon size={28} /> : <Video size={28} />}
          </div>
          <h3 className="text-lg font-semibold text-navy mb-1">No {activeTab} available</h3>
          <p className="text-text-secondary text-sm">Media for this event will be uploaded soon.</p>
        </div>
      )}

      {/* Fullscreen Media Viewer / Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm animate-fade-in">
          <div className="p-4 flex justify-between items-center text-white border-b border-white/10">
            <span className="text-sm font-medium truncate max-w-md">
              {selectedMedia.title || selectedMedia.file_name}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadSingle(selectedMedia)}
                icon={<Download size={16} />}
                className="text-white border-white/30 hover:bg-white/20"
              >
                Download
              </Button>
              <button 
                onClick={() => setSelectedMedia(null)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 relative flex items-center justify-center p-4">
            {selectedMedia.media_type === 'image' ? (
              <Image
                src={mediaUrl(selectedMedia.url)}
                alt={selectedMedia.file_name}
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
            {(selectedMedia.file_size / (1024 * 1024)).toFixed(2)} MB • {formatDate(selectedMedia.created_at)}
          </div>
        </div>
      )}
    </div>
  );
}
