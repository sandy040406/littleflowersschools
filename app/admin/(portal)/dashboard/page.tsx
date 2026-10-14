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
  AlertCircle,
  ChevronRight,
  Clock,
  Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { type Enquiry, getEnquiryStats, listEnquiries } from '@/lib/enquiries';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const [pendingEnquiries, setPendingEnquiries] = useState<Enquiry[]>([]);
  const [enquiryStats, setEnquiryStats] = useState({ total: 0, new: 0, contacted: 0, closed: 0 });
  const [systemStats, setSystemStats] = useState({ total_students: 0, total_teachers: 0, total_parents: 0, total_media: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [eStats, list, sStats] = await Promise.all([
          getEnquiryStats(),
          listEnquiries('new'),
          api<{ total_students: number, total_teachers: number, total_parents: number, total_media: number }>('/api/admin/stats', { auth: true })
        ]);
        setEnquiryStats(eStats);
        setPendingEnquiries(list.slice(0, 5));
        setSystemStats(sStats);
      } catch (e) {
        console.error('Failed to load dashboard data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = [
    { label: 'Total Students', value: systemStats.total_students, icon: <GraduationCap size={24} />, color: 'text-school-blue', bg: 'bg-school-blue/10' },
    { label: 'Total Teachers', value: systemStats.total_teachers, icon: <BookOpen size={24} />, color: 'text-gold-dark', bg: 'bg-gold/10' },
    { label: 'Total Parents', value: systemStats.total_parents, icon: <Users size={24} />, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Total Enquiries', value: enquiryStats.total, icon: <MessageSquare size={24} />, color: 'text-navy', bg: 'bg-navy/10' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-2">Admin Overview</h1>
        <p className="text-text-secondary">High-level metrics and recent activities across the school system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} padding="sm" className="flex items-center gap-4 border-border/60">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-navy leading-none">
                {loading ? <Loader2 size={24} className="animate-spin text-text-muted" /> : stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Pending Enquiries */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <MessageSquare size={20} className="text-school-blue" /> Pending Admissions Enquiries
                {enquiryStats.new > 0 && (
                  <span className="ml-2 bg-warning px-2 py-0.5 rounded-full text-xs font-bold text-white">
                    {enquiryStats.new}
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

        {/* System Activity */}
        <div className="space-y-6">
          <Card className="border-border/60">
            <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gold-dark" /> System Activity
            </h2>
            <div className="space-y-5">
              {[
                { type: 'media', msg: 'Sarah Jenkins uploaded 15 photos to "Sports Day 2023"', time: '2 hours ago', icon: <ImageIcon size={16} />, color: 'text-school-blue', bg: 'bg-school-blue/10' },
                { type: 'event', msg: 'New event "Science Fair" created by Admin', time: '5 hours ago', icon: <AlertCircle size={16} />, color: 'text-warning', bg: 'bg-warning-light' },
                { type: 'user', msg: '3 new parent accounts generated for Class I', time: '1 day ago', icon: <Users size={16} />, color: 'text-success', bg: 'bg-success/10' },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activity.bg} ${activity.color}`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="text-sm text-navy font-medium leading-snug mb-1">{activity.msg}</p>
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={12} /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
