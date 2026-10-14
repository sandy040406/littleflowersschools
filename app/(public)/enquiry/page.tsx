'use client';

import { useState } from 'react';
import { Send, UserCircle2, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { submitEnquiry, type PreferredContact } from '@/lib/enquiries';

export default function EnquiryPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const get = (k: string) => String(fd.get(k) ?? '').trim();

    setLoading(true);
    setError(null);
    try {
      await submitEnquiry({
        parent_name: get('parent_name'),
        phone: get('phone'),
        email: get('email'),
        student_name: get('student_name') || undefined,
        grade_interested: get('grade_interested') || undefined,
        preferred_contact: (get('preferred_contact') || 'phone') as PreferredContact,
        message: get('message') || undefined,
        website: get('website') || undefined,
      });
      form.reset();
      setSuccess(true);
      showToast('Your enquiry has been submitted successfully!', 'success');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Admissions Enquiry"
        subtitle="Take the first step towards a bright future. Fill out the form below and our admissions team will contact you."
        breadcrumb="Enquiry"
      />

      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container max-w-4xl">
          <Card padding="lg" className="shadow-lg border-school-blue/10">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto mb-6">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-navy mb-4">Enquiry Submitted!</h2>
                <p className="text-lg text-text-secondary max-w-lg mx-auto mb-8">
                  Thank you for your interest in Little Flowers Schools. Our admissions office has received your enquiry and will contact you within 1-2 business days.
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => setSuccess(false)}>
                    Submit Another Enquiry
                  </Button>
                  <Button href="/">
                    Return to Home
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-navy mb-2">Enquiry Form</h2>
                  <p className="text-text-secondary">Please provide accurate information so we can assist you better.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Honeypot — hidden from humans, catches spam bots */}
                  <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                    <label htmlFor="website">Website</label>
                    <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                  </div>

                  {error && (
                    <div role="alert" className="flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  {/* Parent Details Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
                      <UserCircle2 size={20} className="text-school-blue" />
                      <h3 className="font-semibold text-navy text-lg">Parent / Guardian Details</h3>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="parentName" className="block text-sm font-medium text-navy">Full Name <span className="text-error">*</span></label>
                        <input 
                          type="text" 
                          id="parentName"
                          name="parent_name"
                          autoComplete="name" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                          placeholder="e.g. Rahul Sharma"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-sm font-medium text-navy">Phone Number <span className="text-error">*</span></label>
                        <input 
                          type="tel" 
                          id="phone"
                          name="phone"
                          autoComplete="tel" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-navy">Email Address <span className="text-error">*</span></label>
                        <input 
                          type="email" 
                          id="email"
                          name="email"
                          autoComplete="email" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                          placeholder="rahul@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Details Section */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border pb-2 mb-4">
                      <GraduationCap size={20} className="text-school-blue" />
                      <h3 className="font-semibold text-navy text-lg">Student Details</h3>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="studentName" className="block text-sm font-medium text-navy">Student Name <span className="text-error">*</span></label>
                        <input 
                          type="text" 
                          id="studentName"
                          name="student_name" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                          placeholder="e.g. Aarav Sharma"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="studentClass" className="block text-sm font-medium text-navy">Admission Sought For Class <span className="text-error">*</span></label>
                        <select 
                          id="studentClass"
                          name="grade_interested" 
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                        >
                          <option value="">Select Class...</option>
                          <option value="Pre-Primary">Pre-Primary (Nursery / KG)</option>
                          <option value="Class I">Class I</option>
                          <option value="Class II">Class II</option>
                          <option value="Class III">Class III</option>
                          <option value="Class IV">Class IV</option>
                          <option value="Class V">Class V</option>
                          <option value="Class VI">Class VI</option>
                          <option value="Class VII">Class VII</option>
                          <option value="Class VIII">Class VIII</option>
                          <option value="Class IX">Class IX</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Section */}
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label htmlFor="preferredContact" className="block text-sm font-medium text-navy">Preferred Contact Method</label>
                        <select 
                          id="preferredContact"
                          name="preferred_contact" 
                          className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white"
                        >
                          <option value="phone">Phone Call</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label htmlFor="message" className="block text-sm font-medium text-navy">Additional Questions or Comments</label>
                      <textarea 
                        id="message"
                        name="message"
                        maxLength={2000} 
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-school-blue/50 focus:border-school-blue bg-white resize-none"
                        placeholder="Let us know if you have any specific questions about curriculum, transport, timings, etc."
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      className="w-full sm:w-auto min-w-[200px]"
                      loading={loading}
                      icon={<Send size={18} />}
                    >
                      Submit Enquiry
                    </Button>
                    <p className="text-xs text-text-muted mt-4 text-center sm:text-left">
                      By submitting this form, you agree that Little Flowers Schools may contact you regarding admissions.
                    </p>
                  </div>
                </form>
              </>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
