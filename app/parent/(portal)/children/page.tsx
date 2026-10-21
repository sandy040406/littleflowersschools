'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { LoadingState, EmptyState } from '@/components/ui/States';
import { useSession } from '@/lib/session';
import { api } from '@/lib/api';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { formatDate } from '@/lib/utils';

export interface StudentChild {
  id: number;
  name: string;
  admission_number: string;
  date_of_birth?: string | null;
  class_name: string;
  section: string;
  roll_number?: string | null;
  admission_date?: string | null;
  is_active: boolean;
}

export default function ParentChildrenPage() {
  const session = useSession();
  const [children, setChildren] = useState<StudentChild[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [kids, site] = await Promise.all([
          api<StudentChild[]>('/api/auth/me/children').catch(() => []),
          getSiteSettings().catch(() => null),
        ]);
        if (mounted) {
          setChildren(kids || []);
          setSettings(site);
        }
      } catch (err) {
        console.error('Failed to load children profile:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading children records..." />;
  }

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <EmptyState
          icon={<GraduationCap size={36} className="text-school-blue" />}
          title="No Student Records Linked"
          description="We couldn't find any student profiles linked to this parent account. If your child is enrolled, please contact the school administration office to link their admission record."
          action={
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
              <Link href="/contact">
                <Button variant="primary">Contact School Office</Button>
              </Link>
              <Link href="/parent/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const selectedChild = children[selectedIndex] || children[0];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy flex items-center gap-2.5">
            <GraduationCap className="text-school-blue" size={30} />
            My Children
          </h1>
          <p className="text-text-secondary text-sm sm:text-base mt-1">
            Enrolled student profiles, academic information, and institutional records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="blue" className="text-xs font-semibold py-1 px-3">
            {children.length} {children.length === 1 ? 'Student Linked' : 'Students Linked'}
          </Badge>
        </div>
      </div>

      {/* Multiple Children Selector Tabs */}
      {children.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 p-1.5 bg-slate-100 rounded-xl">
          {children.map((child, idx) => (
            <button
              key={child.id}
              onClick={() => setSelectedIndex(idx)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                selectedIndex === idx
                  ? 'bg-white text-navy shadow-sm border border-slate-200'
                  : 'text-text-secondary hover:text-navy hover:bg-white/60'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${child.is_active ? 'bg-emerald-500' : 'bg-red-400'}`} />
              <span>{child.name}</span>
              <span className="text-xs text-text-muted font-normal">
                ({child.class_name} - {child.section})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Main Student Profile Card */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Child Identity Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center p-6 sm:p-8 border-border/80">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-school-blue to-royal-blue text-white mx-auto flex items-center justify-center text-3xl font-extrabold shadow-md mb-4 ring-4 ring-soft-blue">
              {selectedChild.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-navy">{selectedChild.name}</h2>
            <p className="text-sm font-medium text-school-blue mt-1">
              {selectedChild.class_name} &bull; Section {selectedChild.section}
            </p>
            <div className="mt-3 flex justify-center">
              <Badge variant={selectedChild.is_active ? 'success' : 'error'}>
                {selectedChild.is_active ? 'Active Enrolled Student' : 'Inactive / In Processing'}
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-sm">
              <div className="flex items-center justify-between text-text-secondary">
                <span className="text-text-muted">Admission No.</span>
                <span className="font-semibold text-navy">{selectedChild.admission_number}</span>
              </div>
              {selectedChild.roll_number && (
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-text-muted">Roll Number</span>
                  <span className="font-semibold text-navy">{selectedChild.roll_number}</span>
                </div>
              )}
              {selectedChild.date_of_birth && (
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-text-muted">Date of Birth</span>
                  <span className="font-medium text-navy">{formatDate(selectedChild.date_of_birth)}</span>
                </div>
              )}
              {selectedChild.admission_date && (
                <div className="flex items-center justify-between text-text-secondary">
                  <span className="text-text-muted">Admission Date</span>
                  <span className="font-medium text-navy">{formatDate(selectedChild.admission_date)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Link href="/parent/gallery" className="block w-full">
                <Button variant="secondary" className="w-full flex items-center justify-center gap-2 text-sm">
                  <ImageIcon size={16} /> View Gallery & Events
                </Button>
              </Link>
            </div>
          </Card>

          {/* Quick Support Card */}
          <Card className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-100">
            <h3 className="font-bold text-navy text-sm flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-school-blue" />
              Parent Portal Notice
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              If any profile information or spelling requires correction, please request an update with the school registrar office.
            </p>
            <div className="mt-4">
              <Link href="/contact">
                <Button variant="ghost" size="sm" className="w-full text-xs text-school-blue justify-center">
                  Request Information Update <ChevronRight size={14} className="ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Detailed Information Panels */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic & Class Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-school-blue" />
              Academic & Enrollment Profile
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1">
                  Enrolled Class
                </span>
                <span className="text-base font-bold text-navy">{selectedChild.class_name}</span>
                <p className="text-xs text-text-secondary mt-1">Section: {selectedChild.section}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1">
                  Admission Credential
                </span>
                <span className="text-base font-bold text-navy">{selectedChild.admission_number}</span>
                <p className="text-xs text-text-secondary mt-1">Primary Academic Identifier</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1">
                  Class Roll Number
                </span>
                <span className="text-base font-bold text-navy">
                  {selectedChild.roll_number || 'Assigned by Class Teacher'}
                </span>
                <p className="text-xs text-text-secondary mt-1">Current Term</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-text-muted font-medium uppercase tracking-wider block mb-1">
                  Enrollment Status
                </span>
                <span className={`text-base font-bold ${selectedChild.is_active ? 'text-emerald-600' : 'text-red-500'}`}>
                  {selectedChild.is_active ? 'Active & Good Standing' : 'Inactive'}
                </span>
                <p className="text-xs text-text-secondary mt-1">Little Flowers Schools</p>
              </div>
            </div>
          </Card>

          {/* School Schedule & Timings */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Clock size={20} className="text-school-blue" />
              School Hours & Campus Timings
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-50 gap-1">
                <span className="font-medium text-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-school-blue"></span>
                  Regular Student Classes
                </span>
                <span className="text-text-secondary font-semibold">
                  {settings?.school_timings || 'Monday – Friday: 8:00 AM – 2:00 PM'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg bg-slate-50 gap-1">
                <span className="font-medium text-navy flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold"></span>
                  Administrative Office Hours
                </span>
                <span className="text-text-secondary font-semibold">
                  {settings?.office_hours || 'Monday – Saturday: 8:30 AM – 3:30 PM'}
                </span>
              </div>
            </div>
          </Card>

          {/* Guardian & School Contact Details */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <User size={20} className="text-school-blue" />
              Parent & School Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-text-muted font-medium block mb-2">Registered Guardian</span>
                <p className="text-base font-bold text-navy">{session?.name || 'Parent / Guardian'}</p>
                <div className="mt-3 space-y-1.5 text-xs text-text-secondary">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Verified Parent Portal Access</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className="text-xs text-text-muted font-medium block mb-2">School Administration</span>
                <p className="text-sm font-bold text-navy">{settings?.school_name || 'Little Flowers Schools'}</p>
                <div className="mt-3 space-y-2 text-xs text-text-secondary">
                  {settings?.phone && (
                    <a
                      href={`tel:${settings.phone}`}
                      className="flex items-center gap-2 text-school-blue hover:underline"
                    >
                      <Phone size={14} />
                      <span>{settings.phone}</span>
                    </a>
                  )}
                  {settings?.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="flex items-center gap-2 text-school-blue hover:underline"
                    >
                      <Mail size={14} />
                      <span>{settings.email}</span>
                    </a>
                  )}
                  {settings?.address && (
                    <div className="flex items-start gap-2 text-text-muted">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{settings.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
