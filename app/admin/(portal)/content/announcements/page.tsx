'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import type { Announcement } from '@/lib/content';

export default function AnnouncementsAdminPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const data = await api<Announcement[]>('/api/content/announcements', { auth: true });
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const toggleStatus = async (announcement: Announcement) => {
    try {
      const updated = await api<Announcement>(`/api/content/announcements/${announcement.id}`, {
        method: 'PUT',
        body: { is_active: !announcement.is_active },
        auth: true,
      });
      setAnnouncements(announcements.map(a => a.id === announcement.id ? updated : a));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const deleteAnnouncement = async (id: number) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api(`/api/content/announcements/${id}`, { method: 'DELETE', auth: true });
        setAnnouncements(announcements.filter(a => a.id !== id));
      } catch (err) {
        alert('Failed to delete announcement.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnnouncement?.text) {
      alert('Announcement text is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingAnnouncement.id) {
        const updated = await api<Announcement>(`/api/content/announcements/${editingAnnouncement.id}`, {
          method: 'PUT',
          body: {
            text: editingAnnouncement.text,
            link: editingAnnouncement.link || null,
            priority: editingAnnouncement.priority,
            start_date: editingAnnouncement.start_date || null,
            end_date: editingAnnouncement.end_date || null,
            is_active: editingAnnouncement.is_active,
          },
          auth: true,
        });
        setAnnouncements(announcements.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await api<Announcement>('/api/content/announcements', {
          method: 'POST',
          body: {
            ...editingAnnouncement,
            is_active: editingAnnouncement.is_active ?? true,
          },
          auth: true,
        });
        setAnnouncements([created, ...announcements]); // prepend
      }
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save announcement');
    } finally {
      setIsSaving(false);
    }
  };

  const openNewModal = () => {
    setEditingAnnouncement({ 
      text: '', 
      link: '', 
      priority: 'info', 
      start_date: '', 
      end_date: '', 
      is_active: true 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 size={32} className="animate-spin text-school-blue" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Manage Announcements</h1>
          <p className="text-text-secondary">Create and manage alerts displayed on the home page.</p>
        </div>
        <Button onClick={openNewModal} className="shrink-0 bg-school-blue hover:bg-school-blue-dark">
          <Plus size={18} className="mr-2" />
          New Announcement
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-soft-blue/50 border-b border-border text-sm text-text-secondary">
                <th className="px-6 py-4 font-medium w-1/2">Announcement Text</th>
                <th className="px-6 py-4 font-medium">Priority / Dates</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-soft-blue/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-navy font-medium line-clamp-2">
                      {announcement.text}
                    </p>
                    {announcement.link && (
                      <a href={announcement.link} className="text-xs text-school-blue hover:underline mt-1 inline-block">
                        {announcement.link}
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        announcement.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        announcement.priority === 'important' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {announcement.priority}
                      </span>
                      {(announcement.start_date || announcement.end_date) && (
                        <span className="text-xs text-text-muted">
                          {announcement.start_date || 'Any'} &rarr; {announcement.end_date || 'Any'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span 
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        announcement.is_active 
                          ? 'bg-success/10 text-success' 
                          : 'bg-text-muted/10 text-text-muted'
                      }`}
                    >
                      {announcement.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {announcement.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(announcement)}
                        className="p-2 text-text-muted hover:text-school-blue rounded-lg hover:bg-school-blue/10 transition-colors"
                        title={announcement.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.is_active ? <XCircle size={16} /> : <CheckCircle size={16} />}
                      </button>
                      <button 
                        onClick={() => openEditModal(announcement)}
                        className="p-2 text-text-muted hover:text-gold-dark rounded-lg hover:bg-gold/10 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteAnnouncement(announcement.id)}
                        className="p-2 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-text-muted">
                    No announcements found. Click "New Announcement" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-navy">{editingAnnouncement?.id ? 'Edit Announcement' : 'New Announcement'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-navy">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Announcement Text *</label>
                <textarea
                  required
                  value={editingAnnouncement?.text || ''}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, text: e.target.value }))}
                  className="w-full border-border rounded-lg h-24"
                  placeholder="e.g. Admissions open for 2025-2026!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Link (Optional)</label>
                <input
                  type="text"
                  value={editingAnnouncement?.link || ''}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, link: e.target.value }))}
                  className="w-full border-border rounded-lg"
                  placeholder="e.g. /enquiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy mb-1">Priority</label>
                <select
                  value={editingAnnouncement?.priority || 'info'}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, priority: e.target.value as any }))}
                  className="w-full border-border rounded-lg"
                >
                  <option value="info">Info</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Start Date (Optional)</label>
                  <input
                    type="date"
                    value={editingAnnouncement?.start_date || ''}
                    onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, start_date: e.target.value }))}
                    className="w-full border-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={editingAnnouncement?.end_date || ''}
                    onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, end_date: e.target.value }))}
                    className="w-full border-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingAnnouncement?.is_active ?? true}
                  onChange={(e) => setEditingAnnouncement(prev => ({ ...prev!, is_active: e.target.checked }))}
                  className="rounded text-school-blue focus:ring-school-blue w-5 h-5 border-border"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-navy">
                  Active (visible on homepage)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="min-w-32">
                  {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save Announcement'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
