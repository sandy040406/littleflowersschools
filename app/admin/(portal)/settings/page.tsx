'use client';

import { useState, useEffect } from 'react';
import { Save, School, Phone, Mail, MapPin, Clock, Globe, Info, Compass, Target, CheckCircle2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getSiteSettings, updateSiteSettings, SiteSettings } from '@/lib/content';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [form, setForm] = useState<Partial<SiteSettings>>({
    school_name: '',
    tagline: '',
    phone: '',
    email: '',
    address: '',
    office_hours: '',
    school_timings: '',
    map_url: '',
    facebook_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: '',
    about_text: '',
    vision_text: '',
    mission_text: '',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const data = await getSiteSettings();
        setForm(data);
      } catch (err: any) {
        showToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await updateSiteSettings(form);
      setForm(updated);
      showToast('School settings & site copy saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading school settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-1">School & Website Settings</h1>
        <p className="text-text-secondary">
          Update your school contact details, office hours, social channels, and about/mission texts. Changes reflect live on the website.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic School Information */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <School size={20} className="text-school-blue" />
            <h2 className="text-lg font-bold text-navy">General School Details</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">School Name *</label>
              <input
                type="text"
                required
                value={form.school_name || ''}
                onChange={e => setForm({ ...form, school_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">School Tagline / Motto</label>
              <input
                type="text"
                value={form.tagline || ''}
                onChange={e => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="e.g. Growing Curious Minds. Building Confident Futures."
              />
            </div>
          </div>
        </Card>

        {/* Contact & Location Details */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Phone size={20} className="text-gold-dark" />
            <h2 className="text-lg font-bold text-navy">Contact & Timings (Displayed in Header & Footer)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Main Phone Number</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="+91 11 2345 6789"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Official Email Address</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="info@littleflowersschools.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Student School Timings</label>
              <input
                type="text"
                value={form.school_timings || ''}
                onChange={e => setForm({ ...form, school_timings: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="Mon – Fri: 8:00 AM – 2:30 PM"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Office / Reception Hours</label>
              <input
                type="text"
                value={form.office_hours || ''}
                onChange={e => setForm({ ...form, office_hours: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="Mon – Sat: 9:00 AM – 4:00 PM"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-navy mb-1">Campus Full Physical Address</label>
              <input
                type="text"
                value={form.address || ''}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="123 Education Lane, New Delhi, India 110001"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-navy mb-1">Google Maps Link / URL</label>
              <input
                type="text"
                value={form.map_url || ''}
                onChange={e => setForm({ ...form, map_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>
        </Card>

        {/* Social Media Links */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Globe size={20} className="text-school-blue" />
            <h2 className="text-lg font-bold text-navy">Social Media Links</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Facebook URL</label>
              <input
                type="text"
                value={form.facebook_url || ''}
                onChange={e => setForm({ ...form, facebook_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Instagram URL</label>
              <input
                type="text"
                value={form.instagram_url || ''}
                onChange={e => setForm({ ...form, instagram_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">YouTube URL</label>
              <input
                type="text"
                value={form.youtube_url || ''}
                onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Twitter / X URL</label>
              <input
                type="text"
                value={form.twitter_url || ''}
                onChange={e => setForm({ ...form, twitter_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </Card>

        {/* Editable Site Information: About, Vision, Mission */}
        <Card>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <Info size={20} className="text-gold-dark" />
            <h2 className="text-lg font-bold text-navy">About, Vision & Mission Texts</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">About the School (Overview)</label>
              <textarea
                rows={3}
                value={form.about_text || ''}
                onChange={e => setForm({ ...form, about_text: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Our Vision</label>
              <textarea
                rows={4}
                value={form.vision_text || ''}
                onChange={e => setForm({ ...form, vision_text: e.target.value })}
                placeholder="e.g. 1. To impart wisdom and knowledge... 2. To shape responsible citizens..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
              />
              <p className="text-[11px] text-text-muted mt-0.5">Tip: Points starting with numbers (1., 2.) or new lines will be styled into individual cards automatically.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-navy mb-1">Our Mission</label>
              <textarea
                rows={4}
                value={form.mission_text || ''}
                onChange={e => setForm({ ...form, mission_text: e.target.value })}
                placeholder="e.g. 1. Holistic Development: Adopt innovative methods... 2. Values: Instill ethics..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
              />
              <p className="text-[11px] text-text-muted mt-0.5">Tip: Points with titles (e.g. 1. Title: Description) will have bold title badges.</p>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" loading={saving} icon={<Save size={18} />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
