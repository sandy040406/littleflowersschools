'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getActiveAnnouncements, type Announcement } from '@/lib/content';

export default function AlertBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    getActiveAnnouncements(controller.signal)
      .then(setAnnouncements)
      .catch((err) => {
        if (err.name !== 'AbortError') console.error('Failed to load announcements', err);
      });
    return () => controller.abort();
  }, []);

  if (announcements.length === 0 || !isVisible) return null;

  return (
    <div className="bg-gold-light/20 border-b border-gold/30 text-navy-dark relative z-40">
      <div className="section-container py-2.5 flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-gold-dark shrink-0">
          <Bell size={16} className="animate-pulse" />
          <span className="uppercase text-xs tracking-wider">Updates</span>
        </div>
        
        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="animate-marquee whitespace-nowrap text-sm font-medium">
            {announcements.map((announcement, idx) => (
              <span key={announcement.id} className="mx-8">
                {idx > 0 && <span className="mx-4 text-gold/50">•</span>}
                {announcement.link ? (
                  <a href={announcement.link} className="hover:underline text-school-blue">
                    {announcement.text}
                  </a>
                ) : (
                  announcement.text
                )}
              </span>
            ))}
            {/* Duplicate for seamless scrolling */}
            {announcements.map((announcement, idx) => (
              <span key={`dup-${announcement.id}`} className="mx-8">
                {idx > 0 && <span className="mx-4 text-gold/50">•</span>}
                {announcement.link ? (
                  <a href={announcement.link} className="hover:underline text-school-blue">
                    {announcement.text}
                  </a>
                ) : (
                  announcement.text
                )}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setIsVisible(false)}
          className="shrink-0 text-navy/50 hover:text-navy transition-colors ml-2"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
