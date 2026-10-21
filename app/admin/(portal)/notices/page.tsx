'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Pin, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Download, 
  Clock, 
  GraduationCap, 
  FileText,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { 
  getAdminNotices, 
  createAdminNotice, 
  updateAdminNotice, 
  deleteAdminNotice, 
  toggleNoticePinned, 
  toggleNoticeActive, 
  Notice, 
  NoticeCategory, 
  NOTICE_CATEGORIES, 
  SCHOOL_CLASSES 
} from '@/lib/notices';
import { formatDate } from '@/lib/utils';
import { mediaUrl } from '@/lib/api';

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NoticeCategory>('circular');
  const [formTargetClass, setFormTargetClass] = useState<string>('Whole School');
  const [formPublishDate, setFormPublishDate] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formContent, setFormContent] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await getAdminNotices();
      setNotices(data || []);
    } catch (err: any) {
      showToast(err?.message || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, []);

  const openCreateModal = () => {
    setEditingNotice(null);
    setFormTitle('');
    setFormCategory('circular');
    setFormTargetClass('Whole School');
    setFormPublishDate(new Date().toISOString().split('T')[0]);
    setFormAttachmentUrl('');
    setFormIsPinned(false);
    setFormIsActive(true);
    setFormContent('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setFormTitle(notice.title);
    setFormCategory(notice.category);
    setFormTargetClass(notice.target_class || 'Whole School');
    setFormPublishDate(notice.publish_date);
    setFormAttachmentUrl(notice.attachment_url || '');
    setFormIsPinned(notice.is_pinned);
    setFormIsActive(notice.is_active);
    setFormContent(notice.content);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Notice title is required.');
      return;
    }
    if (!formContent.trim()) {
      setFormError('Notice content is required.');
      return;
    }

    try {
      setActionLoading(true);
      setFormError(null);

      const payload = {
        title: formTitle.trim(),
        content: formContent.trim(),
        category: formCategory,
        target_class: formTargetClass === 'Whole School' ? null : formTargetClass,
        attachment_url: formAttachmentUrl.trim() || null,
        publish_date: formPublishDate || new Date().toISOString().split('T')[0],
        is_pinned: formIsPinned,
        is_active: formIsActive,
      };

      if (editingNotice) {
        const updated = await updateAdminNotice(editingNotice.id, payload);
        setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        showToast('Circular updated successfully');
      } else {
        const created = await createAdminNotice(payload);
        setNotices((prev) => [created, ...prev]);
        showToast('New circular published successfully');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save circular');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePinned = async (notice: Notice) => {
    try {
      const updated = await toggleNoticePinned(notice.id);
      setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      showToast(updated.is_pinned ? 'Notice pinned to top' : 'Notice unpinned');
    } catch (err: any) {
      showToast(err?.message || 'Failed to toggle pin', 'error');
    }
  };

  const handleToggleActive = async (notice: Notice) => {
    try {
      const updated = await toggleNoticeActive(notice.id);
      setNotices((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      showToast(updated.is_active ? 'Notice activated' : 'Notice deactivated');
    } catch (err: any) {
      showToast(err?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!noticeToDelete) return;
    try {
      setActionLoading(true);
      await deleteAdminNotice(noticeToDelete.id);
      setNotices((prev) => prev.filter((n) => n.id !== noticeToDelete.id));
      showToast('Notice permanently deleted');
      setNoticeToDelete(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete notice', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered List
  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchSearch = !searchQuery || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.target_class && n.target_class.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = categoryFilter === 'all' || n.category.toLowerCase() === categoryFilter.toLowerCase();
      
      const matchClass = classFilter === 'all' || 
        (classFilter === '__whole__' && !n.target_class) ||
        (n.target_class === classFilter);

      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && n.is_active) || 
        (statusFilter === 'inactive' && !n.is_active);

      return matchSearch && matchCategory && matchClass && matchStatus;
    });
  }, [notices, searchQuery, categoryFilter, classFilter, statusFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = notices.length;
    const active = notices.filter(n => n.is_active).length;
    const pinned = notices.filter(n => n.is_pinned).length;
    const targeted = notices.filter(n => !!n.target_class).length;
    return { total, active, pinned, targeted };
  }, [notices]);

  const getCategoryBadgeClass = (cat: string) => {
    const found = NOTICE_CATEGORIES.find(c => c.value === cat.toLowerCase());
    return found ? found.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold transition-all ${
            toastMessage.type === 'success'
              ? 'bg-success text-white'
              : 'bg-danger text-white'
          }`}
        >
          {toastMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toastMessage.text}
        </div>
      )}

      {/* Header & New Notice Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Bell size={24} className="text-school-blue" /> Notices & Circulars Manager
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Publish school-wide announcements, class-specific circulars, exam dates, and holiday notifications.
          </p>
        </div>

        <Button onClick={openCreateModal} className="flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} /> Publish Circular
        </Button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-gray-100">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Circulars</p>
            <p className="text-2xl font-bold text-navy mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-soft-blue flex items-center justify-center text-school-blue">
            <FileText size={20} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-gray-100">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Active & Visible</p>
            <p className="text-2xl font-bold text-success mt-1">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-success">
            <CheckCircle size={20} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-gray-100">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Pinned to Top</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pinned}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <Pin size={20} className="rotate-45" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-gray-100">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Class-Targeted</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.targeted}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <GraduationCap size={20} />
          </div>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 space-y-4">
        <div className="grid sm:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-2 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, body, or class..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
            />
          </div>

          {/* Target class filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
            >
              <option value="all">All Audiences</option>
              <option value="__whole__">Whole School Only</option>
              {SCHOOL_CLASSES.map((cls) => (
                <option key={cls} value={cls}>Target: {cls}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-text-muted uppercase mr-1">Category:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {NOTICE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat.value
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notices Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin text-school-blue mb-3" />
          <p className="text-sm">Loading circulars database...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="p-12 text-center text-text-secondary">
          <Bell size={40} className="mx-auto text-text-muted mb-3 opacity-50" />
          <h3 className="text-base font-bold text-navy mb-1">No circulars match current filters</h3>
          <p className="text-sm max-w-sm mx-auto mb-4">
            Try resetting your search query or filters to see all available school circulars.
          </p>
          <Button onClick={openCreateModal} size="sm">
            Publish New Circular
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              hover
              className={`p-5 transition-all border-l-4 ${
                notice.is_pinned
                  ? 'border-l-gold bg-amber-50/15'
                  : !notice.is_active
                  ? 'border-l-gray-300 opacity-70 bg-gray-50/50'
                  : notice.target_class
                  ? 'border-l-purple-600'
                  : 'border-l-school-blue'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Notice Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Pin button */}
                    <button
                      onClick={() => handleTogglePinned(notice)}
                      title={notice.is_pinned ? 'Unpin notice' : 'Pin notice to top'}
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${
                        notice.is_pinned
                          ? 'bg-gold/20 text-navy border-gold hover:bg-gold/30'
                          : 'bg-gray-100 text-gray-500 border-gray-200 hover:text-navy hover:bg-gray-200'
                      }`}
                    >
                      <Pin size={11} className={notice.is_pinned ? 'rotate-45' : ''} />
                      {notice.is_pinned ? 'Pinned' : 'Pin'}
                    </button>

                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                        notice.category
                      )}`}
                    >
                      {notice.category.toUpperCase()}
                    </span>

                    {notice.target_class ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        <GraduationCap size={13} /> For: {notice.target_class}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-text-muted px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                        Whole School (Public)
                      </span>
                    )}

                    <span className="text-xs text-text-muted flex items-center gap-1 ml-auto sm:ml-0">
                      <Clock size={12} /> {formatDate(notice.publish_date)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-navy">
                    {notice.title}
                  </h3>

                  <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                    {notice.content}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted pt-1">
                    {notice.attachment_url && (
                      <a
                        href={mediaUrl(notice.attachment_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-school-blue font-semibold hover:underline"
                      >
                        <Download size={13} /> View Attached Document
                      </a>
                    )}
                    <span>Author: {notice.author_name || 'Admin'}</span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(notice)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      notice.is_active
                        ? 'bg-emerald-50 text-success border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-text-muted border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {notice.is_active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {notice.is_active ? 'Active' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-1.5 mt-1">
                    <button
                      onClick={() => openEditModal(notice)}
                      title="Edit Notice"
                      className="p-1.5 rounded-lg border border-gray-200 text-text-secondary hover:text-school-blue hover:border-school-blue/40 transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setNoticeToDelete(notice)}
                      title="Delete Notice"
                      className="p-1.5 rounded-lg border border-danger/20 text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNotice ? 'Edit Circular / Notice' : 'Publish New Circular / Notice'}
        size="lg"
      >
        <form onSubmit={handleSaveNotice} className="space-y-4 p-2">
          {formError && (
            <div className="p-3 bg-danger/10 text-danger border border-danger/20 rounded-lg text-sm">
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-1">
              Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Annual Sports Day 2026 Guidelines"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as NoticeCategory)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
              >
                {NOTICE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1">
                Target Audience
              </label>
              <select
                value={formTargetClass}
                onChange={(e) => setFormTargetClass(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
              >
                <option value="Whole School">Whole School (Public & All Parents)</option>
                {SCHOOL_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    Target: {cls} Only (Parent Portal)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-text-muted mt-1">
                Targeted notices are shown only to parents of students in that grade.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Publish Date */}
            <div>
              <label className="block text-xs font-bold text-navy uppercase mb-1">
                Publish Date (YYYY-MM-DD)
              </label>
              <input
                type="date"
                value={formPublishDate}
                onChange={(e) => setFormPublishDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
              />
            </div>

            {/* Pinned & Active Toggles */}
            <div className="flex items-center gap-6 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 text-school-blue rounded border-gray-300 focus:ring-school-blue"
                />
                <Pin size={14} className="text-amber-500 rotate-45" /> Pin to Top
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-navy">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-school-blue rounded border-gray-300 focus:ring-school-blue"
                />
                Active (Published)
              </label>
            </div>
          </div>

          {/* Attachment Image/Doc Uploader */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-1">
              Attachment (Optional Document or Image)
            </label>
            <ImageUploadField
              label=""
              value={formAttachmentUrl}
              onChange={(url) => setFormAttachmentUrl(url)}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-navy uppercase mb-1">
              Notice Content <span className="text-danger">*</span>
            </label>
            <textarea
              rows={6}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Type the full announcement, guidelines, examination instructions, or holiday details..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
              required
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading} className="flex items-center gap-2">
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              {editingNotice ? 'Update Notice' : 'Publish Notice'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===== DELETE CONFIRM MODAL ===== */}
      <Modal
        isOpen={!!noticeToDelete}
        onClose={() => setNoticeToDelete(null)}
        title="Delete Circular / Notice"
        size="sm"
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-text-secondary">
            Are you sure you want to permanently delete{' '}
            <strong className="text-navy">{noticeToDelete?.title}</strong>? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setNoticeToDelete(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={actionLoading}
              className="flex items-center gap-2"
            >
              {actionLoading && <Loader2 size={16} className="animate-spin" />}
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
