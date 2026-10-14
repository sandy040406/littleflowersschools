'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, GripVertical, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { api, mediaUrl } from '@/lib/api';
import type { HeroSlide } from '@/lib/content';

export default function SliderAdminPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Partial<HeroSlide> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const fetchSlides = async () => {
    try {
      const data = await api<HeroSlide[]>('/api/content/slides', { auth: true });
      setSlides(data);
    } catch (err) {
      console.error('Failed to load slides', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const toggleStatus = async (slide: HeroSlide) => {
    try {
      const updated = await api<HeroSlide>(`/api/content/slides/${slide.id}`, {
        method: 'PUT',
        body: { is_active: !slide.is_active },
        auth: true,
      });
      setSlides(slides.map(s => s.id === slide.id ? updated : s));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const deleteSlide = async (id: number) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        await api(`/api/content/slides/${id}`, { method: 'DELETE', auth: true });
        setSlides(slides.filter(s => s.id !== id));
      } catch (err) {
        alert('Failed to delete slide.');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide?.title || !editingSlide?.image_url) {
      alert('Title and Image are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingSlide.id) {
        const updated = await api<HeroSlide>(`/api/content/slides/${editingSlide.id}`, {
          method: 'PUT',
          body: {
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            description: editingSlide.description,
            image_url: editingSlide.image_url,
            cta_label: editingSlide.cta_label,
            cta_link: editingSlide.cta_link,
            is_active: editingSlide.is_active,
          },
          auth: true,
        });
        setSlides(slides.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await api<HeroSlide>('/api/content/slides', {
          method: 'POST',
          body: {
            ...editingSlide,
            is_active: editingSlide.is_active ?? true,
            display_order: slides.length + 1,
          },
          auth: true,
        });
        setSlides([...slides, created]);
      }
      setIsModalOpen(false);
      setEditingSlide(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save slide');
    } finally {
      setIsSaving(false);
    }
  };

  const openNewSlideModal = () => {
    setEditingSlide({ title: '', subtitle: '', description: '', image_url: '', cta_label: '', cta_link: '', is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  // Drag and Drop reordering
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    // Reorder local state instantly for UI feedback
    const newSlides = [...slides];
    const draggedItem = newSlides[draggedIdx];
    newSlides.splice(draggedIdx, 1);
    newSlides.splice(index, 0, draggedItem);
    setDraggedIdx(index);
    setSlides(newSlides);
  };

  const handleDragEnd = async () => {
    setDraggedIdx(null);
    try {
      const ids = slides.map(s => s.id);
      const reordered = await api<HeroSlide[]>('/api/content/slides/reorder', {
        method: 'PUT',
        body: { ids },
        auth: true,
      });
      setSlides(reordered);
    } catch (err) {
      alert('Failed to save new order');
      fetchSlides(); // Revert
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 size={32} className="animate-spin text-school-blue" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Manage Hero Slider</h1>
          <p className="text-text-secondary">Upload and manage images for the home page slider.</p>
        </div>
        <Button onClick={openNewSlideModal} className="shrink-0 bg-school-blue hover:bg-school-blue-dark">
          <Plus size={18} className="mr-2" />
          Add New Slide
        </Button>
      </div>

      <div className="space-y-4">
        {slides.map((slide, index) => (
          <Card 
            key={slide.id} 
            padding="none" 
            className={`overflow-hidden flex flex-col sm:flex-row ${draggedIdx === index ? 'opacity-50' : ''}`}
            draggable
            onDragStart={(e: React.DragEvent) => handleDragStart(e, index)}
            onDragOver={(e: React.DragEvent) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <div className="bg-soft-blue w-full sm:w-48 h-32 sm:h-auto relative shrink-0">
              <Image 
                src={mediaUrl(slide.image_url)}
                alt={slide.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {slide.subtitle && (
                    <span className="text-xs font-semibold text-gold tracking-wider uppercase">
                      {slide.subtitle}
                    </span>
                  )}
                  {!slide.is_active && (
                    <span className="text-[10px] bg-border px-2 py-0.5 rounded-full text-text-secondary">Draft</span>
                  )}
                </div>
                <h3 className="font-bold text-navy text-lg leading-tight mb-1">{slide.title}</h3>
                <p className="text-sm text-text-muted">Order: {slide.display_order}</p>
              </div>

              <div className="flex items-center gap-2 sm:border-l sm:border-border sm:pl-4">
                <button 
                  onClick={() => toggleStatus(slide)}
                  className="p-2 text-text-muted hover:text-school-blue rounded-lg hover:bg-school-blue/10 transition-colors flex flex-col items-center gap-1"
                  title={slide.is_active ? 'Deactivate' : 'Activate'}
                >
                  {slide.is_active ? <CheckCircle size={20} className="text-success" /> : <XCircle size={20} />}
                </button>
                <button 
                  onClick={() => openEditModal(slide)}
                  className="p-2 text-text-muted hover:text-gold-dark rounded-lg hover:bg-gold/10 transition-colors"
                  title="Edit Slide"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteSlide(slide.id)}
                  className="p-2 text-text-muted hover:text-error rounded-lg hover:bg-error/10 transition-colors"
                  title="Delete Slide"
                >
                  <Trash2 size={18} />
                </button>
                <div className="cursor-grab active:cursor-grabbing p-2 text-border hover:text-text-muted ml-2 hidden sm:block">
                  <GripVertical size={20} />
                </div>
              </div>
            </div>
          </Card>
        ))}
        {slides.length === 0 && (
          <div className="p-12 text-center text-text-muted border border-dashed border-border rounded-xl">
            No slides found. Click "Add New Slide" to create one.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-navy">{editingSlide?.id ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-navy">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <ImageUploadField
                label="Slide Image"
                value={editingSlide?.image_url || ''}
                onChange={(url) => setEditingSlide(prev => ({ ...prev!, image_url: url }))}
                aspectRatio="video"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={editingSlide?.title || ''}
                    onChange={(e) => setEditingSlide(prev => ({ ...prev!, title: e.target.value }))}
                    className="w-full border-border rounded-lg"
                    placeholder="e.g. Welcome to Little Flowers"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={editingSlide?.subtitle || ''}
                    onChange={(e) => setEditingSlide(prev => ({ ...prev!, subtitle: e.target.value }))}
                    className="w-full border-border rounded-lg"
                    placeholder="e.g. ADMISSIONS OPEN"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy mb-1">Description</label>
                <textarea
                  value={editingSlide?.description || ''}
                  onChange={(e) => setEditingSlide(prev => ({ ...prev!, description: e.target.value }))}
                  className="w-full border-border rounded-lg h-24"
                  placeholder="Optional supporting text..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Button Label</label>
                  <input
                    type="text"
                    value={editingSlide?.cta_label || ''}
                    onChange={(e) => setEditingSlide(prev => ({ ...prev!, cta_label: e.target.value }))}
                    className="w-full border-border rounded-lg"
                    placeholder="e.g. Learn More"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Button Link</label>
                  <input
                    type="text"
                    value={editingSlide?.cta_link || ''}
                    onChange={(e) => setEditingSlide(prev => ({ ...prev!, cta_link: e.target.value }))}
                    className="w-full border-border rounded-lg"
                    placeholder="e.g. /about"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editingSlide?.is_active ?? true}
                  onChange={(e) => setEditingSlide(prev => ({ ...prev!, is_active: e.target.checked }))}
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
                  {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Save Slide'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
