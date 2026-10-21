'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Video, Calendar, UploadCloud, Plus, X, Trash2, Edit2, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { mediaUrl } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  deleteMedia,
  GalleryEvent,
  MediaItem,
} from '@/lib/gallery';

export default function AdminGalleryPage() {
  const [events, setEvents] = useState<GalleryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const { showToast } = useToast();

  // Create form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    category: 'events',
    class_name: '',
    visibility: 'public' as 'public' | 'private',
  });
  const [creating, setCreating] = useState(false);

  // Edit event state
  const [editingEvent, setEditingEvent] = useState<GalleryEvent | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    event_date: '',
    category: 'events',
    class_name: '',
    visibility: 'public' as 'public' | 'private',
  });
  const [updating, setUpdating] = useState(false);

  // Moderate Media Modal state
  const [managingEvent, setManagingEvent] = useState<GalleryEvent | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await listEvents();
      setEvents(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newEvent.title || !newEvent.event_date) return;
    try {
      setCreating(true);
      await createEvent({
        title: newEvent.title,
        description: newEvent.description || undefined,
        event_date: newEvent.event_date,
        category: newEvent.category,
        class_name: newEvent.class_name || null,
        visibility: newEvent.visibility,
      });
      showToast('Event created successfully', 'success');
      setShowCreate(false);
      setNewEvent({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        category: 'events',
        class_name: '',
        visibility: 'public',
      });
      loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create event', 'error');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(event: GalleryEvent) {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description || '',
      event_date: event.event_date,
      category: event.category || 'events',
      class_name: event.class_name || '',
      visibility: event.visibility,
    });
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      setUpdating(true);
      await updateEvent(editingEvent.id, {
        title: editForm.title,
        description: editForm.description || undefined,
        event_date: editForm.event_date,
        category: editForm.category,
        class_name: editForm.class_name || null,
        visibility: editForm.visibility,
      });
      showToast('Event updated successfully', 'success');
      setEditingEvent(null);
      loadEvents();
    } catch (err: any) {
      showToast(err.message || 'Failed to update event', 'error');
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this event? All uploaded photos and videos in this event will also be deleted.')) {
      return;
    }
    try {
      await deleteEvent(id);
      showToast('Event deleted successfully', 'success');
      setEvents(events.filter(e => e.id !== id));
      if (managingEvent?.id === id) setManagingEvent(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete event', 'error');
    }
  }

  async function openMediaManager(event: GalleryEvent) {
    setManagingEvent(event);
    setLoadingMedia(true);
    try {
      const full = await getEvent(event.id);
      setManagingEvent(full);
    } catch (err: any) {
      showToast(err.message || 'Failed to load event media', 'error');
    } finally {
      setLoadingMedia(false);
    }
  }

  async function handleDeleteSingleMedia(mediaId: number) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteMedia(mediaId);
      showToast('Media deleted', 'success');
      if (managingEvent && managingEvent.media) {
        const nextMedia = managingEvent.media.filter(m => m.id !== mediaId);
        setManagingEvent({ ...managingEvent, media: nextMedia });
        setEvents(events.map(ev => ev.id === managingEvent.id ? {
          ...ev,
          photo_count: nextMedia.filter(m => m.media_type === 'image').length,
          video_count: nextMedia.filter(m => m.media_type === 'video').length,
        } : ev));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete media', 'error');
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-1">Gallery & Events Management</h1>
          <p className="text-text-secondary">Create and manage albums, public website events, and class galleries.</p>
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

      {/* Create Event Card */}
      {showCreate && (
        <Card className="border-school-blue/20 bg-soft-blue/10 animate-fade-in shadow-sm">
          <h2 className="text-xl font-bold text-navy mb-4">Create New Event Album</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Event Title *</label>
                <input 
                  type="text" 
                  required
                  value={newEvent.title} 
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white"
                  placeholder="e.g. Annual Sports Meet 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Date *</label>
                <input 
                  type="date" 
                  required
                  value={newEvent.event_date} 
                  onChange={e => setNewEvent({...newEvent, event_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Class / Audience</label>
                <input 
                  type="text"
                  value={newEvent.class_name} 
                  onChange={e => setNewEvent({...newEvent, class_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white"
                  placeholder="e.g. Class I (leave empty for Whole School)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Visibility</label>
                <select 
                  value={newEvent.visibility} 
                  onChange={e => setNewEvent({...newEvent, visibility: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white"
                >
                  <option value="public">Public (Visible on Website)</option>
                  <option value="private">Private (Parents & Staff Portal Only)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-navy mb-1">Description (Optional)</label>
                <textarea 
                  rows={2}
                  value={newEvent.description} 
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white resize-none"
                  placeholder="Brief note about the celebration or event..."
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={creating}>
                Create Album
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-16 text-text-muted">Loading albums...</div>
      ) : events.length === 0 ? (
        <Card className="text-center py-16 border-dashed bg-white">
          <Camera size={48} className="mx-auto text-text-muted mb-4 opacity-40" />
          <h3 className="text-lg font-bold text-navy mb-1">No Gallery Albums Yet</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto mb-4">
            Create an album and upload photos or videos to showcase on the school website and parent portal.
          </p>
          <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
            Create First Event
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} hover padding="none" className="h-full flex flex-col overflow-hidden border-border/60 relative group">
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
                  <Camera size={44} className="text-school-blue/30" />
                )}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge variant={event.class_name ? 'blue' : 'gold'} size="sm" className="shadow-sm">
                    {event.class_name || 'Whole School'}
                  </Badge>
                  {event.visibility === 'private' ? (
                    <Badge variant="gray" size="sm" className="shadow-sm">Private</Badge>
                  ) : (
                    <Badge variant="success" size="sm" className="shadow-sm">Public</Badge>
                  )}
                </div>

                {/* Quick actions top-right */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(event)}
                    className="p-2 bg-white/95 text-navy hover:text-school-blue hover:bg-white rounded-lg shadow-sm transition-colors"
                    title="Edit Event Details"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 bg-white/95 text-error hover:bg-error hover:text-white rounded-lg shadow-sm transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-navy text-lg leading-snug line-clamp-1">
                    {event.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted mb-3">
                  <Calendar size={13} />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                {event.description && (
                  <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
                    <span className="flex items-center gap-1"><Camera size={13} className="text-school-blue" /> {event.photo_count}</span>
                    <span className="flex items-center gap-1"><Video size={13} className="text-gold-dark" /> {event.video_count}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openMediaManager(event)}
                  >
                    Manage Media
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Event Details Modal */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title="Edit Event Details"
      >
        {editingEvent && (
          <form onSubmit={handleUpdate} className="space-y-4 p-1">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Title *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={e => setEditForm({...editForm, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={editForm.event_date}
                  onChange={e => setEditForm({...editForm, event_date: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-1">Visibility</label>
                <select
                  value={editForm.visibility}
                  onChange={e => setEditForm({...editForm, visibility: e.target.value as any})}
                  className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Class Name</label>
              <input
                type="text"
                value={editForm.class_name}
                onChange={e => setEditForm({...editForm, class_name: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="Leave blank for whole school"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy mb-1">Description</label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingEvent(null)}>Cancel</Button>
              <Button type="submit" loading={updating}>Save Changes</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Manage Event Media Modal */}
      <Modal
        isOpen={!!managingEvent}
        onClose={() => setManagingEvent(null)}
        title={`Photos & Videos: ${managingEvent?.title || ''}`}
        size="xl"
      >
        {managingEvent && (
          <div className="space-y-4 p-1">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs text-text-secondary font-medium">
                {managingEvent.media?.length || 0} media files attached
              </span>
              <Button
                size="sm"
                href={`/teacher/gallery/upload?eventId=${managingEvent.id}`}
                icon={<UploadCloud size={14} />}
              >
                Upload to this Album
              </Button>
            </div>

            {loadingMedia ? (
              <div className="text-center py-12 text-text-muted">Loading files...</div>
            ) : managingEvent.media && managingEvent.media.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {managingEvent.media.map((item) => (
                  <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group bg-black/5">
                    {item.media_type === 'image' ? (
                      <Image
                        src={mediaUrl(item.url)}
                        alt={item.file_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy/10">
                        <Video size={32} className="text-navy/40 mb-1" />
                        <span className="text-[10px] text-text-secondary truncate max-w-[80%]">{item.file_name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteSingleMedia(item.id)}
                      className="absolute top-2 right-2 p-1.5 bg-error text-white rounded-md opacity-0 group-hover:opacity-100 hover:bg-error-dark transition-all shadow-sm"
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted">
                No photos or videos in this album yet. Click &quot;Upload to this Album&quot; to add some.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
