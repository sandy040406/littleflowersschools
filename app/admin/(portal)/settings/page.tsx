'use client';

import { useState, useEffect } from 'react';
import { 
  Save, School, Phone, Mail, MapPin, Clock, Globe, Info, 
  Target, Lightbulb, CheckCircle2, UserCheck, Plus, Trash2, 
  Layers, Award, BookOpen, Compass
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ImageUploadField from '@/components/ui/ImageUploadField';
import { useToast } from '@/components/ui/Toast';
import { 
  getSiteSettings, updateSiteSettings, SiteSettings,
  FacilityItem, ActivityItem, JourneyStage 
} from '@/lib/content';
import { PLACEHOLDER_IMAGES, ACTIVITIES_DATA } from '@/lib/mock-data';

type SettingsTab = 'general' | 'principal' | 'facilities' | 'activities' | 'academics';

const DEFAULT_FACILITIES: FacilityItem[] = [
  { id: 'f1', imageUrl: PLACEHOLDER_IMAGES.classroom, title: 'Smart Classrooms', description: 'Spacious, well-lit classrooms equipped with interactive displays and ergonomic seating.' },
  { id: 'f2', imageUrl: PLACEHOLDER_IMAGES.library, title: 'Resource Library', description: 'A vast collection of books, digital resources, and quiet reading spaces.' },
  { id: 'f3', imageUrl: PLACEHOLDER_IMAGES.science, title: 'Science Laboratories', description: 'Fully equipped labs for Physics, Chemistry, and Biology to encourage hands-on learning.' },
  { id: 'f4', imageUrl: PLACEHOLDER_IMAGES.computer, title: 'Computer Labs', description: 'Modern computing facilities with high-speed internet and the latest software.' },
  { id: 'f5', imageUrl: PLACEHOLDER_IMAGES.playground, title: 'Sports Facilities', description: 'Expansive playgrounds and courts for various indoor and outdoor sports.' },
  { id: 'f6', imageUrl: PLACEHOLDER_IMAGES.music, title: 'Arts & Music Rooms', description: 'Dedicated studios for visual arts, classical music, and contemporary dance.' },
];

const DEFAULT_STAGES: JourneyStage[] = [
  {
    id: 'pre-primary',
    name: 'Pre-Primary',
    grades: 'Nursery – KG',
    focus: 'Exploration & Play',
    highlights: ['Phonics and basic literacy', 'Number readiness', 'Motor skills development', 'Social interaction'],
    color: 'bg-gold'
  },
  {
    id: 'primary',
    name: 'Primary',
    grades: 'Class I – V',
    focus: 'Foundation Building',
    highlights: ['Core language skills', 'Mathematical concepts', 'Environmental awareness', 'Creative expression'],
    color: 'bg-school-blue'
  },
  {
    id: 'middle',
    name: 'Middle School',
    grades: 'Class VI – VIII',
    focus: 'Concept Expansion',
    highlights: ['Subject-specific learning', 'Scientific inquiry', 'Historical perspective', 'Language proficiency'],
    color: 'bg-white/20'
  },
  {
    id: 'secondary',
    name: 'Secondary',
    grades: 'Class IX – X',
    focus: 'Academic Preparation',
    highlights: ['Advanced concepts', 'Board exam preparation', 'Career counseling', 'Analytical skills'],
    color: 'bg-success'
  }
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
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
    principal_name: '',
    principal_title: '',
    principal_image_url: '',
    principal_message: '',
  });

  const [facilities, setFacilities] = useState<FacilityItem[]>(DEFAULT_FACILITIES);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stages, setStages] = useState<JourneyStage[]>(DEFAULT_STAGES);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const data = await getSiteSettings();
        setForm(data);

        // Parse facilities
        if (data.facilities_json) {
          try {
            const parsed = JSON.parse(data.facilities_json);
            if (Array.isArray(parsed) && parsed.length > 0) setFacilities(parsed);
          } catch {}
        }

        // Parse activities
        if (data.activities_json) {
          try {
            const parsed = JSON.parse(data.activities_json);
            if (Array.isArray(parsed) && parsed.length > 0) setActivities(parsed);
          } catch {}
        } else {
          // Initialize with mock activities data
          setActivities(ACTIVITIES_DATA.map((a, i) => ({
            id: `act-${i + 1}`,
            title: a.title,
            description: a.description,
            imageUrl: a.imageUrl,
            icon: a.icon,
            bullets: a.title === 'Sports' 
              ? ['Athletics & Track Events', 'Team Sports (Cricket, Football, Kho-Kho)', 'Indoor Games & Chess']
              : a.title === 'Clubs'
              ? ['Science & Innovation Club', 'Eco & Nature Club', 'Literary & Debate Society']
              : ['Regular weekly practice sessions', 'Expert guidance & mentorship', 'Showcases, annual days & competitions'],
          })));
        }

        // Parse educational journey
        if (data.educational_journey_json) {
          try {
            const parsed = JSON.parse(data.educational_journey_json);
            if (Array.isArray(parsed) && parsed.length > 0) setStages(parsed);
          } catch {}
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const payload: Partial<SiteSettings> = {
        ...form,
        facilities_json: JSON.stringify(facilities),
        activities_json: JSON.stringify(activities),
        educational_journey_json: JSON.stringify(stages),
      };

      const updated = await updateSiteSettings(payload);
      setForm(updated);
      showToast('All school settings, photos, and copy saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Facility item helpers
  const updateFacility = (index: number, key: keyof FacilityItem, value: string) => {
    const next = [...facilities];
    next[index] = { ...next[index], [key]: value };
    setFacilities(next);
  };

  const addFacility = () => {
    setFacilities([
      ...facilities,
      {
        id: `f-${Date.now()}`,
        title: 'New Campus Facility',
        description: 'Provide details about this facility, equipment, and student benefits.',
        imageUrl: PLACEHOLDER_IMAGES.school,
      },
    ]);
  };

  const removeFacility = (index: number) => {
    if (confirm('Are you sure you want to remove this facility?')) {
      setFacilities(facilities.filter((_, i) => i !== index));
    }
  };

  // Activity item helpers
  const updateActivity = (index: number, key: keyof ActivityItem, value: any) => {
    const next = [...activities];
    next[index] = { ...next[index], [key]: value };
    setActivities(next);
  };

  const addActivity = () => {
    setActivities([
      ...activities,
      {
        id: `act-${Date.now()}`,
        title: 'New Student Activity',
        description: 'Describe this activity or sport, coaching, and student engagement.',
        imageUrl: PLACEHOLDER_IMAGES.sports,
        icon: 'Trophy',
        bullets: ['Weekly training sessions', 'Inter-house competitions', 'Annual showcase'],
      },
    ]);
  };

  const removeActivity = (index: number) => {
    if (confirm('Are you sure you want to remove this activity?')) {
      setActivities(activities.filter((_, i) => i !== index));
    }
  };

  // Journey stage helpers
  const updateStage = (index: number, key: keyof JourneyStage, value: any) => {
    const next = [...stages];
    next[index] = { ...next[index], [key]: value };
    setStages(next);
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading school settings...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-navy mb-1">School &amp; Website CMS</h1>
          <p className="text-text-secondary text-sm">
            Update your school branding, Principal message, photos, campus facilities, and student activities.
          </p>
        </div>
        <Button 
          type="button" 
          size="md" 
          loading={saving} 
          icon={<Save size={18} />}
          onClick={handleSubmit}
        >
          Save All Changes
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-border pb-2">
        {[
          { id: 'general', label: 'School Info & Contact', icon: School },
          { id: 'principal', label: 'Principal & About Us', icon: UserCheck },
          { id: 'facilities', label: 'Campus Facilities', icon: Layers },
          { id: 'activities', label: 'Student Activities', icon: Award },
          { id: 'academics', label: 'Academic Journey', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-school-blue text-white shadow-sm' 
                  : 'text-text-secondary hover:text-navy hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: GENERAL & CONTACT                                  */}
        {/* ========================================================= */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-school-blue/10 flex items-center justify-center text-school-blue">
                  <School size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">Identity &amp; Contact Info</h2>
                  <p className="text-xs text-text-muted">Displayed in your site header, footer, and contact page</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">School Official Name *</label>
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
                    placeholder="e.g. Growing Curious Minds. Building Confident Futures."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Primary Phone Number</label>
                  <input
                    type="text"
                    value={form.phone || ''}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 97898 27060"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Official Email Address</label>
                  <input
                    type="email"
                    value={form.email || ''}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="info@littleflowersschools.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-navy mb-1">Campus Full Postal Address</label>
                  <textarea
                    rows={2}
                    value={form.address || ''}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Rajaji Street, Tambaram, Chennai, Tamil Nadu 600063"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">School Timings &amp; Office Hours</h2>
                  <p className="text-xs text-text-muted">Working days, student timings, and office visitor hours</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">School Class Timings</label>
                  <input
                    type="text"
                    value={form.school_timings || ''}
                    onChange={e => setForm({ ...form, school_timings: e.target.value })}
                    placeholder="Mon – Fri: 8:30 AM – 3:30 PM"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Administrative Office Hours</label>
                  <input
                    type="text"
                    value={form.office_hours || ''}
                    onChange={e => setForm({ ...form, office_hours: e.target.value })}
                    placeholder="Mon – Sat: 9:00 AM – 4:30 PM"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-navy mb-1">Google Maps Embed URL</label>
                  <input
                    type="text"
                    value={form.map_url || ''}
                    onChange={e => setForm({ ...form, map_url: e.target.value })}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRINCIPAL & ABOUT US                               */}
        {/* ========================================================= */}
        {activeTab === 'principal' && (
          <div className="space-y-6">
            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-school-blue/10 flex items-center justify-center text-school-blue">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">Leadership Desk (Message from the Principal)</h2>
                  <p className="text-xs text-text-muted">Displayed prominently on your About page with photo and message</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 items-start">
                <div>
                  <ImageUploadField
                    label="Principal Photo"
                    value={form.principal_image_url || ''}
                    onChange={(url) => setForm({ ...form, principal_image_url: url })}
                    aspectRatio="square"
                  />
                  <p className="text-[11px] text-text-muted mt-2">
                    Upload a high-resolution portrait photo (PNG, JPG, max 5MB).
                  </p>
                </div>

                <div className="lg:col-span-2 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Principal / Headmistress Name</label>
                      <input
                        type="text"
                        value={form.principal_name || ''}
                        onChange={e => setForm({ ...form, principal_name: e.target.value })}
                        placeholder="e.g. Mrs. S. Jayanthi, M.A., B.Ed."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Designation / Title</label>
                      <input
                        type="text"
                        value={form.principal_title || ''}
                        onChange={e => setForm({ ...form, principal_title: e.target.value })}
                        placeholder="e.g. Principal / Correspondent / Headmistress"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Message from the Principal</label>
                    <textarea
                      rows={6}
                      value={form.principal_message || ''}
                      onChange={e => setForm({ ...form, principal_message: e.target.value })}
                      placeholder="Welcome note to parents and students. Use double line breaks between paragraphs."
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                    />
                    <p className="text-[11px] text-text-muted mt-1">Separate paragraphs with an empty line.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3 mb-6 pb-3 border-b border-border">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark">
                  <Info size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy">About Us, Vision &amp; Mission</h2>
                  <p className="text-xs text-text-muted">School story and guiding pillars shown on the About page</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">About School Overview</label>
                  <textarea
                    rows={4}
                    value={form.about_text || ''}
                    onChange={e => setForm({ ...form, about_text: e.target.value })}
                    placeholder="The history, foundation, and values of Little Flowers School..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Our Vision</label>
                  <textarea
                    rows={3}
                    value={form.vision_text || ''}
                    onChange={e => setForm({ ...form, vision_text: e.target.value })}
                    placeholder="1. To impart wisdom and knowledge... 2. To shape responsible citizens..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                  />
                  <p className="text-[11px] text-text-muted mt-0.5">Tip: Points starting with numbers (1., 2.) are automatically formatted into individual cards.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Our Mission</label>
                  <textarea
                    rows={4}
                    value={form.mission_text || ''}
                    onChange={e => setForm({ ...form, mission_text: e.target.value })}
                    placeholder="1. Holistic Development: Adopt innovative methods... 2. Values: Instill ethics..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                  />
                  <p className="text-[11px] text-text-muted mt-0.5">Tip: Points with titles (e.g. 1. Title: Description) get bold subheadings.</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CAMPUS FACILITIES                                  */}
        {/* ========================================================= */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy">Campus Environment &amp; Facilities</h2>
                <p className="text-xs text-text-muted">Upload real campus photos and edit descriptions for each facility</p>
              </div>
              <Button type="button" variant="outline" size="sm" icon={<Plus size={16} />} onClick={addFacility}>
                Add Facility
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility, index) => (
                <Card key={facility.id} padding="none" className="overflow-hidden border border-border bg-white flex flex-col justify-between shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-bold text-school-blue uppercase tracking-wider">Facility #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeFacility(index)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Remove facility"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-4 space-y-3 flex-1">
                    <ImageUploadField
                      label="Facility Image"
                      value={facility.imageUrl}
                      onChange={(url) => updateFacility(index, 'imageUrl', url)}
                      aspectRatio="video"
                    />

                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Facility Name</label>
                      <input
                        type="text"
                        value={facility.title}
                        onChange={e => updateFacility(index, 'title', e.target.value)}
                        placeholder="e.g. Science Laboratory"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={facility.description}
                        onChange={e => updateFacility(index, 'description', e.target.value)}
                        placeholder="Describe the facility..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-none"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STUDENT ACTIVITIES                                 */}
        {/* ========================================================= */}
        {activeTab === 'activities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy">Student Activities &amp; Sports</h2>
                <p className="text-xs text-text-muted">Customize your school's sports, cultural events, celebrations, and clubs</p>
              </div>
              <Button type="button" variant="outline" size="sm" icon={<Plus size={16} />} onClick={addActivity}>
                Add Activity
              </Button>
            </div>

            <div className="space-y-6">
              {activities.map((activity, index) => (
                <Card key={activity.id} padding="lg" className="border border-border bg-white">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-school-blue/10 text-school-blue font-bold text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <h3 className="font-bold text-navy text-base">{activity.title || 'Untitled Activity'}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeActivity(index)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition-colors flex items-center gap-1 text-xs font-medium"
                    >
                      <Trash2 size={16} /> Delete Activity
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6 items-start">
                    <div>
                      <ImageUploadField
                        label="Activity Photo"
                        value={activity.imageUrl}
                        onChange={(url) => updateActivity(index, 'imageUrl', url)}
                        aspectRatio="video"
                      />
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Activity Name</label>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={e => updateActivity(index, 'title', e.target.value)}
                            placeholder="e.g. Sports &amp; Athletics"
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-navy mb-1">Icon Style</label>
                          <select
                            value={activity.icon || 'Trophy'}
                            onChange={e => updateActivity(index, 'icon', e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue bg-white"
                          >
                            <option value="Trophy">Trophy (Sports)</option>
                            <option value="Music">Music &amp; Arts</option>
                            <option value="PartyPopper">Party Popper (Celebrations)</option>
                            <option value="Users">Users (Clubs &amp; Teams)</option>
                            <option value="Award">Award (Competitions)</option>
                            <option value="MapPin">MapPin (Trips &amp; Excursions)</option>
                            <option value="Heart">Heart (Community Service)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={activity.description}
                          onChange={e => updateActivity(index, 'description', e.target.value)}
                          placeholder="Comprehensive details about this program..."
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-navy mb-1">
                          Key Highlights / Bullets (One per line)
                        </label>
                        <textarea
                          rows={3}
                          value={(activity.bullets || []).join('\n')}
                          onChange={e => {
                            const lines = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                            updateActivity(index, 'bullets', lines);
                          }}
                          placeholder="Cricket, Football, Athletics&#10;Inter-school tournaments&#10;Qualified coaches"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ACADEMIC JOURNEY                                   */}
        {/* ========================================================= */}
        {activeTab === 'academics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-navy">Educational Journey &amp; Levels</h2>
              <p className="text-xs text-text-muted">Manage the 4 learning phases shown on the Academics page</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {stages.map((stage, index) => (
                <Card key={stage.id} padding="lg" className="border border-border bg-white space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-wider text-school-blue">Stage #{index + 1}</span>
                    <span className="text-xs text-text-muted font-medium">{stage.grades}</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Stage Name</label>
                      <input
                        type="text"
                        value={stage.name}
                        onChange={e => updateStage(index, 'name', e.target.value)}
                        placeholder="e.g. Pre-Primary"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy mb-1">Grades Offered</label>
                      <input
                        type="text"
                        value={stage.grades}
                        onChange={e => updateStage(index, 'grades', e.target.value)}
                        placeholder="e.g. Pre-KG to UKG"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Key Focus</label>
                    <input
                      type="text"
                      value={stage.focus}
                      onChange={e => updateStage(index, 'focus', e.target.value)}
                      placeholder="e.g. Exploration &amp; Foundational Literacy"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1">Highlights (One per line)</label>
                    <textarea
                      rows={3}
                      value={(stage.highlights || []).join('\n')}
                      onChange={e => {
                        const lines = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                        updateStage(index, 'highlights', lines);
                      }}
                      placeholder="Phonics &amp; basic numbers&#10;Social interaction&#10;Fine motor skills"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border focus:ring-2 focus:ring-school-blue resize-y"
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Global Save Button at bottom */}
        <div className="flex justify-end pt-6 border-t border-border">
          <Button type="submit" size="lg" loading={saving} icon={<Save size={18} />}>
            Save All Settings &amp; Content
          </Button>
        </div>
      </form>
    </div>
  );
}
