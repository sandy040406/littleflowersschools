import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Globe, Camera, Video, MessageCircle } from 'lucide-react';
import { SCHOOL_INFO, NAV_ITEMS } from '@/lib/mock-data';

const quickLinks = [
  { label: 'Activities', href: '/activities' },
  { label: 'Our Strengths', href: '/strengths' },
  { label: 'Contact', href: '/contact' },
  { label: 'Enquiry', href: '/enquiry' },
  { label: 'Parent Login', href: '/parent/login' },
  { label: 'Teacher Login', href: '/teacher/login' },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white/85">
      {/* Main Footer */}
      <div className="section-container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* School Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="relative w-48 h-12 lg:w-56 lg:h-14 bg-white/5 rounded-lg p-1">
                <Image src="/school_logo.jpeg" alt="School Logo" fill className="object-contain object-left" />
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-xs">
              Growing Curious Minds. Building Confident Futures. Providing quality education in a warm, nurturing environment.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Globe, href: SCHOOL_INFO.social.facebook, label: 'Facebook' },
                { icon: Camera, href: SCHOOL_INFO.social.instagram, label: 'Instagram' },
                { icon: Video, href: SCHOOL_INFO.social.youtube, label: 'YouTube' },
                { icon: MessageCircle, href: SCHOOL_INFO.social.twitter, label: 'Twitter' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-gold/20 hover:text-gold transition-colors"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* School Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">School</h3>
            <ul className="space-y-2.5">
              {NAV_ITEMS.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/60 hover:text-gold text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/60 hover:text-gold text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href={`tel:${SCHOOL_INFO.phone}`} className="flex items-start gap-2.5 text-white/60 hover:text-gold text-sm transition-colors">
                  <Phone size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{SCHOOL_INFO.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${SCHOOL_INFO.email}`} className="flex items-start gap-2.5 text-white/60 hover:text-gold text-sm transition-colors">
                  <Mail size={15} className="mt-0.5 flex-shrink-0" />
                  <span>{SCHOOL_INFO.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/60 text-sm">
                <MapPin size={15} className="mt-0.5 flex-shrink-0" />
                <span>{SCHOOL_INFO.address}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white/40">
          <p>© {new Date().getFullYear()} Little Flowers Schools. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/70 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
