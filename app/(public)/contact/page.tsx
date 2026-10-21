'use client';

import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { submitContactForm } from '@/lib/enquiries';
import { getSiteSettings, SiteSettings } from '@/lib/content';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    phone: '+91 11 2345 6789',
    email: 'info@littleflowersschools.com',
    address: '123 Education Lane, New Delhi, India 110001',
    office_hours: 'Mon – Sat: 9:00 AM – 4:00 PM',
  });
  const { showToast } = useToast();

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
                <h2 className="text-2xl font-bold text-navy mb-6">Get in Touch</h2>
                <p className="text-text-secondary leading-relaxed mb-8">
                  Whether you're a prospective parent, a current family, or just want to learn more about our school, we're always happy to connect.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-school-blue/10 flex items-center justify-center text-school-blue flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Visit Us</h3>
                    <p className="text-text-secondary">{settings.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Call Us</h3>
                    <a href={`tel:${settings.phone}`} className="text-text-secondary hover:text-school-blue transition-colors">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Email Us</h3>
                    <a href={`mailto:${settings.email}`} className="text-text-secondary hover:text-school-blue transition-colors">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Office Hours</h3>
                    <p className="text-text-secondary">{settings.office_hours}</p>
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
          
          {/* Map Placeholder */}
          <div className="mt-16 rounded-2xl overflow-hidden border border-border bg-soft-blue h-96 relative flex items-center justify-center">
            <div className="text-center bg-white/90 backdrop-blur p-6 rounded-xl shadow-sm border border-white max-w-sm mx-auto z-10">
              <MapPin size={40} className="mx-auto mb-3 text-school-blue" />
              <h3 className="font-bold text-navy mb-1">Our Location</h3>
              <p className="text-sm text-text-secondary mb-4">{settings.address || 'Little Flowers Schools Campus'}</p>
              {settings.map_url ? (
                <a
                  href={settings.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center px-4 py-2 text-sm font-medium border border-border rounded-lg bg-white text-navy hover:bg-neutral-light transition-colors"
                >
                  Get Directions
                </a>
              ) : (
                <Button variant="outline" size="sm" className="w-full">
                  Get Directions
                </Button>
              )}
            </div>
            {/* Grid pattern to look like a map placeholder */}
            <div className="absolute inset-0 border-t border-l border-white/40" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)', zIndex: 0 }} />
          </div>
        </div>
      </section>
    </>
  );
}
