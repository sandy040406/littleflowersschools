'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Calendar as CalendarIcon, 
  Search, 
  Pin, 
  Download, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { 
  getPublicNotices, 
  getCalendarFeed, 
  Notice, 
  CalendarItem, 
  NOTICE_CATEGORIES 
} from '@/lib/notices';
import { formatDate } from '@/lib/utils';
import { mediaUrl } from '@/lib/api';

export default function NoticesPage() {
  const [activeTab, setActiveTab] = useState<'notices' | 'calendar'>('notices');
  const [notices, setNotices] = useState<Notice[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNoticeId, setExpandedNoticeId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const [noticeList, calList] = await Promise.all([
          getPublicNotices(),
          getCalendarFeed(),
        ]);
        if (mounted) {
          setNotices(noticeList || []);
          setCalendarItems(calList || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to load school circulars');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((n) => {
      const matchCategory = selectedCategory === 'all' || n.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch = !searchQuery || 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [notices, selectedCategory, searchQuery]);

  const getCategoryBadgeClass = (cat: string) => {
    const found = NOTICE_CATEGORIES.find(c => c.value === cat.toLowerCase());
    return found ? found.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <>
      <PageHero
        title="Circulars & School Calendar"
        subtitle="Official notices, academic schedules, holiday announcements, and event timelines."
        breadcrumb="Circulars & Calendar"
      />

      <section className="py-12 lg:py-20 bg-background">
        <div className="section-container">
          <SectionHeader
            title="School Announcements & Schedules"
            subtitle="Stay informed with official circulars from the administration and upcoming calendar events."
          />

          {/* ===== TAB SWITCHER ===== */}
          <div className="flex justify-center mb-10">
            <div className="bg-soft-blue/60 p-1.5 rounded-xl flex items-center gap-1 border border-school-blue/15 shadow-inner">
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'notices'
                    ? 'bg-navy text-white shadow-md'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                <Bell size={18} /> Official Circulars & Notices ({notices.length})
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-navy text-white shadow-md'
                    : 'text-text-secondary hover:text-navy'
                }`}
              >
                <CalendarIcon size={18} /> Unified Timeline ({calendarItems.length})
              </button>
            </div>
          </div>

          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-danger/10 text-danger border border-danger/20 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {activeTab === 'notices' ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* ===== SEARCH & CATEGORY FILTERS ===== */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search circulars by keyword, exam, holiday, or topic..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-2">Category:</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-navy text-white'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    All Notices
                  </button>
                  {NOTICE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        selectedCategory === cat.value
                          ? 'bg-navy text-white'
                          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== NOTICE LIST ===== */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredNotices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                  <Bell size={40} className="mx-auto text-text-muted mb-3 opacity-60" />
                  <h3 className="text-lg font-bold text-navy mb-1">No circulars found</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto">
                    {searchQuery || selectedCategory !== 'all'
                      ? 'No notices matched your current search or category filter. Try clearing the filter.'
                      : 'There are currently no active public announcements posted.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotices.map((notice) => {
                    const isExpanded = expandedNoticeId === notice.id;
                    const isLong = notice.content.length > 220;

                    return (
                      <Card
                        key={notice.id}
                        hover
                        className={`transition-all duration-200 border-l-4 ${
                          notice.is_pinned
                            ? 'border-l-gold bg-amber-50/20'
                            : 'border-l-school-blue'
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          {/* Notice Meta header */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {notice.is_pinned && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-gold/15 text-navy border border-gold/30">
                                  <Pin size={12} className="rotate-45" /> Pinned Circular
                                </span>
                              )}
                              <span
                                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeClass(
                                  notice.category
                                )}`}
                              >
                                {notice.category.toUpperCase()}
                              </span>
                            </div>

                            <span className="text-xs text-text-muted flex items-center gap-1.5">
                              <Clock size={13} /> {formatDate(notice.publish_date)}
                            </span>
                          </div>

                          {/* Notice Title */}
                          <h3 className="text-lg font-bold text-navy hover:text-school-blue transition-colors">
                            {notice.title}
                          </h3>

                          {/* Notice Body */}
                          <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                            {isExpanded || !isLong ? (
                              notice.content
                            ) : (
                              <>
                                {notice.content.slice(0, 220)}...
                              </>
                            )}
                          </div>

                          {/* Notice Footer: Expand + Attachment Link + Author */}
                          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                              {isLong && (
                                <button
                                  onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                                  className="text-school-blue font-semibold hover:underline inline-flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      Read Less <ChevronUp size={14} />
                                    </>
                                  ) : (
                                    <>
                                      Read Full Circular <ChevronDown size={14} />
                                    </>
                                  )}
                                </button>
                              )}

                              {notice.attachment_url && (
                                <a
                                  href={mediaUrl(notice.attachment_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-school-blue/10 text-school-blue font-semibold hover:bg-school-blue/20 transition-colors"
                                >
                                  <Download size={13} /> Download Circular Attachment
                                </a>
                              )}
                            </div>

                            <span className="text-text-muted">
                              Issued by: <strong className="text-text-secondary">{notice.author_name || 'School Office'}</strong>
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ===== CALENDAR / TIMELINE VIEW ===== */
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                      <CalendarIcon size={20} className="text-school-blue" />
                      Academic & Events Timeline
                    </h3>
                    <p className="text-xs text-text-muted mt-1">
                      Chronological stream of examinations, holidays, sports meets, and photo galleries.
                    </p>
                  </div>
                  <Link href="/gallery" className="text-xs font-semibold text-school-blue hover:underline">
                    View Photo Gallery &rarr;
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : calendarItems.length === 0 ? (
                  <p className="text-center py-8 text-sm text-text-muted">No scheduled dates found.</p>
                ) : (
                  <div className="relative border-l-2 border-school-blue/20 pl-6 ml-3 space-y-6">
                    {calendarItems.map((item) => (
                      <div key={item.id} className="relative group">
                        {/* Dot indicator */}
                        <div
                          className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            item.item_type === 'event' ? 'bg-gold' : 'bg-school-blue'
                          }`}
                        />

                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-100 group-hover:border-school-blue/30 group-hover:bg-white transition-all">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-school-blue">
                              {formatDate(item.date)}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                item.item_type === 'event'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {item.item_type === 'event' ? 'School Event' : item.category}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-navy leading-snug mb-1">
                            {item.title}
                          </h4>

                          {item.description && (
                            <p className="text-xs text-text-secondary line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {item.target_class && (
                            <span className="inline-block mt-2 text-[11px] font-medium text-text-muted bg-white px-2 py-0.5 rounded border border-gray-200">
                              Target: {item.target_class}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== PARENT CALLOUT ===== */}
          <div className="max-w-4xl mx-auto mt-16 p-8 rounded-3xl bg-gradient-to-r from-navy to-school-blue text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-gold">
                <Sparkles size={14} /> Enrolled Parents Portal
              </span>
              <h3 className="text-xl lg:text-2xl font-bold">
                Looking for class-specific circulars & homework updates?
              </h3>
              <p className="text-sm text-white/80 max-w-lg">
                Log into your Parent Portal to access exclusive notices, homework sheets, and class conference updates tailored specifically to your child’s grade.
              </p>
            </div>
            <Link
              href="/login"
              className="flex-shrink-0 px-6 py-3 rounded-xl bg-gold text-navy font-bold hover:bg-gold/90 transition-colors shadow-md text-sm"
            >
              Sign In to Parent Portal
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
