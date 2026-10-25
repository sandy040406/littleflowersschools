'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, 
  Plus, 
  GraduationCap, 
  Mail, 
  Phone, 
  Clock, 
  UserCircle, 
  Edit, 
  Trash2, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  BookOpen,
  Building,
  Sparkles,
  Users
} from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { useToast } from '@/components/ui/Toast';
import { api, mediaUrl } from '@/lib/api';

export interface TeacherUser {
  id: number;
  name: string;
  role: 'teacher';
  email: string | null;
  phone: string | null;
  is_active: boolean;
  designation: string | null;
  subject: string | null;
  department: string | null;
  experience: string | null;
  bio: string | null;
  photo_url: string | null;
}

const COMMON_DEPARTMENTS = [
  'Kindergarten',
  'Primary School',
  'Middle School',
  'Secondary School',
  'Senior Secondary',
  'Languages',
  'Science',
  'Mathematics',
  'Social Studies',
  'Computer Science',
  'Arts & Music',
  'Physical Education',
];

export default function AdminFacultyPage() {
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<TeacherUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeacherUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  // Form states
  const initialTeacherForm = {
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    subject: '',
    department: 'Primary School',
    experience: '',
    bio: '',
    photo_url: '',
    is_active: true,
  };

  const [addForm, setAddForm] = useState(initialTeacherForm);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    subject: '',
    department: '',
    experience: '',
    bio: '',
    photo_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      setLoading(true);
      const data = await api<TeacherUser[]>('/api/admin/users?role=teacher');
      setTeachers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load faculty members', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Computed departments
  const availableDepartments = useMemo(() => {
    const set = new Set<string>(COMMON_DEPARTMENTS);
    teachers.forEach(t => {
      if (t.department) set.add(t.department);
    });
    return ['All', ...Array.from(set).sort()];
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.subject && t.subject.toLowerCase().includes(q)) ||
        (t.designation && t.designation.toLowerCase().includes(q)) ||
        (t.department && t.department.toLowerCase().includes(q));

      const matchesDept = deptFilter === 'All' || t.department === deptFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && t.is_active) ||
        (statusFilter === 'hidden' && !t.is_active);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [teachers, searchQuery, deptFilter, statusFilter]);

  // Stats
  const totalCount = teachers.length;
  const activeCount = teachers.filter(t => t.is_active).length;
  const hiddenCount = totalCount - activeCount;

  // Add teacher submission
  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.password.trim()) {
      showToast('Please fill in Name, Email, and Password.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api('/api/admin/teachers', {
        method: 'POST',
        body: {
          name: addForm.name.trim(),
          email: addForm.email.trim().toLowerCase(),
          password: addForm.password,
          phone: addForm.phone.trim() || null,
          designation: addForm.designation.trim() || null,
          subject: addForm.subject.trim() || null,
          department: addForm.department.trim() || null,
          experience: addForm.experience.trim() || null,
          bio: addForm.bio.trim() || null,
          photo_url: addForm.photo_url.trim() || null,
        },
      });

      showToast(`Faculty member "${addForm.name}" created successfully!`, 'success');
      setShowAddModal(false);
      setAddForm(initialTeacherForm);
      loadTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add faculty member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Edit open
  function openEditModal(teacher: TeacherUser) {
    setEditingTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      designation: teacher.designation || '',
      subject: teacher.subject || '',
      department: teacher.department || 'Primary School',
      experience: teacher.experience || '',
      bio: teacher.bio || '',
      photo_url: teacher.photo_url || '',
      is_active: teacher.is_active,
    });
  }

  // Edit save
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeacher) return;

    try {
      setIsUpdating(true);
      await api(`/api/admin/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        body: {
          name: editForm.name.trim(),
          email: editForm.email.trim().toLowerCase(),
          phone: editForm.phone.trim() || null,
          designation: editForm.designation.trim() || null,
          subject: editForm.subject.trim() || null,
          department: editForm.department.trim() || null,
          experience: editForm.experience.trim() || null,
          bio: editForm.bio.trim() || null,
          photo_url: editForm.photo_url.trim() || null,
          is_active: editForm.is_active,
        },
      });

      showToast('Faculty profile updated successfully!', 'success');
      setEditingTeacher(null);
      loadTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update faculty profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  }

  // Toggle Visibility
  async function handleToggleActive(teacher: TeacherUser) {
    try {
      const res = await api<{ message: string; is_active: boolean }>(
        `/api/admin/teachers/${teacher.id}/toggle-active`,
        { method: 'PUT' }
      );
      showToast(res.message, 'success');
      setTeachers(prev =>
        prev.map(t => (t.id === teacher.id ? { ...t, is_active: res.is_active } : t))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  }

  // Reset Password
  async function handleResetPassword(teacher: TeacherUser) {
    if (!confirm(`Generate a new temporary password for ${teacher.name}?`)) return;
    try {
      const res = await api<{ message: string; temporary_password: string | null }>(
        `/api/admin/users/${teacher.id}/reset-password`,
        { method: 'POST', body: {} }
      );
      if (res.temporary_password) {
        setResetResult({ name: teacher.name, password: res.temporary_password });
      } else {
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    }
  }

  // Delete
  async function handleDelete(permanent: boolean) {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await api<{ message: string }>(
        `/api/admin/teachers/${deleteTarget.id}?permanent=${permanent}`,
        { method: 'DELETE' }
      );
      showToast(res.message, 'success');
      setDeleteTarget(null);
      loadTeachers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete faculty member', 'error');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* ────────────────── HEADER ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy">Faculty & Teachers</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-school-blue/10 text-school-blue">
              Public /faculty CMS
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Manage teacher profiles, uploaded photos, qualifications, and live visibility on your school website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/faculty"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-border text-navy bg-white hover:bg-soft-blue transition-colors shadow-sm"
          >
            <span>Preview Public Page</span>
            <ExternalLink size={14} className="text-school-blue" />
          </Link>
          <Button
            onClick={() => setShowAddModal(true)}
            icon={<Plus size={16} />}
          >
            Add Faculty Member
          </Button>
        </div>
      </div>

      {/* ────────────────── STATS ROW ────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="flex items-center gap-4 bg-white border-l-4 border-l-school-blue shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-school-blue/10 flex items-center justify-center text-school-blue shrink-0">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted">Total Teachers</p>
            <p className="text-2xl font-bold text-navy">{totalCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-l-4 border-l-emerald-500 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted">Visible on Website</p>
            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-l-4 border-l-amber-500 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <EyeOff size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted">Hidden / Inactive</p>
            <p className="text-2xl font-bold text-amber-600">{hiddenCount}</p>
          </div>
        </Card>

        <Card padding="md" className="flex items-center gap-4 bg-white border-l-4 border-l-navy shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0">
            <Building size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-text-muted">Departments</p>
            <p className="text-2xl font-bold text-navy">{Math.max(1, availableDepartments.length - 1)}</p>
          </div>
        </Card>
      </div>

      {/* ────────────────── SEARCH & FILTERS ────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search by teacher name, subject, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <span>Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-xs bg-white text-navy focus:outline-none focus:ring-2 focus:ring-school-blue/20"
            >
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          {/* Visibility Status Filter */}
          <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
            <span>Visibility:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-border rounded-lg text-xs bg-white text-navy focus:outline-none focus:ring-2 focus:ring-school-blue/20"
            >
              <option value="all">All ({totalCount})</option>
              <option value="active">Visible ({activeCount})</option>
              <option value="hidden">Hidden ({hiddenCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* ────────────────── FACULTY GRID ────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-border">
          <Loader2 size={36} className="animate-spin text-school-blue mb-3" />
          <p className="text-sm font-medium text-navy">Loading faculty members...</p>
        </div>
      ) : filteredTeachers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              padding="none"
              className={`flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg ${
                !teacher.is_active ? 'opacity-75 bg-slate-50/80 border-dashed' : 'bg-white'
              }`}
            >
              {/* Photo & Top Badges */}
              <div className="relative h-60 bg-gradient-to-br from-soft-blue to-blue-50 flex items-center justify-center overflow-hidden group">
                {teacher.photo_url ? (
                  <Image
                    src={mediaUrl(teacher.photo_url)}
                    alt={teacher.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-school-blue/30">
                    <UserCircle size={80} strokeWidth={1.5} />
                    <span className="text-xs font-medium text-text-muted mt-2">No photo uploaded</span>
                  </div>
                )}

                {/* Visibility Badge */}
                <div className="absolute top-3 left-3">
                  {teacher.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
                      <CheckCircle2 size={12} />
                      <span>Live on Website</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-700/80 backdrop-blur-md text-white shadow-sm">
                      <EyeOff size={12} />
                      <span>Hidden</span>
                    </span>
                  )}
                </div>

                {/* Subject Badge */}
                {teacher.subject && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-navy text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-border/50">
                    {teacher.subject}
                  </div>
                )}
              </div>

              {/* Teacher Info */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-lg font-bold text-navy leading-snug">{teacher.name}</h3>
                </div>

                <p className="text-school-blue font-semibold text-xs tracking-wide uppercase mb-3">
                  {teacher.designation || 'Faculty Member'}
                </p>

                {teacher.department && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-soft-blue text-navy border border-school-blue/20">
                      <Building size={11} className="text-school-blue" />
                      {teacher.department}
                    </span>
                  </div>
                )}

                {teacher.bio ? (
                  <p className="text-text-secondary text-xs leading-relaxed italic line-clamp-3 mb-4 flex-grow bg-slate-50/70 p-2.5 rounded-lg border border-border/50">
                    &ldquo;{teacher.bio}&rdquo;
                  </p>
                ) : (
                  <p className="text-text-muted text-xs italic mb-4 flex-grow">
                    No bio description provided yet.
                  </p>
                )}

                <div className="space-y-1.5 pt-3 border-t border-border text-xs text-text-secondary">
                  {teacher.experience && (
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-amber-500 shrink-0" />
                      <span>{teacher.experience} Experience</span>
                    </div>
                  )}
                  {teacher.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-school-blue shrink-0" />
                      <a href={`mailto:${teacher.email}`} className="truncate hover:text-school-blue transition-colors">
                        {teacher.email}
                      </a>
                    </div>
                  )}
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-emerald-500 shrink-0" />
                      <span>{teacher.phone}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                    onClick={() => openEditModal(teacher)}
                    icon={<Edit size={13} />}
                  >
                    Edit Profile
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(teacher)}
                    className={`p-2 rounded-lg border text-xs transition-colors ${
                      teacher.is_active
                        ? 'border-border text-text-secondary hover:text-amber-600 hover:bg-amber-50'
                        : 'border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                    title={teacher.is_active ? 'Hide from public faculty page' : 'Make visible on public faculty page'}
                  >
                    {teacher.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetPassword(teacher)}
                    className="p-2 rounded-lg border border-border text-text-secondary hover:text-school-blue hover:bg-soft-blue transition-colors"
                    title="Reset Teacher Portal Password"
                  >
                    <KeyRound size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(teacher)}
                    className="p-2 rounded-lg border border-border text-text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove or Deactivate Teacher"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-border border-dashed shadow-sm">
          <div className="w-16 h-16 rounded-full bg-soft-blue text-school-blue flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} />
          </div>
          <h3 className="text-lg font-bold text-navy mb-1">No faculty members found</h3>
          <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
            {searchQuery || deptFilter !== 'All' || statusFilter !== 'all'
              ? 'No teachers match your search or filter criteria. Try clearing filters.'
              : 'Start by adding your school educators and uploading their profile photos.'}
          </p>
          <Button onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
            Add First Faculty Member
          </Button>
        </div>
      )}

      {/* ────────────────── MODAL: ADD FACULTY MEMBER ────────────────── */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Faculty Member"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="p-3 bg-soft-blue/60 border border-school-blue/20 rounded-xl flex items-start gap-2.5 text-xs text-text-secondary">
              <Sparkles size={16} className="text-school-blue shrink-0 mt-0.5" />
              <span>
                Adding a teacher will automatically create their portal login credentials and showcase them on your website&apos;s public <strong>/faculty</strong> page.
              </span>
            </div>

            {/* Profile Photo Uploader */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-border">
              <label className="block text-xs font-bold text-navy mb-2">Teacher Profile Photo</label>
              <ImageUploadField
                value={addForm.photo_url}
                onChange={(url) => setAddForm({ ...addForm, photo_url: url })}
                label=""
                aspectRatio="square"
                className="max-w-[220px] mx-auto"
              />
              <p className="text-[11px] text-text-muted text-center mt-1.5">
                Recommended: Square passport/portrait photo (JPG or PNG up to 5MB)
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. K. Radhakrishnan"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior PGT Mathematics"
                  value={addForm.designation}
                  onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={addForm.subject}
                  onChange={(e) => setAddForm({ ...addForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Department</label>
                <select
                  value={addForm.department}
                  onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20 bg-white"
                >
                  {COMMON_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Experience</label>
                <input
                  type="text"
                  placeholder="e.g. 10+ Years"
                  value={addForm.experience}
                  onChange={(e) => setAddForm({ ...addForm, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            {/* Login Credentials & Contact */}
            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Email Address (Login ID) *</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@littleflowersschools.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Contact Phone</label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Short Bio / Teaching Philosophy</label>
              <textarea
                rows={3}
                placeholder="Share a quote or brief description about their passion for education and mentoring students..."
                value={addForm.bio}
                onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {isSubmitting ? 'Creating Teacher...' : 'Save & Add Faculty'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────── MODAL: EDIT FACULTY MEMBER ────────────────── */}
      {editingTeacher && (
        <Modal
          isOpen={!!editingTeacher}
          onClose={() => setEditingTeacher(null)}
          title={`Edit Faculty Profile: ${editingTeacher.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Profile Photo Uploader */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-border">
              <label className="block text-xs font-bold text-navy mb-2">Teacher Profile Photo</label>
              <ImageUploadField
                value={editForm.photo_url}
                onChange={(url) => setEditForm({ ...editForm, photo_url: url })}
                label=""
                aspectRatio="square"
                className="max-w-[220px] mx-auto"
              />
              <p className="text-[11px] text-text-muted text-center mt-1.5">
                Upload or change teacher&apos;s photo (Square JPG/PNG recommended)
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Designation</label>
                <input
                  type="text"
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Subject</label>
                <input
                  type="text"
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Department</label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20 bg-white"
                >
                  {COMMON_DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Experience</label>
                <input
                  type="text"
                  value={editForm.experience}
                  onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Bio / Profile Description</label>
              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-school-blue/20"
              />
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="edit_teacher_is_active"
                checked={editForm.is_active}
                onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                className="rounded border-border text-school-blue focus:ring-school-blue w-4 h-4"
              />
              <label htmlFor="edit_teacher_is_active" className="text-xs font-bold text-navy cursor-pointer">
                Visible on public website (/faculty page)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                icon={isUpdating ? <Loader2 size={16} className="animate-spin" /> : undefined}
              >
                {isUpdating ? 'Saving...' : 'Update Faculty Profile'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────── MODAL: RESET PASSWORD RESULT ────────────────── */}
      {resetResult && (
        <Modal
          isOpen={!!resetResult}
          onClose={() => setResetResult(null)}
          title="Teacher Password Reset"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              A temporary password has been generated for <strong>{resetResult.name}</strong>. Provide this to the teacher for signing into the Teacher Portal:
            </p>
            <div className="p-3 bg-soft-blue border border-school-blue/30 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-navy">
              <span>{resetResult.password}</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.password);
                  showToast('Password copied to clipboard!', 'info');
                }}
                className="text-xs text-school-blue hover:underline font-sans font-semibold"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-text-muted">
              The teacher will be prompted to choose a new password upon their next login.
            </p>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setResetResult(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ────────────────── MODAL: DELETE / DEACTIVATE CONFIRMATION ────────────────── */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title={`Remove Faculty Member: ${deleteTarget.name}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              What action would you like to perform for <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-border bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-navy">Deactivate (Recommended)</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Hides the teacher from the public website immediately while preserving past records.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(false)}
                  disabled={isDeleting}
                >
                  Deactivate
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-red-700">Permanently Delete</h4>
                  <p className="text-xs text-red-600/80 mt-0.5">
                    Completely removes the teacher account from the database. This action cannot be undone.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDelete(true)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
