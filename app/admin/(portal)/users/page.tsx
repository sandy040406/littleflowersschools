'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Plus, 
  UserCircle, 
  Mail, 
  Phone, 
  Shield, 
  BookOpen, 
  GraduationCap, 
  RefreshCw, 
  Trash2, 
  KeyRound, 
  Edit, 
  Upload, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  FileSpreadsheet, 
  Loader2, 
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/lib/api';

type MainTab = 'users' | 'students' | 'import' | 'promote';
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
  subject: string | null;
  department: string | null;
  experience: string | null;
  bio: string | null;
  photo_url: string | null;
}

interface StudentOut {
  id: number;
  name: string;
  admission_number: string;
  date_of_birth: string;
  class_name: string;
  section: string;
  roll_number: string | null;
  admission_date: string | null;
  is_active: boolean;
  parent_id: number | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
}

const COMMON_CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'
];

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('users');
  const { showToast } = useToast();

  // ────────────────── Users Tab State ──────────────────
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [userSearch, setUserSearch] = useState('');
  const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);

  // Edit Teacher modal
  const [editingTeacher, setEditingTeacher] = useState<UserOut | null>(null);
  const [teacherEditForm, setTeacherEditForm] = useState({
    name: '', email: '', phone: '', designation: '', subject: '', department: '', experience: '', bio: '', photo_url: '',
  });
  const [updatingTeacher, setUpdatingTeacher] = useState(false);

  // Edit Generic User modal (Parent or Admin)
  const [editingUser, setEditingUser] = useState<UserOut | null>(null);
  const [userEditForm, setUserEditForm] = useState({ name: '', email: '', phone: '' });
  const [updatingUser, setUpdatingUser] = useState(false);

  // ────────────────── Students Tab State ──────────────────
  const [students, setStudents] = useState<StudentOut[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Edit Student modal
  const [editingStudent, setEditingStudent] = useState<StudentOut | null>(null);
  const [studentEditForm, setStudentEditForm] = useState({
    name: '', date_of_birth: '', class_name: '', section: 'A', roll_number: '', admission_date: '', is_active: true
  });
  const [updatingStudent, setUpdatingStudent] = useState(false);

  // ────────────────── Add New Modal ──────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'teacher' | 'student'>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', password: '', phone: '', designation: '', subject: '', department: '', experience: '', bio: '', photo_url: ''
  });
  const [studentForm, setStudentForm] = useState({
    name: '', admission_number: '', date_of_birth: '', class_name: 'Class I', section: 'A', roll_number: '', parent_name: '', parent_phone: '', parent_email: ''
  });

  // ────────────────── Bulk CSV Import State ──────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    errors: string[];
    total_processed: number;
    message: string;
  } | null>(null);

  // ────────────────── Class Promotion State ──────────────────
  const [fromClass, setFromClass] = useState('Class I');
  const [fromSection, setFromSection] = useState('all');
  const [toClass, setToClass] = useState('Class II');
  const [toSection, setToSection] = useState('same');
  const [promoting, setPromoting] = useState(false);
  const [promoteResult, setPromoteResult] = useState<{ count: number; message: string } | null>(null);

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'students' || activeTab === 'promote') {
      fetchStudents();
    }
  }, [activeTab]);

  async function fetchUsers() {
    try {
      setLoadingUsers(true);
      const data = await api<UserOut[]>('/api/admin/users');
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchStudents() {
    try {
      setLoadingStudents(true);
      const data = await api<StudentOut[]>('/api/admin/students');
      setStudents(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load students', 'error');
    } finally {
      setLoadingStudents(false);
    }
  }

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch = 
        user.name.toLowerCase().includes(q) || 
        (user.email && user.email.toLowerCase().includes(q)) ||
        (user.admission_number && user.admission_number.toLowerCase().includes(q)) ||
        (user.phone && user.phone.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [users, roleFilter, userSearch]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesClass = classFilter === 'all' || student.class_name === classFilter;
      const matchesSection = sectionFilter === 'all' || student.section === sectionFilter;
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && student.is_active) || 
        (statusFilter === 'inactive' && !student.is_active);

      const q = studentSearch.toLowerCase();
      const matchesSearch = 
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.admission_number.toLowerCase().includes(q) ||
        (student.roll_number && student.roll_number.toLowerCase().includes(q)) ||
        (student.parent_name && student.parent_name.toLowerCase().includes(q)) ||
        (student.parent_phone && student.parent_phone.toLowerCase().includes(q));

      return matchesClass && matchesSection && matchesStatus && matchesSearch;
    });
  }, [students, classFilter, sectionFilter, statusFilter, studentSearch]);

  // Distinct classes and sections from students
  const availableClasses = useMemo(() => {
    const set = new Set<string>(COMMON_CLASSES);
    students.forEach(s => { if (s.class_name) set.add(s.class_name); });
    return Array.from(set);
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set<string>(['A', 'B', 'C', 'D']);
    students.forEach(s => { if (s.section) set.add(s.section); });
    return Array.from(set);
  }, [students]);

  // Count to promote preview
  const promoteCandidateCount = useMemo(() => {
    return students.filter(s => {
      if (!s.is_active) return false;
      if (s.class_name !== fromClass) return false;
      if (fromSection !== 'all' && s.section !== fromSection) return false;
      return true;
    }).length;
  }, [students, fromClass, fromSection]);

  // ────────────────── Handlers: User Actions ──────────────────
  async function handleToggleUserStatus(user: UserOut) {
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

  function openEditUser(user: UserOut) {
    if (user.role === 'teacher') {
      setEditingTeacher(user);
      setTeacherEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
        subject: user.subject || '',
        department: user.department || '',
        experience: user.experience || '',
        bio: user.bio || '',
        photo_url: user.photo_url || '',
      });
    } else {
      setEditingUser(user);
      setUserEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }

  async function handleUpdateTeacher(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTeacher) return;
    try {
      setUpdatingTeacher(true);
      await api(`/api/admin/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        body: teacherEditForm,
      });
      showToast('Teacher profile updated successfully', 'success');
      setEditingTeacher(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update teacher profile', 'error');
    } finally {
      setUpdatingTeacher(false);
    }
  }

  async function handleUpdateGenericUser(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setUpdatingUser(true);
      await api(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: userEditForm,
      });
      showToast('User account updated successfully', 'success');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setUpdatingUser(false);
    }
  }

  async function handleResetPassword(user: UserOut) {
    const detail = user.role === 'parent'
      ? "They will sign in with their child's date of birth again and be asked to choose a new password."
      : "A temporary password will be generated and they must change it at next login.";
    if (!confirm(`Reset password for ${user.name}? ${detail}`)) return;

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

  // ────────────────── Handlers: Student Actions ──────────────────
  function openEditStudent(student: StudentOut) {
    setEditingStudent(student);
    setStudentEditForm({
      name: student.name,
      date_of_birth: student.date_of_birth,
      class_name: student.class_name,
      section: student.section,
      roll_number: student.roll_number || '',
      admission_date: student.admission_date || '',
      is_active: student.is_active,
    });
  }

  async function handleUpdateStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      setUpdatingStudent(true);
      await api(`/api/admin/students/${editingStudent.id}`, {
        method: 'PUT',
        body: studentEditForm,
      });
      showToast('Student updated successfully', 'success');
      setEditingStudent(null);
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to update student', 'error');
    } finally {
      setUpdatingStudent(false);
    }
  }

  async function handleToggleStudentStatus(student: StudentOut) {
    const actionStr = student.is_active ? 'deactivate' : 'reactivate';
    if (!confirm(`Are you sure you want to ${actionStr} student ${student.name}?`)) return;

    try {
      if (student.is_active) {
        await api(`/api/admin/students/${student.id}`, { method: 'DELETE' });
      } else {
        await api(`/api/admin/students/${student.id}/activate`, { method: 'PUT' });
      }
      showToast(`Student ${actionStr}d successfully`, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || `Failed to ${actionStr} student`, 'error');
    }
  }

  // ────────────────── Handlers: Add New ──────────────────
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
      setTeacherForm({ name: '', email: '', password: '', phone: '', designation: '', subject: '', department: '', experience: '', bio: '', photo_url: '' });
      setStudentForm({ name: '', admission_number: '', date_of_birth: '', class_name: 'Class I', section: 'A', roll_number: '', parent_name: '', parent_phone: '', parent_email: '' });
      fetchUsers();
      if (activeTab === 'students') fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  // ────────────────── Handlers: Bulk CSV ──────────────────
  function downloadCsvTemplate() {
    const headers = 'name,admission_number,date_of_birth,class_name,section,roll_number,parent_name,parent_phone,parent_email\n';
    const sample = 'Aarav Sharma,ADM-2024-001,2017-05-15,Class I,A,01,Rajesh Sharma,+919876543210,rajesh@example.com\n' +
                   'Diya Patel,ADM-2024-002,2017-08-22,Class I,A,02,Sunil Patel,+919876543211,sunil@example.com\n';
    const blob = new Blob([headers + sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'students_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function handleUploadCsv(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Please select a CSV file to upload', 'error');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setImporting(true);
      const res = await api<{
        created: number;
        updated: number;
        errors: string[];
        total_processed: number;
        message: string;
      }>('/api/admin/students/import-csv', {
        method: 'POST',
        body: formData,
      });
      setImportResult(res);
      showToast(res.message, res.errors.length ? 'info' : 'success');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchUsers();
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'CSV Import failed', 'error');
    } finally {
      setImporting(false);
    }
  }

  // ────────────────── Handlers: Class Promotion ──────────────────
  async function handlePromoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fromClass === toClass && fromSection === toSection) {
      showToast('Source and destination class/section cannot be identical', 'error');
      return;
    }
    if (promoteCandidateCount === 0) {
      showToast(`No active students found in ${fromClass} to promote`, 'error');
      return;
    }
    if (!confirm(`Are you sure you want to promote ${promoteCandidateCount} students from ${fromClass} to ${toClass}?`)) {
      return;
    }

    try {
      setPromoting(true);
      const payload: any = {
        from_class: fromClass,
        to_class: toClass,
      };
      if (fromSection !== 'all') payload.from_section = fromSection;
      if (toSection !== 'same') payload.to_section = toSection;

      const res = await api<{ promoted_count: number; message: string }>('/api/admin/students/promote', {
        method: 'POST',
        body: payload,
      });
      setPromoteResult({ count: res.promoted_count, message: res.message });
      showToast(res.message, 'success');
      fetchStudents();
    } catch (err: any) {
      showToast(err.message || 'Class promotion failed', 'error');
    } finally {
      setPromoting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-1">User & Student Management</h1>
          <p className="text-text-secondary text-sm">Oversee all student enrollments, faculty profiles, parent accounts, and batch operations.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
          Add User / Student
        </Button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-border space-x-2 sm:space-x-4 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'users'
              ? 'border-school-blue text-school-blue'
              : 'border-transparent text-text-secondary hover:text-navy'
          }`}
        >
          <Users size={18} /> Staff & Parents ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'students'
              ? 'border-school-blue text-school-blue'
              : 'border-transparent text-text-secondary hover:text-navy'
          }`}
        >
          <GraduationCap size={18} /> Students Directory ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('promote')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'promote'
              ? 'border-school-blue text-school-blue'
              : 'border-transparent text-text-secondary hover:text-navy'
          }`}
        >
          <ArrowRight size={18} /> Class Promotion
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'import'
              ? 'border-school-blue text-school-blue'
              : 'border-transparent text-text-secondary hover:text-navy'
          }`}
        >
          <FileSpreadsheet size={18} /> Bulk CSV Import
        </button>
      </div>

      {/* ────────────────── TAB 1: USERS ────────────────── */}
      {activeTab === 'users' && (
        <Card className="border-border/60">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <button 
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${roleFilter === 'all' ? 'bg-navy text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
              >
                All Users ({users.length})
              </button>
              <button 
                onClick={() => setRoleFilter('parent')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${roleFilter === 'parent' ? 'bg-school-blue text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
              >
                Parents ({users.filter(u => u.role === 'parent').length})
              </button>
              <button 
                onClick={() => setRoleFilter('teacher')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${roleFilter === 'teacher' ? 'bg-gold-dark text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
              >
                Teachers ({users.filter(u => u.role === 'teacher').length})
              </button>
              <button 
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${roleFilter === 'admin' ? 'bg-navy text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'}`}
              >
                Admins ({users.filter(u => u.role === 'admin').length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, admission #..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="text-center py-12 text-text-muted flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin text-school-blue" /> Loading user accounts...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No users match the selected filters.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-soft-blue/50 text-text-muted border-y border-border">
                    <th className="py-3 px-4 font-semibold">User</th>
                    <th className="py-3 px-4 font-semibold">Role</th>
                    <th className="py-3 px-4 font-semibold">Contact</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-soft-blue/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.role === 'admin' ? 'bg-navy text-white' :
                            user.role === 'teacher' ? 'bg-gold/20 text-gold-dark' : 'bg-school-blue/15 text-school-blue'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-navy leading-tight">{user.name}</p>
                            <p className="text-xs text-text-muted mt-0.5">
                              {user.role === 'parent' ? (
                                <span>Username: <strong className="text-navy">{user.admission_number || 'N/A'}</strong></span>
                              ) : (
                                <span>{user.designation || (user.role === 'admin' ? 'Administrator' : 'Faculty')}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge 
                          variant={user.role === 'admin' ? 'gray' : user.role === 'teacher' ? 'gold' : 'blue'}
                          className="capitalize text-xs font-semibold"
                        >
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary">
                        <div className="space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={user.email}>
                              <Mail size={13} className="text-text-muted flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          )}
                          {user.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-text-muted flex-shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          {!user.email && !user.phone && <span className="text-text-muted">No contact info</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-success' : 'bg-destructive'}`} />
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditUser(user)}
                            className="p-1.5 text-text-muted hover:text-school-blue hover:bg-school-blue/10 rounded-md transition-colors"
                            title="Edit User Info"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 text-text-muted hover:text-gold-dark hover:bg-gold/10 rounded-md transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound size={16} />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleToggleUserStatus(user)}
                              className={`p-1.5 rounded-md transition-colors ${
                                user.is_active 
                                  ? 'text-text-muted hover:text-destructive hover:bg-destructive/10'
                                  : 'text-text-muted hover:text-success hover:bg-success/10'
                              }`}
                              title={user.is_active ? 'Deactivate Account' : 'Reactivate Account'}
                            >
                              {user.is_active ? <Trash2 size={16} /> : <RefreshCw size={16} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ────────────────── TAB 2: STUDENTS DIRECTORY ────────────────── */}
      {activeTab === 'students' && (
        <Card className="border-border/60">
          {/* Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search student, adm #, parent..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/50"
              />
            </div>

            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-blue/50"
              >
                <option value="all">All Classes</option>
                {availableClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-blue/50"
              >
                <option value="all">All Sections</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-school-blue/50"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 text-xs text-text-muted font-medium">
            <span>Showing {filteredStudents.length} of {students.length} students</span>
            <Button size="sm" variant="outline" onClick={fetchStudents} icon={<RefreshCw size={14} />}>
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            {loadingStudents ? (
              <div className="text-center py-12 text-text-muted flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin text-school-blue" /> Loading students directory...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No students found matching your criteria.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-soft-blue/50 text-text-muted border-y border-border">
                    <th className="py-3 px-4 font-semibold">Student Name</th>
                    <th className="py-3 px-4 font-semibold">Adm # / Roll</th>
                    <th className="py-3 px-4 font-semibold">Class & Sec</th>
                    <th className="py-3 px-4 font-semibold">Date of Birth</th>
                    <th className="py-3 px-4 font-semibold">Parent Details</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-soft-blue/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-navy">{st.name}</p>
                        {st.admission_date && (
                          <p className="text-[11px] text-text-muted">Admitted: {st.admission_date}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-bold text-school-blue bg-school-blue/10 px-2 py-0.5 rounded">
                          {st.admission_number}
                        </span>
                        {st.roll_number && (
                          <span className="text-xs text-text-muted ml-2">Roll #{st.roll_number}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-navy">
                        {st.class_name} <span className="text-text-muted text-xs">({st.section})</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-text-secondary">
                        {st.date_of_birth}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <p className="font-semibold text-navy leading-tight">{st.parent_name || 'N/A'}</p>
                        <p className="text-text-muted mt-0.5">{st.parent_phone || st.parent_email || 'No contact saved'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          st.is_active ? 'bg-success/15 text-success' : 'bg-destructive/10 text-destructive'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.is_active ? 'bg-success' : 'bg-destructive'}`} />
                          {st.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditStudent(st)}
                            className="p-1.5 text-text-muted hover:text-school-blue hover:bg-school-blue/10 rounded-md transition-colors"
                            title="Edit Student Info"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStudentStatus(st)}
                            className={`p-1.5 rounded-md transition-colors ${
                              st.is_active 
                                ? 'text-text-muted hover:text-destructive hover:bg-destructive/10'
                                : 'text-text-muted hover:text-success hover:bg-success/10'
                            }`}
                            title={st.is_active ? 'Deactivate Student' : 'Reactivate Student'}
                          >
                            {st.is_active ? <Trash2 size={16} /> : <RefreshCw size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}

      {/* ────────────────── TAB 3: CLASS PROMOTION ────────────────── */}
      {activeTab === 'promote' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-border/60">
            <div className="border-b border-border pb-4 mb-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <ArrowRight size={20} className="text-school-blue" />
                Annual Class Promotion Tool
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Batch promote active students from one class/grade to the next academic level.
              </p>
            </div>

            <form onSubmit={handlePromoteSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Source */}
                <div className="bg-soft-blue/30 border border-border/80 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Current Class (From)</h3>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">From Class *</label>
                    <select
                      value={fromClass}
                      onChange={(e) => setFromClass(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                      required
                    >
                      {availableClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Section</label>
                    <select
                      value={fromSection}
                      onChange={(e) => setFromSection(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    >
                      <option value="all">All Sections</option>
                      {availableSections.map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination */}
                <div className="bg-soft-blue/30 border border-border/80 rounded-xl p-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Target Class (To)</h3>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">To Class *</label>
                    <input
                      type="text"
                      value={toClass}
                      onChange={(e) => setToClass(e.target.value)}
                      placeholder="e.g. Class II, Class III..."
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Target Section</label>
                    <select
                      value={toSection}
                      onChange={(e) => setToSection(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                    >
                      <option value="same">Keep Existing Section</option>
                      {availableSections.map(sec => (
                        <option key={sec} value={sec}>Move to Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl border border-school-blue/30 bg-school-blue/5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-navy">Eligible Students to Promote:</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Active students currently registered in <strong>{fromClass}</strong> {fromSection !== 'all' ? `(Section ${fromSection})` : ''}
                  </p>
                </div>
                <div className="text-2xl font-black text-school-blue px-4 py-1 bg-white rounded-lg border border-school-blue/20">
                  {promoteCandidateCount}
                </div>
              </div>

              {promoteResult && (
                <div className="p-4 bg-success/15 border border-success/30 rounded-xl text-success text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 size={18} /> {promoteResult.message}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  disabled={promoting || promoteCandidateCount === 0} 
                  icon={promoting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                >
                  {promoting ? 'Promoting Students...' : `Promote ${promoteCandidateCount} Student(s) to ${toClass}`}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ────────────────── TAB 4: BULK CSV IMPORT ────────────────── */}
      {activeTab === 'import' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="border-border/60">
            <div className="border-b border-border pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                  <FileSpreadsheet size={20} className="text-school-blue" />
                  Bulk Student & Parent Import
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Upload a spreadsheet to register or update multiple students and automatically set up parent logins.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={downloadCsvTemplate} icon={<Download size={15} />}>
                Download Template (.csv)
              </Button>
            </div>

            <form onSubmit={handleUploadCsv} className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-school-blue/50 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="csv-file-upload"
                />
                <label htmlFor="csv-file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload size={36} className="text-school-blue mb-3" />
                  <p className="font-semibold text-navy text-sm">
                    {selectedFile ? selectedFile.name : 'Click to select or drag and drop your CSV file'}
                  </p>
                  <p className="text-xs text-text-muted mt-1">Accepts standard .csv UTF-8 encoded files</p>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-soft-blue/50 rounded-lg text-xs">
                  <span className="font-medium text-navy">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <button 
                    type="button" 
                    onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-destructive hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Supported Columns Reference */}
              <div className="p-4 bg-soft-blue/30 border border-border rounded-xl text-xs space-y-2">
                <p className="font-bold text-navy">Expected CSV Columns (in any order):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-text-secondary font-mono text-[11px]">
                  <span>• <strong>name</strong> (Required)</span>
                  <span>• <strong>admission_number</strong> (Required)</span>
                  <span>• <strong>date_of_birth</strong> (YYYY-MM-DD or DD/MM/YYYY)</span>
                  <span>• <strong>class_name</strong> (Required)</span>
                  <span>• section (Optional, def: A)</span>
                  <span>• roll_number (Optional)</span>
                  <span>• parent_name (Optional)</span>
                  <span>• parent_phone (Optional)</span>
                  <span>• parent_email (Optional)</span>
                </div>
              </div>

              {importResult && (
                <div className="p-4 border rounded-xl space-y-3 bg-white">
                  <div className="flex items-center gap-2 font-bold text-sm text-navy">
                    <CheckCircle2 size={18} className="text-success" />
                    {importResult.message}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <p className="font-bold text-success text-base">{importResult.created}</p>
                      <p className="text-text-muted">Created</p>
                    </div>
                    <div className="p-2 bg-school-blue/10 rounded-lg">
                      <p className="font-bold text-school-blue text-base">{importResult.updated}</p>
                      <p className="text-text-muted">Updated</p>
                    </div>
                    <div className="p-2 bg-destructive/10 rounded-lg">
                      <p className="font-bold text-destructive text-base">{importResult.errors.length}</p>
                      <p className="text-text-muted">Errors</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg max-h-40 overflow-y-auto">
                      <p className="font-bold text-destructive text-xs mb-1">Import Warnings / Errors:</p>
                      <ul className="text-[11px] text-destructive space-y-1 list-disc list-inside">
                        {importResult.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button 
                  type="submit" 
                  disabled={importing || !selectedFile} 
                  icon={importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                >
                  {importing ? 'Processing File...' : 'Import Students from CSV'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ────────────────── MODAL: ADD USER / STUDENT ────────────────── */}
      {showAddModal && (
        <Modal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)}
          title="Create New User Account"
        >
          <div className="space-y-4">
            <div className="flex border-b border-border pb-3 gap-4">
              <button
                type="button"
                onClick={() => setAddMode('student')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  addMode === 'student' ? 'bg-school-blue text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'
                }`}
              >
                <GraduationCap size={16} /> Student & Parent
              </button>
              <button
                type="button"
                onClick={() => setAddMode('teacher')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  addMode === 'teacher' ? 'bg-gold-dark text-white' : 'bg-soft-blue text-text-secondary hover:text-navy'
                }`}
              >
                <BookOpen size={16} /> Teacher / Faculty
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {addMode === 'student' ? (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="e.g. Rahul Sharma"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Admission Number *</label>
                      <input
                        type="text"
                        required
                        value={studentForm.admission_number}
                        onChange={(e) => setStudentForm({ ...studentForm, admission_number: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="e.g. ADM-2024-101"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={studentForm.date_of_birth}
                        onChange={(e) => setStudentForm({ ...studentForm, date_of_birth: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Class *</label>
                      <select
                        value={studentForm.class_name}
                        onChange={(e) => setStudentForm({ ...studentForm, class_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                        required
                      >
                        {availableClasses.map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Section *</label>
                      <input
                        type="text"
                        value={studentForm.section}
                        onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="A"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Guardian / Parent Details</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Parent / Guardian Name *</label>
                        <input
                          type="text"
                          required
                          value={studentForm.parent_name}
                          onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                          placeholder="e.g. Sunil Sharma"
                        />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Parent Phone</label>
                          <input
                            type="tel"
                            value={studentForm.parent_phone}
                            onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Parent Email</label>
                          <input
                            type="email"
                            value={studentForm.parent_email}
                            onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })}
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                            placeholder="parent@example.com"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Teacher Full Name *</label>
                      <input
                        type="text"
                        required
                        value={teacherForm.name}
                        onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="e.g. Dr. Priya Rao"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={teacherForm.email}
                        onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="teacher@littleflowersschools.com"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Initial Password *</label>
                      <input
                        type="password"
                        required
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="Temporary password"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={teacherForm.phone}
                        onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Designation</label>
                      <input
                        type="text"
                        value={teacherForm.designation}
                        onChange={(e) => setTeacherForm({ ...teacherForm, designation: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="Senior Teacher"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Subject</label>
                      <input
                        type="text"
                        value={teacherForm.subject}
                        onChange={(e) => setTeacherForm({ ...teacherForm, subject: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="Mathematics"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Department</label>
                      <input
                        type="text"
                        value={teacherForm.department}
                        onChange={(e) => setTeacherForm({ ...teacherForm, department: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="Science"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Experience</label>
                      <input
                        type="text"
                        value={teacherForm.experience}
                        onChange={(e) => setTeacherForm({ ...teacherForm, experience: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                        placeholder="e.g. 8 years"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Profile Photo</label>
                      <ImageUploadField
                        value={teacherForm.photo_url}
                        onChange={(url) => setTeacherForm({ ...teacherForm, photo_url: url })}
                        label=""
                        aspectRatio="square"
                        className="max-w-[140px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Short Bio</label>
                    <textarea
                      rows={2}
                      value={teacherForm.bio}
                      onChange={(e) => setTeacherForm({ ...teacherForm, bio: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                      placeholder="Teaching philosophy or background..."
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : undefined}>
                  {isSubmitting ? 'Creating...' : addMode === 'student' ? 'Create Student & Parent' : 'Create Teacher'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ────────────────── MODAL: EDIT STUDENT ────────────────── */}
      {editingStudent && (
        <Modal 
          isOpen={!!editingStudent} 
          onClose={() => setEditingStudent(null)}
          title={`Edit Student: ${editingStudent.name}`}
        >
          <form onSubmit={handleUpdateStudent} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={studentEditForm.name}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Admission Number</label>
                <input
                  type="text"
                  disabled
                  value={editingStudent.admission_number}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-soft-blue/50 text-text-muted"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={studentEditForm.date_of_birth}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, date_of_birth: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Class *</label>
                <select
                  value={studentEditForm.class_name}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, class_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white"
                  required
                >
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Section *</label>
                <input
                  type="text"
                  value={studentEditForm.section}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, section: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Roll Number</label>
                <input
                  type="text"
                  value={studentEditForm.roll_number}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, roll_number: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. 15"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Admission Date</label>
                <input
                  type="date"
                  value={studentEditForm.admission_date}
                  onChange={(e) => setStudentEditForm({ ...studentEditForm, admission_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="edit_is_active"
                checked={studentEditForm.is_active}
                onChange={(e) => setStudentEditForm({ ...studentEditForm, is_active: e.target.checked })}
                className="rounded border-border text-school-blue focus:ring-school-blue"
              />
              <label htmlFor="edit_is_active" className="text-xs font-semibold text-navy">
                Student is currently active / enrolled
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingStudent(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingStudent} icon={updatingStudent ? <Loader2 size={16} className="animate-spin" /> : undefined}>
                {updatingStudent ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────── MODAL: EDIT TEACHER PROFILE ────────────────── */}
      {editingTeacher && (
        <Modal 
          isOpen={!!editingTeacher} 
          onClose={() => setEditingTeacher(null)}
          title={`Edit Teacher Profile: ${editingTeacher.name}`}
        >
          <form onSubmit={handleUpdateTeacher} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={teacherEditForm.name}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={teacherEditForm.email}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={teacherEditForm.phone}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Designation</label>
                <input
                  type="text"
                  value={teacherEditForm.designation}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, designation: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Subject</label>
                <input
                  type="text"
                  value={teacherEditForm.subject}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Department</label>
                <input
                  type="text"
                  value={teacherEditForm.department}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy mb-1">Experience</label>
                <input
                  type="text"
                  value={teacherEditForm.experience}
                  onChange={(e) => setTeacherEditForm({ ...teacherEditForm, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                  placeholder="e.g. 8 years"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-border">
              <label className="block text-xs font-semibold text-navy mb-1.5">Profile Photo</label>
              <ImageUploadField
                value={teacherEditForm.photo_url}
                onChange={(url) => setTeacherEditForm({ ...teacherEditForm, photo_url: url })}
                label=""
                aspectRatio="square"
                className="max-w-[160px] mx-auto"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Bio / Profile Description</label>
              <textarea
                rows={3}
                value={teacherEditForm.bio}
                onChange={(e) => setTeacherEditForm({ ...teacherEditForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingTeacher(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingTeacher} icon={updatingTeacher ? <Loader2 size={16} className="animate-spin" /> : undefined}>
                {updatingTeacher ? 'Saving...' : 'Update Faculty Profile'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ────────────────── MODAL: EDIT GENERIC USER (Parent/Admin) ────────────────── */}
      {editingUser && (
        <Modal 
          isOpen={!!editingUser} 
          onClose={() => setEditingUser(null)}
          title={`Edit Account: ${editingUser.name}`}
        >
          <form onSubmit={handleUpdateGenericUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={userEditForm.name}
                onChange={(e) => setUserEditForm({ ...userEditForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Email Address</label>
              <input
                type="email"
                value={userEditForm.email}
                onChange={(e) => setUserEditForm({ ...userEditForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="parent@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Phone Number</label>
              <input
                type="tel"
                value={userEditForm.phone}
                onChange={(e) => setUserEditForm({ ...userEditForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updatingUser} icon={updatingUser ? <Loader2 size={16} className="animate-spin" /> : undefined}>
                {updatingUser ? 'Saving...' : 'Update Account'}
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
          title="Password Reset Generated"
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              A temporary password has been generated for <strong>{resetResult.name}</strong>. Please share it securely with the user:
            </p>
            <div className="p-3 bg-soft-blue border border-school-blue/30 rounded-lg flex items-center justify-between font-mono text-sm font-bold text-navy">
              <span>{resetResult.password}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.password);
                  showToast('Copied to clipboard!', 'info');
                }}
                className="text-xs text-school-blue hover:underline"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-text-muted">
              The user will be required to change this password on their next login.
            </p>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setResetResult(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
