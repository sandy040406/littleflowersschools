'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  ImageIcon, 
  TrendingUp, 
  MessageSquare, 
  ChevronRight, 
  Clock, 
  Loader2,
  UserPlus,
  Layers,
  ArrowRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { type Enquiry, getEnquiryStats, listEnquiries } from '@/lib/enquiries';
import { api } from '@/lib/api';

interface SystemStats {
  total_students: number;
  active_students: number;
  total_teachers: number;
  total_parents: number;
  total_media: number;
  total_enquiries: number;
  pending_enquiries: number;
  classes: { class_name: string; count: number }[];
}

interface ActivityItem {
  type: 'enquiry' | 'student' | 'media';
  title: string;
  detail: string;
  created_at: string | null;
}

function timeAgo(dateString?: string | null): string {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function AdminDashboard() {
  const [pendingEnquiries, setPendingEnquiries] = useState<Enquiry[]>([]);
  const [enquiryStats, setEnquiryStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_students: 0,
    active_students: 0,
    total_teachers: 0,
    total_parents: 0,
    total_media: 0,
    total_enquiries: 0,
    pending_enquiries: 0,
    classes: [],
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eStats, list, sStats, acts] = await Promise.all([
          getEnquiryStats(),
          listEnquiries('new'),
          api<SystemStats>('/api/admin/stats', { auth: true }),
          api<ActivityItem[]>('/api/admin/activity', { auth: true })
        ]);
        setEnquiryStats(eStats);
        setPendingEnquiries(list.slice(0, 5));
        setSystemStats(sStats);
        setActivities(acts);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { 
      label: 'Total Students', 
      value: systemStats.total_students, 
      sub: `${systemStats.active_students || 0} active`,
      icon: <GraduationCap size={24} />, 
      color: 'text-school-blue', 
      bg: 'bg-school-blue/10',
      href: '/admin/users'
    },
    { 
      label: 'Total Teachers', 
      value: systemStats.total_teachers, 
      sub: 'Faculty members',
      icon: <BookOpen size={24} />, 
      color: 'text-gold-dark', 
      bg: 'bg-gold/10',
      href: '/admin/users'
    },
    { 
      label: 'Parent Accounts', 
      value: systemStats.total_parents, 
      sub: 'Registered guardians',
      icon: <Users size={24} />, 
      color: 'text-success', 
      bg: 'bg-success/10',
      href: '/admin/users'
    },
    { 
      label: 'Total Inquiries', 
      value: enquiryStats.total, 
      sub: `${enquiryStats.new} awaiting reply`,
      icon: <MessageSquare size={24} />, 
      color: 'text-navy', 
      bg: 'bg-navy/10',
      href: '/admin/enquiries'
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-1">Admin Overview</h1>
          <p className="text-text-secondary text-sm">Real-time metrics, live activities, and quick tools across the school system.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/users" 
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-school-blue text-white text-sm font-semibold hover:bg-school-blue-dark transition-colors shadow-sm"
          >
            <UserPlus size={16} /> Manage Students & Users
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.href} className="block group">
            <Card padding="sm" className="flex items-center gap-4 border-border/60 hover:shadow-md hover:border-school-blue/40 transition-all">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-secondary truncate">{stat.label}</p>
                <p className="text-2xl font-bold text-navy leading-tight mt-0.5">
                  {loading ? <Loader2 size={24} className="animate-spin text-text-muted" /> : stat.value}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{stat.sub}</p>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-school-blue group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Class distribution strip */}
      {systemStats.classes && systemStats.classes.length > 0 && (
        <Card className="border-border/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Layers size={16} className="text-school-blue" />
              Active Enrollment by Class
            </h3>
            <Link href="/admin/users" className="text-xs font-semibold text-school-blue hover:underline flex items-center gap-1">
              View All Students <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {systemStats.classes.map((cls, idx) => (
              <div key={idx} className="bg-soft-blue/60 border border-school-blue/20 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs">
                <span className="font-semibold text-navy">{cls.class_name}</span>
                <span className="bg-school-blue text-white rounded-full px-2 py-0.5 font-bold text-[10px]">
                  {cls.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Pending Enquiries */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <MessageSquare size={20} className="text-school-blue" /> Pending Admissions Enquiries
                {enquiryStats.new > 0 && (
                  <span className="ml-2 bg-warning px-2 py-0.5 rounded-full text-xs font-bold text-white">
                    {enquiryStats.new} new
                  </span>
                )}
              </h2>
              <Link href="/admin/enquiries" className="text-sm font-medium text-school-blue hover:underline flex items-center">
                View All <ChevronRight size={16} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Parent Name</th>
                    <th className="pb-3 font-medium">Student Info</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center">
                        <Loader2 size={24} className="animate-spin text-school-blue mx-auto" />
                      </td>
                    </tr>
                  ) : pendingEnquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted">
                        No pending enquiries found.
                      </td>
                    </tr>
                  ) : (
                    pendingEnquiries.map(enq => (
                      <tr key={enq.id} className="hover:bg-soft-blue/50 transition-colors">
                        <td className="py-3 text-text-secondary">
                          {new Date(enq.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium text-navy">{enq.parent_name}</td>
                        <td className="py-3 text-text-secondary">
                          {enq.student_name || 'N/A'} <span className="text-xs text-text-muted">({enq.grade_interested || 'N/A'})</span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-light text-warning-dark border border-warning/20">
                            New
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link href="/admin/enquiries" className="text-school-blue hover:text-navy font-medium text-xs bg-school-blue/10 hover:bg-school-blue/20 px-3 py-1.5 rounded transition-colors inline-block">
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Real System Activity Feed */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gold-dark" /> Recent System Activity
            </h2>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-6 text-text-muted">
                  <Loader2 size={20} className="animate-spin text-school-blue mx-auto" />
                </div>
              ) : activities.length === 0 ? (
                <p className="text-sm text-text-muted py-4 text-center">No recent activity recorded.</p>
              ) : (
                activities.map((act, i) => {
                  let icon = <GraduationCap size={16} />;
                  let bg = 'bg-school-blue/10';
                  let color = 'text-school-blue';

                  if (act.type === 'enquiry') {
                    icon = <MessageSquare size={16} />;
                    bg = 'bg-gold/15';
                    color = 'text-gold-dark';
                  } else if (act.type === 'media') {
                    icon = <ImageIcon size={16} />;
                    bg = 'bg-success/15';
                    color = 'text-success';
                  }

                  return (
                    <div key={i} className="flex gap-3 pb-3 border-b border-border/40 last:border-b-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${bg} ${color}`}>
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-navy font-semibold leading-snug truncate">{act.title}</p>
                        <p className="text-xs text-text-secondary leading-snug mt-0.5 truncate">{act.detail}</p>
                        <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                          <Clock size={11} /> {timeAgo(act.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
