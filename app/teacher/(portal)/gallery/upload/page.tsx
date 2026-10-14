'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, X, ArrowLeft, Image as ImageIcon, Video, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';

interface EventOut {
  id: number;
  title: string;
  class_name: string | null;
}

function UploadContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [events, setEvents] = useState<EventOut[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      const data = await api<EventOut[]>('/api/gallery/events');
      setEvents(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load events', 'error');
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      // Validate file size and type (backend limit is e.g. 50MB)
      const validFiles = newFiles.filter(f => {
        if (f.size > 50 * 1024 * 1024) {
          showToast(`File ${f.name} is too large (max 50MB)`, 'error');
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!selectedEventId) {
      showToast('Please select an event', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('visibility', 'public'); // or add a toggle for visibility

      await api(`/api/gallery/events/${selectedEventId}/media`, {
        method: 'POST',
        body: formData,
      });

      setSuccess(true);
      showToast(`Successfully uploaded ${selectedFiles.length} files`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    setSuccess(false);
    setSelectedEventId('');
  };

  if (success) {
    return (
      <Card className="text-center py-16 shadow-lg border-success/20 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-navy mb-3">Upload Complete!</h2>
        <p className="text-text-secondary mb-8">
          {selectedFiles.length} files have been successfully uploaded to the gallery.
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={resetForm}>
            Upload More Media
          </Button>
          <Button href="/teacher/gallery">
            Go to Gallery
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/teacher/gallery" className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-school-blue transition-colors">
        <ArrowLeft size={16} /> Back to Gallery
      </Link>

      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">Upload Media</h1>
        <p className="text-text-secondary">Upload photos and videos for your school events.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Form */}
        <Card className="space-y-6 shadow-md border-border/60">
          <div className="space-y-4">
            <h3 className="font-bold text-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-school-blue text-white flex items-center justify-center text-xs">1</span>
              Select Event
            </h3>

            <div className="space-y-1.5 animate-fade-in">
              <select 
                className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 bg-white"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                <option value="">-- Choose Event --</option>
                {events.map(e => (
                  <option key={e.id} value={e.id}>{e.title} {e.class_name ? `(${e.class_name})` : '(Whole School)'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-bold text-navy flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-school-blue text-white flex items-center justify-center text-xs">2</span>
              Choose Files
            </h3>
            
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-soft-blue/50 hover:bg-soft-blue transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud size={40} className="mx-auto text-school-blue mb-4" />
              <p className="font-semibold text-navy mb-1">Click to browse or drag and drop</p>
              <p className="text-xs text-text-secondary">JPG, PNG or MP4 (Max. 50MB per file)</p>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/mp4" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : ''}`}
            </Button>
            
            {isUploading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-navy mb-1">
                <Loader2 size={16} className="animate-spin text-school-blue" /> Uploading to server...
              </div>
            )}
          </div>
        </Card>

        {/* Selected Files List */}
        <div>
          <h3 className="font-bold text-navy mb-4 flex items-center justify-between">
            Selected Files
            <Badge variant="gray">{selectedFiles.length}</Badge>
          </h3>
          
          {selectedFiles.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border shadow-sm">
                  <div className="w-10 h-10 rounded bg-soft-blue flex items-center justify-center flex-shrink-0 text-school-blue">
                    {file.type.startsWith('video/') ? <Video size={18} /> : <ImageIcon size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{file.name}</p>
                    <p className="text-xs text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  {!isUploading && (
                    <button 
                      onClick={() => removeFile(idx)}
                      className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-border border-dashed h-48 flex flex-col items-center justify-center">
              <p className="text-sm text-text-secondary">No files selected yet</p>
            </div>
          )}

          {/* Architecture Note */}
          <div className="mt-6 flex items-start gap-3 bg-school-blue/5 p-4 rounded-xl border border-school-blue/20">
            <AlertCircle size={20} className="text-school-blue flex-shrink-0 mt-0.5" />
            <div className="text-sm text-text-secondary">
              <strong className="text-navy font-semibold block mb-1">Upload Note</strong>
              <p>Files are uploaded to the backend and stored securely. Large files may take a moment.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherUploadPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="animate-spin text-school-blue" size={32} /></div>}>
      <UploadContent />
    </Suspense>
  );
}

