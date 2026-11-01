'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Navigation, ExternalLink, School } from 'lucide-react';
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

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('main');
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
    </>
  );
}
