'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Download, Play, ZoomIn, Image as ImageIcon, Video, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { MOCK_EVENTS, MOCK_MEDIA } from '@/lib/mock-data';
import { formatDate, simulateDelay } from '@/lib/utils';
import { SchoolEvent, MediaItem } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

export default function EventGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<SchoolEvent | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (eventId) {
      const foundEvent = MOCK_EVENTS.find(e => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        // Get media for this event
        const eventMedia = MOCK_MEDIA.filter(m => m.eventId === eventId);
        setMedia(eventMedia);
      } else {
        router.push('/parent/gallery');
      }
    }
  }, [eventId, router]);

  if (!event) return <div className="p-8 text-center text-text-muted">Loading event...</div>;

  const photos = media.filter(m => m.fileType === 'image');
  const videos = media.filter(m => m.fileType === 'video');
  const currentMedia = activeTab === 'photos' ? photos : videos;

  const handleDownloadSingle = async (item: MediaItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    showToast(`Starting download for ${item.fileName}`, 'info');
    await simulateDelay(1500);
    showToast(`${item.fileName} downloaded successfully!`, 'success');
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    await simulateDelay(2500);
    setIsDownloading(false);
    setShowDownloadConfirm(false);
    showToast(`Successfully downloaded all ${currentMedia.length} ${activeTab}!`, 'success');
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
              <Calendar size={16} /> {formatDate(event.date)}
              {event.className && (
                <>
                  <span className="text-border px-1">•</span>
                  <span className="text-school-blue">{event.className}</span>
                </>
              )}
            </p>
            <p className="text-text-secondary max-w-3xl leading-relaxed">
              {event.description}
            </p>
          </div>
          
          <Button 
            variant="outline"
            onClick={() => setShowDownloadConfirm(true)}
            icon={<Download size={18} />}
            className="flex-shrink-0"
            disabled={currentMedia.length === 0}
          >
            Download All {activeTab === 'photos' ? 'Photos' : 'Videos'}
          </Button>
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
              <Image
                src={item.thumbnailUrl}
                alt={item.title || item.fileName}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Video Play Icon */}
              {item.fileType === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-navy shadow-lg group-hover:bg-school-blue group-hover:text-white transition-colors">
                    <Play size={20} className="ml-1" />
                  </div>
                </div>
              )}

              {/* Hover Actions & Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-between">
                <span className="text-white text-xs font-medium truncate pr-2">
                  {item.fileType === 'video' && item.duration ? item.duration : 'IMG'}
                </span>
                <button
                  onClick={(e) => handleDownloadSingle(item, e)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white backdrop-blur transition-colors"
                  aria-label="Download"
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

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedMedia}
        onClose={() => setSelectedMedia(null)}
        size="full"
      >
        {selectedMedia && (
          <div className="flex flex-col h-[80vh]">
            <div className="flex-1 relative bg-navy/5 rounded-lg overflow-hidden flex items-center justify-center">
              {selectedMedia.fileType === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <Image
                    src={selectedMedia.thumbnailUrl}
                    alt={selectedMedia.title || 'Video'}
                    fill
                    className="object-contain opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4">
                      <Play size={40} className="ml-2 text-white" />
                    </div>
                    <p className="text-sm text-white/60">(Video streaming will be enabled via Cloudflare R2)</p>
                  </div>
                </div>
              ) : (
                <Image
                  src={selectedMedia.fullUrl}
                  alt={selectedMedia.fileName}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}
            </div>
            
            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy">
                  {selectedMedia.title || selectedMedia.fileName}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  {(selectedMedia.fileSize / 1024 / 1024).toFixed(2)} MB • {formatDate(selectedMedia.createdAt)}
                </p>
              </div>
              <Button 
                onClick={() => handleDownloadSingle(selectedMedia)}
                icon={<Download size={16} />}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Download All Confirmation Modal */}
      <Modal
        isOpen={showDownloadConfirm}
        onClose={() => setShowDownloadConfirm(false)}
        title={`Download All ${activeTab === 'photos' ? 'Photos' : 'Videos'}`}
        size="sm"
      >
        <div className="text-center pb-2">
          <div className="w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center mx-auto mb-4 text-school-blue">
            <Download size={28} />
          </div>
          <h3 className="text-lg font-bold text-navy mb-2">Confirm Download</h3>
          <p className="text-text-secondary text-sm mb-6">
            Are you sure you want to download all {currentMedia.length} {activeTab} from "{event.title}"? 
            This will download a ZIP file containing the media.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowDownloadConfirm(false)} disabled={isDownloading}>
              Cancel
            </Button>
            <Button onClick={handleDownloadAll} loading={isDownloading}>
              Start Download
            </Button>
          </div>
          
          {/* Note about future architecture */}
          <div className="mt-6 flex items-start gap-2 bg-warning-light/50 p-3 rounded-lg text-left">
            <AlertCircle size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary">
              <strong className="text-navy font-semibold block">Architecture Note:</strong>
              In the real implementation, this will request a secure signed URL from the FastAPI backend, which streams the ZIP file directly from Cloudflare R2 object storage.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
