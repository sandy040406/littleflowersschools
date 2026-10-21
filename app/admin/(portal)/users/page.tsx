'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Plus, UserCircle, Mail, Phone, MoreVertical, X, Shield, BookOpen, GraduationCap, RefreshCw, Trash2, KeyRound } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';

type RoleFilter = 'all' | 'parent' | 'teacher' | 'admin';

interface UserOut {
  id: number;
  name: string;
  role: 'admin' | 'teacher' | 'parent';
  email: string | null;
  phone: string | null;
  is_active: boolean;
  admission_number: string | null;
  designation: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'teacher' | 'student'>('teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '', phone: '', designation: '' });
  const [studentForm, setStudentForm] = useState({ name: '', admission_number: '', date_of_birth: '', class_name: '', parent_name: '', parent_phone: '', parent_email: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await api<UserOut[]>('/api/admin/users');
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                            (user.email && user.email.toLowerCase().includes(search.toLowerCase())) ||
                            (user.admission_number && user.admission_number.toLowerCase().includes(search.toLowerCase()));
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, search]);

  async function handleToggleStatus(user: UserOut) {
    if (user.role === 'admin') {
      showToast("Cannot modify admin status.", 'error');
      return;
    }
    
    const actionStr = user.is_active ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionStr} ${user.name}?`)) return;

    try {
      if (user.is_active) {
        await api(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      } else {
        await api(`/api/admin/users/${user.id}/activate`, { method: 'PUT' });
      }
      showToast(`User ${actionStr}d successfully`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || `Failed to ${actionStr} user`, 'error');
    }
  }

  async function handleResetPassword(user: UserOut) {
    const detail = user.role === 'parent'
      ? 'They will sign in with their child\'s date of birth again and be asked to choose a new password.'
      : 'A temporary password will be generated and they must change it at next login.';
    if (!confirm(`Reset the password for ${user.name}? ${detail}`)) return;

    try {
      const res = await api<{ message: string; temporary_password: string | null }>(
        `/api/admin/users/${user.id}/reset-password`,
        { method: 'POST', body: {} }
      );
      if (res.temporary_password) {
        setResetResult({ name: user.name, password: res.temporary_password });
      } else {
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    }
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (addMode === 'teacher') {
        await api('/api/admin/teachers', { method: 'POST', body: teacherForm });
        showToast('Teacher created successfully', 'success');
      } else {
        await api('/api/admin/students', { method: 'POST', body: studentForm });
        showToast('Student and parent login created successfully', 'success');
      }
      
      setShowAddModal(false);
      setTeacherForm({ name: '', email: '', password: '', phone: '', designation: '' });
      setStudentForm({ name: '', admission_number: '', date_of_birth: '', class_name: '', parent_name: '', parent_phone: '', parent_email: '' });
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">User Management</h1>
          <p className="text-text-secondary">Manage access and profiles for parents, teachers, and admins.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
          Add New User
        </Button>
      </div>

      <Card className="border-border/60">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
            <button 
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'all' ? 'bg-navy text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
            >
              All Users
            </button>
            <button 
              onClick={() => setRoleFilter('parent')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'parent' ? 'bg-school-blue text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
            >
              Parents
            </button>
            <button 
              onClick={() => setRoleFilter('teacher')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'teacher' ? 'bg-gold-dark text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
            >
              Teachers
            </button>
            <button 
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${roleFilter === 'admin' ? 'bg-navy text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
            >
              Admins
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-text-muted">Loading users...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-soft-blue/50 text-text-muted border-y border-border">
                  <th className="py-3 px-4 font-medium">User</th>
                  <th className="py-3 px-4 font-medium">Role</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-soft-blue/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          user.role === 'admin' ? 'bg-navy/10 text-navy' : 
                          user.role === 'teacher' ? 'bg-gold-light/30 text-gold-dark' : 'bg-soft-blue text-school-blue'
                        }`}>
                          {user.role === 'admin' ? <Shield size={16} /> : 
                           user.role === 'teacher' ? <BookOpen size={16} /> : <UserCircle size={16} />}
                        </div>
                        <div>
                          <span className="font-semibold text-navy block">{user.name}</span>
                          {user.designation && <span className="text-xs text-text-muted">{user.designation}</span>}
                          {user.admission_number && <span className="text-xs text-text-muted">Parent of Adm: {user.admission_number}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={user.role === 'admin' ? 'gray' : user.role === 'teacher' ? 'gold' : 'blue'} 
                        size="sm"
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col text-xs space-y-1">
                        {user.email && (
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <Mail size={12} /> {user.email}
                          </span>
                        )}
                        {user.phone && (
                          <span className="flex items-center gap-1.5 text-text-secondary">
                            <Phone size={12} /> {user.phone}
                          </span>
                        )}
                        {!user.email && !user.phone && <span className="text-text-muted">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${user.is_active ? 'text-success' : 'text-error'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-success' : 'bg-error'}`}></span> 
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.role !== 'admin' && (
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleResetPassword(user)}
                            title="Reset Password"
                            aria-label={`Reset password for ${user.name}`}
                            className="p-1.5 text-text-muted hover:text-school-blue hover:bg-soft-blue rounded transition-colors"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user)}
                            title={user.is_active ? "Deactivate User" : "Reactivate User"}
                            className="p-1.5 text-text-muted hover:text-navy hover:bg-soft-blue rounded transition-colors"
                          >
                            {user.is_active ? <Trash2 size={16} className="hover:text-error" /> : <RefreshCw size={16} className="hover:text-success" />}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12 text-text-muted border-b border-border">
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p>No users found matching your search.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="Create New User"
        size="xl"
      >
        <div className="p-1">
          <div className="flex border-b border-border mb-6">
            <button
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${addMode === 'teacher' ? 'border-school-blue text-navy' : 'border-transparent text-text-secondary hover:text-navy'}`}
              onClick={() => setAddMode('teacher')}
            >
              <span className="flex items-center justify-center gap-2"><BookOpen size={16}/> Teacher</span>
            </button>
            <button
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${addMode === 'student' ? 'border-school-blue text-navy' : 'border-transparent text-text-secondary hover:text-navy'}`}
              onClick={() => setAddMode('student')}
            >
              <span className="flex items-center justify-center gap-2"><GraduationCap size={16}/> Student & Parent</span>
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {addMode === 'teacher' ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Full Name *</label>
                  <input type="text" required value={teacherForm.name} onChange={e => setTeacherForm({...teacherForm, name: e.target.value})} className="w-full p-2 rounded border border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Email Address *</label>
                  <input type="email" required value={teacherForm.email} onChange={e => setTeacherForm({...teacherForm, email: e.target.value})} className="w-full p-2 rounded border border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Password *</label>
                  <input type="password" required minLength={6} value={teacherForm.password} onChange={e => setTeacherForm({...teacherForm, password: e.target.value})} className="w-full p-2 rounded border border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Phone</label>
                  <input type="tel" value={teacherForm.phone} onChange={e => setTeacherForm({...teacherForm, phone: e.target.value})} className="w-full p-2 rounded border border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-1">Designation</label>
                  <input type="text" placeholder="e.g. Mathematics Teacher" value={teacherForm.designation} onChange={e => setTeacherForm({...teacherForm, designation: e.target.value})} className="w-full p-2 rounded border border-border" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-soft-blue/30 p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-navy mb-3 text-sm flex items-center gap-2"><GraduationCap size={16} className="text-school-blue"/> Student Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Student Name *</label>
                      <input type="text" required value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Admission Number *</label>
                      <input type="text" required value={studentForm.admission_number} onChange={e => setStudentForm({...studentForm, admission_number: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Date of Birth (YYYY-MM-DD) *</label>
                      <input type="date" required value={studentForm.date_of_birth} onChange={e => setStudentForm({...studentForm, date_of_birth: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Class Name *</label>
                      <input type="text" required placeholder="e.g. Grade 1" value={studentForm.class_name} onChange={e => setStudentForm({...studentForm, class_name: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                  </div>
                </div>

                <div className="bg-gold-light/10 p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-navy mb-3 text-sm flex items-center gap-2"><UserCircle size={16} className="text-gold-dark"/> Parent Login Details</h4>
                  <p className="text-xs text-text-muted mb-4">A parent account will be created automatically. The parent will log in using the student's Admission Number and Date of Birth.</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Parent Name *</label>
                      <input type="text" required value={studentForm.parent_name} onChange={e => setStudentForm({...studentForm, parent_name: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Parent Email</label>
                      <input type="email" value={studentForm.parent_email} onChange={e => setStudentForm({...studentForm, parent_email: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1">Parent Phone</label>
                      <input type="tel" value={studentForm.parent_phone} onChange={e => setStudentForm({...studentForm, parent_phone: e.target.value})} className="w-full p-2 rounded border border-border" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 mt-6 border-t border-border gap-3">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" loading={isSubmitting}>Create Account</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Temporary password (shown once) */}
      <Modal
        isOpen={!!resetResult}
        onClose={() => setResetResult(null)}
        title="Temporary Password"
      >
        {resetResult && (
          <div className="space-y-4 p-1">
            <p className="text-sm text-text-secondary">
              Share this temporary password with <strong className="text-navy">{resetResult.name}</strong> securely.
              It is shown only once, and they will be required to change it at next login.
            </p>
            <div className="flex items-center gap-2">
              <code id="temp-password" className="flex-1 bg-soft-blue px-3 py-2 rounded-lg font-mono text-navy select-all break-all">
                {resetResult.password}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard?.writeText(resetResult.password);
                  showToast('Copied to clipboard', 'success');
                }}
              >
                Copy
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setResetResult(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

