'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone, Mail, Clock, ChevronDown } from 'lucide-react';
import { NAV_ITEMS, SCHOOL_INFO } from '@/lib/mock-data';
import { getSiteSettings, SiteSettings } from '@/lib/content';

export interface NavbarProps {
  initialSettings?: Partial<SiteSettings> | null;
}

export default function Navbar({ initialSettings }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    phone: initialSettings?.phone || SCHOOL_INFO.phone,
    email: initialSettings?.email || SCHOOL_INFO.email,
    school_timings: initialSettings?.school_timings || initialSettings?.office_hours || SCHOOL_INFO.timings,
    office_hours: initialSettings?.office_hours || SCHOOL_INFO.officeHours,
  });
  const pathname = usePathname();

  useEffect(() => {
    if (initialSettings) {
      setSettings(prev => ({
        ...prev,
        ...initialSettings,
        phone: initialSettings.phone || prev.phone,
        email: initialSettings.email || prev.email,
        school_timings: initialSettings.school_timings || initialSettings.office_hours || prev.school_timings,
      }));
    }
  }, [initialSettings]);

  useEffect(() => {
    let mounted = true;
    async function loadSettings() {
      try {
        const data = await getSiteSettings();
        if (mounted && data) {
          setSettings(data);
        }
      } catch (err) {
        // keep current fallback
      }
    }
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const displayPhone = settings.phone || SCHOOL_INFO.phone;
  const displayEmail = settings.email || SCHOOL_INFO.email;
  const displayTimings = settings.school_timings || settings.office_hours || SCHOOL_INFO.timings;

  return (
    <header className="w-full z-50 sticky top-0">
      {/* Utility Bar */}
      <div className="bg-navy text-white/90 text-sm hidden lg:block">
        <div className="section-container flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${displayPhone}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Phone size={13} />
              <span>{displayPhone}</span>
            </a>
            <a href={`mailto:${displayEmail}`} className="flex items-center gap-1.5 hover:text-gold transition-colors">
              <Mail size={13} />
              <span>{displayEmail}</span>
            </a>
          </div>
          <div className="flex items-center gap-1.5 text-white/70">
            <Clock size={13} />
            <span>{displayTimings}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={`bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'shadow-sm'
        }`}
      >
        <div className="section-container flex items-center justify-between h-16 lg:h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <div className="relative w-48 h-12 lg:w-56 lg:h-14">
              <Image src="/logo.png" alt="Little Flowers School Logo" fill className="object-contain object-left" priority />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-[15px] font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-school-blue bg-soft-blue'
                    : 'text-text-primary hover:text-school-blue hover:bg-soft-blue/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/enquiry"
              className="px-4 py-2 text-sm font-semibold text-school-blue border border-school-blue/30 rounded-lg hover:bg-school-blue/5 transition-colors"
            >
              Enquiry
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-navy rounded-lg hover:bg-navy-light transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 -mr-2 text-text-primary hover:text-school-blue transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-white animate-fade-in">
            <div className="section-container py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 rounded-lg text-[15px] font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-school-blue bg-soft-blue'
                      : 'text-text-primary hover:bg-soft-blue/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-border flex gap-3">
                <Link
                  href="/enquiry"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-school-blue border border-school-blue/30 rounded-lg"
                >
                  Enquiry
                </Link>
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-navy rounded-lg"
                >
                  Login
                </Link>
              </div>
              {/* Mobile contact info */}
              <div className="pt-3 mt-2 border-t border-border space-y-2 text-sm text-text-secondary">
                <a href={`tel:${displayPhone}`} className="flex items-center gap-2">
                  <Phone size={14} /> {displayPhone}
                </a>
                <a href={`mailto:${displayEmail}`} className="flex items-center gap-2">
                  <Mail size={14} /> {displayEmail}
                </a>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
