'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Navigation, ExternalLink, School, X } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { submitContactForm } from '@/lib/enquiries';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { useToast } from '@/components/ui/Toast';

interface SchoolBranch {
  id: string;
  name: string;
  badge: string;
  grades: string;
  address: string;
  mapQuery: string;
  isMain?: boolean;
}

const SCHOOL_BRANCHES: SchoolBranch[] = [
  {
    id: 'main',
    name: 'Main Campus',
    badge: 'Main Campus',
    grades: 'Play School to Grade 5',
    address: 'No.8, Rajaji Street, New Perungalathur, Chennai - 63',
    mapQuery: 'Little Flowers School, No.8, Rajaji Street, New Perungalathur, Chennai 600063',
    isMain: true,
  },
  {
    id: 'nursery',
    name: 'Nursery Campus',
    badge: 'Nursery Campus',
    grades: 'Play School & Nursery',
    address: '16A, Nethaji Street, New Perungalathur, Chennai - 63',
    mapQuery: '16A, Nethaji Street, New Perungalathur, Chennai 600063',
  },
  {
    id: 'branch3',
    name: 'Branch 3 (Nursery)',
    badge: 'Branch 3',
    grades: 'Nursery & Early Learning',
    address: 'Park 63, Shriram Properties, Chennai - 63',
    mapQuery: 'Park 63, Shriram Properties, Chennai 600063',
  },
];

const WHATSAPP_CONTACTS = [
  {
    label: 'Primary School Desk',
    phone: '9789827060',
    display: '+91 9789827060',
    url: 'https://wa.me/919789827060?text=Hello%20Little%20Flowers%20School,%20I%20would%20like%20to%20enquire',
  },
  {
    label: 'Admissions & Enquiries',
    phone: '7708597754',
    display: '+91 7708597754',
    url: 'https://wa.me/917708597754?text=Hello%20Little%20Flowers%20School,%20I%20would%20like%20to%20enquire',
  },
];

const INSTAGRAM_URL = 'https://www.instagram.com/littleflowersschool_pglr/';
const INSTAGRAM_HANDLE = '@littleflowersschool_pglr';

function WhatsAppIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function InstagramIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('main');
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    phone: '+91 9789827060',
    email: 'littleflowersschool016@gmail.com',
    address: 'No.8, Rajaji Street, New Perungalathur, Chennai - 63',
    office_hours: 'Mon – Sat: 8:30 AM – 6:00 PM',
  });
  const { showToast } = useToast();

  const activeCampus = SCHOOL_BRANCHES.find((c) => c.id === selectedCampusId) || SCHOOL_BRANCHES[0];

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load contact info', err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWhatsappModalOpen(false);
      }
    };
    if (whatsappModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [whatsappModalOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = (formData.get('name') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();
    const subject = (formData.get('subject') as string)?.trim();
    const message = (formData.get('message') as string)?.trim();
    const website = (formData.get('website') as string)?.trim() || undefined;

    setLoading(true);
    try {
      await submitContactForm({
        name,
        email,
        phone,
        subject,
        message,
        website,
      });

      setSuccess(true);
      showToast('Your message has been sent successfully. We will get back to you soon!', 'success');
      form.reset();
    } catch (err: any) {
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        subtitle="We're here to answer your questions and welcome you to our community."
        breadcrumb="Contact"
      />

      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Contact Information */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-navy mb-4">Get in Touch</h2>
                <p className="text-text-secondary leading-relaxed mb-6">
                  Whether you're a prospective parent, a current family, or just want to learn more about our school, we're always happy to connect.
                </p>
              </div>

              <div className="space-y-6">
                {/* 3 Campuses Display */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-school-blue/10 flex items-center justify-center text-school-blue flex-shrink-0 mt-0.5">
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="font-semibold text-navy text-base">Our Campuses</h3>
                      <span className="text-[11px] font-semibold text-school-blue bg-school-blue/10 px-2 py-0.5 rounded-full">
                        3 Locations
                      </span>
                    </div>

                    <div className="space-y-3">
                      {SCHOOL_BRANCHES.map((campus) => (
                        <div
                          key={campus.id}
                          className="p-3.5 rounded-xl border border-border/80 bg-neutral-light/50 hover:bg-neutral-light hover:border-school-blue/40 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-navy text-sm">{campus.name}</span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                campus.isMain
                                  ? 'bg-school-blue/10 text-school-blue border border-school-blue/20'
                                  : 'bg-gold/15 text-gold-dark border border-gold/25'
                              }`}
                            >
                              {campus.badge}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-2.5">
                            {campus.address}
                          </p>
                          <div className="flex items-center gap-3">
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.mapQuery)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-school-blue hover:text-navy hover:underline transition-colors"
                            >
                              <Navigation size={12} />
                              <span>Get Directions</span>
                              <ExternalLink size={10} className="opacity-70" />
                            </a>
                            <span className="text-border">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCampusId(campus.id);
                                const mapSection = document.getElementById('campus-map-section');
                                if (mapSection) {
                                  mapSection.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="text-xs font-medium text-text-muted hover:text-navy transition-colors cursor-pointer"
                            >
                              View on Map
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Call Us</h3>
                    <a href={`tel:${settings.phone || '+919789827060'}`} className="text-text-secondary hover:text-school-blue transition-colors font-medium">
                      {settings.phone || '+91 9789827060'}
                    </a>
                  </div>
                </div>

                {/* WhatsApp Chat Support */}
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    onClick={() => setWhatsappModalOpen(true)}
                    className="w-12 h-12 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] flex-shrink-0 hover:scale-105 hover:bg-[#25D366]/20 transition-all cursor-pointer"
                    title="Click to chat on WhatsApp"
                  >
                    <WhatsAppIcon className="w-6 h-6" />
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-navy">WhatsApp</h3>
                      <button
                        type="button"
                        onClick={() => setWhatsappModalOpen(true)}
                        className="text-[11px] font-semibold text-[#25D366] hover:text-[#20ba59] bg-[#25D366]/10 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                      >
                        2 Numbers
                      </button>
                    </div>
                    <p className="text-xs text-text-secondary mb-2.5">
                      Instant messaging &amp; quick queries:
                    </p>
                    <div className="space-y-2">
                      {WHATSAPP_CONTACTS.map((wa) => (
                        <a
                          key={wa.phone}
                          href={wa.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 px-3 rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 hover:bg-[#25D366]/15 hover:border-[#25D366]/50 transition-all text-xs group"
                        >
                          <div className="flex items-center gap-2">
                            <WhatsAppIcon className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                            <div>
                              <span className="font-bold text-navy block text-xs">{wa.display}</span>
                              <span className="text-[10px] text-text-muted">{wa.label}</span>
                            </div>
                          </div>
                          <span className="inline-flex items-center gap-1 font-semibold text-[#25D366] group-hover:underline">
                            <span>Chat</span>
                            <ExternalLink size={11} />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Email Us</h3>
                    <a href={`mailto:${settings.email || 'littleflowersschool016@gmail.com'}`} className="text-text-secondary hover:text-school-blue transition-colors font-medium break-all">
                      {settings.email || 'littleflowersschool016@gmail.com'}
                    </a>
                  </div>
                </div>

                {/* Instagram Profile */}
                <div className="flex items-start gap-4">
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 hover:scale-105 transition-transform shadow-sm"
                    title="Follow Little Flowers on Instagram"
                  >
                    <InstagramIcon className="w-6 h-6" />
                  </a>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Instagram</h3>
                    <a
                      href={INSTAGRAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-school-blue hover:text-pink-600 transition-colors font-semibold text-sm group"
                    >
                      <span>{INSTAGRAM_HANDLE}</span>
                      <ExternalLink size={12} className="opacity-70 group-hover:opacity-100" />
                    </a>
                    <p className="text-xs text-text-secondary mt-1">
                      Follow us for student activities, campus life &amp; celebrations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Office Hours</h3>
                    <p className="text-text-secondary">{settings.office_hours || 'Mon – Sat: 8:30 AM – 6:00 PM'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card padding="lg" className="shadow-lg">
                <h3 className="text-2xl font-bold text-navy mb-6">Send us a Message</h3>
                
                {success ? (
                  <div className="bg-success-light border border-success/20 rounded-xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto mb-4">
                      <Send size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-success mb-2">Message Sent!</h4>
                    <p className="text-success/80">
                      Thank you for reaching out. Our team will review your message and respond to you shortly.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-6 border-success/30 text-success hover:bg-success/10"
                      onClick={() => setSuccess(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" suppressHydrationWarning>
                    {/* Honeypot field - invisible to humans, catches bots */}
                    <input
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                      suppressHydrationWarning
                    />

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-sm font-medium text-navy">Full Name <span className="text-error">*</span></label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name"
                          autoComplete="name"
                          required
                          suppressHydrationWarning
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-medium text-navy">Email Address <span className="text-error">*</span></label>
                        <input 
                          type="email" 
                          id="email" 
                          name="email"
                          autoComplete="email"
                          required
                          suppressHydrationWarning
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-sm font-medium text-navy">Phone Number <span className="text-error">*</span></label>
                        <input 
                          type="tel" 
                          id="phone" 
                          name="phone"
                          autoComplete="tel"
                          required
                          suppressHydrationWarning
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="subject" className="block text-sm font-medium text-navy">Subject</label>
                        <select 
                          id="subject" 
                          name="subject"
                          suppressHydrationWarning
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all bg-white"
                        >
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Admissions">Admissions</option>
                          <option value="Feedback">Feedback</option>
                          <option value="Careers">Careers</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="block text-sm font-medium text-navy">Your Message <span className="text-error">*</span></label>
                      <textarea 
                        id="message" 
                        name="message"
                        required
                        rows={5}
                        suppressHydrationWarning
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      className="w-full"
                      loading={loading}
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
          
          {/* Campuses & Interactive Map Section */}
          <div id="campus-map-section" className="mt-20 scroll-mt-24">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-school-blue/10 text-school-blue mb-3">
                <MapPin size={13} />
                Campus Locations
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-navy mb-3">
                Visit Any of Our 3 Campuses
              </h3>
              <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                We are conveniently situated across 3 campuses in Perungalathur &amp; Shriram Properties, Chennai, offering dedicated environments tailored for early learners.
              </p>
            </div>

            {/* 3 Campus Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {SCHOOL_BRANCHES.map((campus) => {
                const isSelected = selectedCampusId === campus.id;
                return (
                  <div
                    key={campus.id}
                    onClick={() => setSelectedCampusId(campus.id)}
                    className={`relative p-6 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-school-blue bg-white shadow-md ring-2 ring-school-blue/20'
                        : 'border-border bg-white hover:border-school-blue/40 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            campus.isMain
                              ? 'bg-school-blue/10 text-school-blue border border-school-blue/20'
                              : 'bg-gold/15 text-gold-dark border border-gold/25'
                          }`}
                        >
                          {campus.badge}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-school-blue flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-school-blue animate-pulse" />
                            Selected
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold text-navy mb-1">{campus.name}</h4>
                      <p className="text-xs font-semibold text-text-muted mb-4">{campus.grades}</p>

                      <div className="flex items-start gap-2.5 text-text-secondary text-sm mb-6 min-h-[44px]">
                        <MapPin size={16} className="text-school-blue flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{campus.address}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(campus.mapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-school-blue text-white hover:bg-school-blue-dark transition-colors shadow-sm"
                      >
                        <Navigation size={13} />
                        <span>Get Directions</span>
                        <ExternalLink size={11} className="opacity-80" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Map Box for Selected Campus */}
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-neutral-light relative">
              <div className="p-4 bg-white border-b border-border flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-success"></div>
                  <span className="text-sm font-semibold text-navy">
                    Showing on Map: <span className="text-school-blue">{activeCampus.name}</span>
                  </span>
                  <span className="text-xs text-text-muted hidden sm:inline">— {activeCampus.address}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {SCHOOL_BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedCampusId(b.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        selectedCampusId === b.id
                          ? 'bg-navy text-white shadow-sm'
                          : 'bg-neutral-light text-navy hover:bg-border/60'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-96 w-full relative bg-neutral-light">
                <iframe
                  title={`Map showing ${activeCampus.name}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(activeCampus.mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Action Button */}
      <div className="fixed bottom-6 right-6 z-40 group">
        <button
          type="button"
          onClick={() => setWhatsappModalOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:bg-[#20ba59] hover:scale-110 active:scale-95 transition-all cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 border-2 border-white"></span>
          </span>
          <WhatsAppIcon className="w-7 h-7" />
        </button>
        <div className="absolute right-16 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity bg-navy text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap">
          Chat on WhatsApp (2 Numbers)
        </div>
      </div>

      {/* WhatsApp Redirect Modal */}
      {whatsappModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm"
          onClick={() => setWhatsappModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setWhatsappModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-navy p-1.5 rounded-lg hover:bg-neutral-light transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] flex-shrink-0">
                <WhatsAppIcon className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">Chat on WhatsApp</h3>
                <p className="text-xs text-text-secondary">Select a contact number to connect directly with our school:</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {WHATSAPP_CONTACTS.map((wa, idx) => (
                <a
                  key={wa.phone}
                  href={wa.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWhatsappModalOpen(false)}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-[#25D366] bg-neutral-light/50 hover:bg-[#25D366]/5 transition-all group"
                >
                  <div>
                    <span className="text-[11px] font-semibold text-text-muted block mb-0.5">
                      {idx + 1}. {wa.label}
                    </span>
                    <span className="text-base font-bold text-navy group-hover:text-[#25D366] transition-colors">
                      {wa.display}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold group-hover:bg-[#20ba59] shadow-sm transition-colors">
                    <span>Chat Now</span>
                    <ExternalLink size={12} />
                  </span>
                </a>
              ))}
            </div>

            <div className="text-center pt-3 border-t border-border">
              <p className="text-xs text-text-muted">
                Available Mon – Sat: <span className="font-semibold text-navy">8:30 AM – 6:00 PM</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
