'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SCHOOL_INFO } from '@/lib/mock-data';
import { simulateDelay } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await simulateDelay(1500);
    
    setLoading(false);
    setSuccess(true);
    showToast('Your message has been sent successfully. We will get back to you soon!', 'success');
    
    // Reset form
    (e.target as HTMLFormElement).reset();
    
    // Reset success state after a while
    setTimeout(() => setSuccess(false), 5000);
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
                    <p className="text-text-secondary">{SCHOOL_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold-dark flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Call Us</h3>
                    <a href={`tel:${SCHOOL_INFO.phone}`} className="text-text-secondary hover:text-school-blue transition-colors">
                      {SCHOOL_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Email Us</h3>
                    <a href={`mailto:${SCHOOL_INFO.email}`} className="text-text-secondary hover:text-school-blue transition-colors">
                      {SCHOOL_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center text-navy flex-shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-1">Office Hours</h3>
                    <p className="text-text-secondary">{SCHOOL_INFO.officeHours}</p>
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
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-sm font-medium text-navy">Full Name <span className="text-error">*</span></label>
                        <input 
                          type="text" 
                          id="name" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-medium text-navy">Email Address <span className="text-error">*</span></label>
                        <input 
                          type="email" 
                          id="email" 
                          required
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
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="subject" className="block text-sm font-medium text-navy">Subject</label>
                        <select 
                          id="subject" 
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue transition-all bg-white"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="admissions">Admissions</option>
                          <option value="feedback">Feedback</option>
                          <option value="careers">Careers</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="block text-sm font-medium text-navy">Your Message <span className="text-error">*</span></label>
                      <textarea 
                        id="message" 
                        required
                        rows={5}
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
            <div className="text-center bg-white/90 backdrop-blur p-6 rounded-xl shadow-sm border border-white max-w-sm mx-auto">
              <MapPin size={40} className="mx-auto mb-3 text-school-blue" />
              <h3 className="font-bold text-navy mb-1">Our Location</h3>
              <p className="text-sm text-text-secondary mb-4">{SCHOOL_INFO.address}</p>
              <Button variant="outline" size="sm" className="w-full">
                Get Directions
              </Button>
            </div>
            {/* Grid pattern to look like a map placeholder */}
            <div className="absolute inset-0 border-t border-l border-white/40" style={{ backgroundSize: '40px 40px', backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)', zIndex: 0 }} />
          </div>
        </div>
      </section>
    </>
  );
}
