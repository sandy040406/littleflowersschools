'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  Pin, 
  Download, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  GraduationCap, 
  Info,
  Loader2
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getParentNotices, Notice, NOTICE_CATEGORIES } from '@/lib/notices';
import { formatDate } from '@/lib/utils';
import { mediaUrl } from '@/lib/api';

export default function ParentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
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
        const data = await getParentNotices();
        if (mounted) {
          setNotices(data || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Failed to load circulars');
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
        n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.target_class && n.target_class.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [notices, selectedCategory, searchQuery]);

  const getCategoryBadgeClass = (cat: string) => {
    const found = NOTICE_CATEGORIES.find(c => c.value === cat.toLowerCase());
    return found ? found.color : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
            <Bell size={24} className="text-school-blue" /> Notices & Circulars
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            School-wide announcements, exam dates, holiday alerts, and circulars targeted to your children’s classes.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 text-danger border border-danger/20 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by keyword, exam, holiday, or class..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-school-blue/20 focus:border-school-blue"
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

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-semibold text-text-muted uppercase mr-1">Category:</span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-navy text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {NOTICE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-navy text-white'
                  : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notices List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-text-muted">
          <Loader2 size={32} className="animate-spin text-school-blue mb-3" />
          <p className="text-sm">Loading circulars for your family...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="p-12 text-center text-text-secondary">
          <Bell size={40} className="mx-auto text-text-muted mb-3 opacity-50" />
          <h3 className="text-base font-bold text-navy mb-1">No circulars found</h3>
          <p className="text-sm max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? 'No notices matched your filter. Try clearing filters or searching for another term.'
              : 'There are currently no active announcements for your account.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isExpanded = expandedNoticeId === notice.id;
            const isLong = notice.content.length > 200;

            return (
              <Card
                key={notice.id}
                hover
                className={`transition-all duration-200 border-l-4 ${
                  notice.is_pinned
                    ? 'border-l-gold bg-amber-50/15'
                    : notice.target_class
                    ? 'border-l-purple-600 bg-purple-50/10'
                    : 'border-l-school-blue'
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Meta info */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-gold/15 text-navy border border-gold/30">
                          <Pin size={11} className="rotate-45" /> Pinned
                        </span>
                      )}

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
                          Whole School
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Clock size={12} /> {formatDate(notice.publish_date)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-navy">
                    {notice.title}
                  </h3>

                  {/* Body Content */}
                  <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                    {isExpanded || !isLong ? (
                      notice.content
                    ) : (
                      <>
                        {notice.content.slice(0, 200)}...
                      </>
                    )}
                  </div>

                  {/* Footer: Expand button + attachment */}
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {isLong && (
                        <button
                          onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                          className="text-school-blue font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp size={14} />
                            </>
                          ) : (
                            <>
                              Read Full Notice <ChevronDown size={14} />
                            </>
                          )}
                        </button>
                      )}

                      {notice.attachment_url && (
                        <a
                          href={mediaUrl(notice.attachment_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded bg-school-blue/10 text-school-blue font-semibold hover:bg-school-blue/20 transition-colors"
                        >
                          <Download size={13} /> View Attached Document
                        </a>
                      )}
                    </div>

                    <span className="text-text-muted">
                      From: <strong className="text-text-secondary">{notice.author_name || 'School Office'}</strong>
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
