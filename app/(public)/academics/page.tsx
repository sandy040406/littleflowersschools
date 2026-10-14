import PageHero from '@/components/ui/PageHero';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { BookOpen, BrainCircuit, CheckCircle2, ChevronDown, Compass, FileText, FlaskConical, Lightbulb, PenTool, ArrowRight } from 'lucide-react';
import { ACADEMICS_FAQ } from '@/lib/mock-data';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Academics',
};

export default function AcademicsPage() {
  return (
    <>
      <PageHero
        title="Academic Excellence"
        subtitle="A well-rounded curriculum designed to foster critical thinking, creativity, and a genuine passion for lifelong learning."
        breadcrumb="Academics"
      />

      {/* ===== INTRODUCTION & METHODOLOGY ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <Badge variant="blue" className="mb-4">Our Methodology</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-6">
                Learning that goes beyond textbooks
              </h2>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  At Little Flowers Schools, we believe that education should be an engaging and interactive experience. Our pedagogical approach moves away from rote learning, focusing instead on conceptual understanding and real-world application.
                </p>
                <p>
                  Our curriculum is carefully structured to be age-appropriate, challenging, and supportive. We integrate modern technology with traditional teaching methods to create a dynamic classroom environment where students actively participate in their own learning journey.
                </p>
                <p>
                  We aim to develop not just academic proficiency, but also essential 21st-century skills such as critical thinking, collaboration, communication, and creativity.
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: BrainCircuit, title: 'Critical Thinking', desc: 'Analyzing information objectively to form well-reasoned judgments.' },
                { icon: Lightbulb, title: 'Creativity', desc: 'Encouraging innovative solutions and expressive thought.' },
                { icon: Compass, title: 'Inquiry-Based', desc: 'Learning driven by curiosity and questioning.' },
                { icon: FlaskConical, title: 'Experiential', desc: 'Hands-on learning through experiments and projects.' },
              ].map((item) => (
                <Card key={item.title} padding="sm" className="bg-soft-blue border-none">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-school-blue mb-3 shadow-sm">
                    <item.icon size={20} />
                  </div>
                  <h3 className="font-semibold text-navy text-sm mb-1">{item.title}</h3>
                  <p className="text-text-secondary text-xs">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== GRADE LEVELS ===== */}
      <section className="py-16 lg:py-24 bg-navy text-white">
        <div className="section-container">
          <SectionHeader
            title="Educational Journey"
            subtitle="Structured phases of learning tailored to the developmental needs of children at every age."
            centered={true}
          />
          {/* We use a div to trick the text color of the SectionHeader above which defaults to navy text for the title */}
          <style dangerouslySetInnerHTML={{__html: `
            .bg-navy h2 { color: white !important; }
            .bg-navy p.text-text-secondary { color: rgba(255,255,255,0.7) !important; }
          `}} />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Pre-Primary',
                grades: 'Nursery – KG',
                focus: 'Exploration & Play',
                features: ['Phonics and basic literacy', 'Number readiness', 'Motor skills development', 'Social interaction'],
                color: 'bg-gold'
              },
              {
                title: 'Primary',
                grades: 'Class I – V',
                focus: 'Foundation Building',
                features: ['Core language skills', 'Mathematical concepts', 'Environmental awareness', 'Creative expression'],
                color: 'bg-school-blue'
              },
              {
                title: 'Middle School',
                grades: 'Class VI – VIII',
                focus: 'Concept Expansion',
                features: ['Subject-specific learning', 'Scientific inquiry', 'Historical perspective', 'Language proficiency'],
                color: 'bg-white/20'
              },
              {
                title: 'Secondary',
                grades: 'Class IX – X',
                focus: 'Academic Preparation',
                features: ['Advanced concepts', 'Board exam preparation', 'Career counseling', 'Analytical skills'],
                color: 'bg-success'
              }
            ].map((level) => (
              <div key={level.title} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-colors">
                <div className={`${level.color} p-4`}>
                  <h3 className={`text-xl font-bold ${level.color === 'bg-white/20' ? 'text-white' : 'text-navy'} mb-1`}>{level.title}</h3>
                  <p className={`${level.color === 'bg-white/20' ? 'text-white/80' : 'text-navy/80'} text-sm font-medium`}>{level.grades}</p>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">Key Focus</span>
                    <p className="text-white font-medium">{level.focus}</p>
                  </div>
                  <ul className="space-y-3">
                    {level.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                        <CheckCircle2 size={16} className="text-gold flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ASSESSMENT & SUPPORT ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <Card padding="lg" className="border-school-blue/20">
              <div className="w-12 h-12 rounded-lg bg-school-blue/10 flex items-center justify-center text-school-blue mb-6">
                <FileText size={24} />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">Assessment Philosophy</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                We believe assessments should be tools for learning, not just of learning. Our continuous evaluation system takes the pressure off single, high-stakes exams.
              </p>
              <ul className="space-y-3 text-text-secondary text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-school-blue mt-2 flex-shrink-0" />
                  <span><strong>Formative Assessments:</strong> Regular class tests, quizzes, and project work to monitor ongoing progress.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-school-blue mt-2 flex-shrink-0" />
                  <span><strong>Summative Assessments:</strong> Term-end examinations to evaluate comprehensive understanding.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-school-blue mt-2 flex-shrink-0" />
                  <span><strong>Holistic Reports:</strong> Evaluating not just academics, but also participation, behavior, and co-curricular achievements.</span>
                </li>
              </ul>
            </Card>

            <Card padding="lg" className="border-gold/30">
              <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark mb-6">
                <BookOpen size={24} />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">Academic Support</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Every child learns at their own pace. We provide structured support systems to ensure no student falls behind and advanced learners remain challenged.
              </p>
              <ul className="space-y-3 text-text-secondary text-sm">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span><strong>Remedial Classes:</strong> Extra support for students who need additional help grasping specific concepts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span><strong>Peer Tutoring:</strong> Encouraging collaborative learning where students help each other under teacher supervision.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0" />
                  <span><strong>Enrichment Programs:</strong> Advanced projects and challenges for students who demonstrate high proficiency in specific subjects.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== CO-CURRICULAR ===== */}
      <section className="py-16 lg:py-24 bg-soft-blue">
        <div className="section-container">
          <SectionHeader
            title="Co-Curricular Integration"
            subtitle="Academics and co-curricular activities go hand in hand to provide a truly holistic education."
          />
          <div className="grid sm:grid-cols-3 gap-6">
            <Card className="text-center">
              <PenTool size={32} className="text-school-blue mx-auto mb-4" />
              <h3 className="font-bold text-navy mb-2">Arts & Expression</h3>
              <p className="text-sm text-text-secondary">Integrated visual and performing arts to foster creativity and cultural appreciation.</p>
            </Card>
            <Card className="text-center">
              <FlaskConical size={32} className="text-school-blue mx-auto mb-4" />
              <h3 className="font-bold text-navy mb-2">STEM Clubs</h3>
              <p className="text-sm text-text-secondary">Practical applications of science, technology, and math through collaborative club activities.</p>
            </Card>
            <Card className="text-center">
              <BookOpen size={32} className="text-school-blue mx-auto mb-4" />
              <h3 className="font-bold text-navy mb-2">Literary Events</h3>
              <p className="text-sm text-text-secondary">Debates, elocution, and creative writing to build strong communication skills and confidence.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 lg:py-24">
        <div className="section-container max-w-4xl">
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Common questions about our academic programs and approach."
          />
          <div className="space-y-4">
            {ACADEMICS_FAQ.map((faq, index) => (
              <details key={index} className="group bg-white rounded-lg border border-border shadow-sm overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-5 lg:p-6 cursor-pointer font-semibold text-navy hover:bg-soft-blue/50 transition-colors">
                  {faq.question}
                  <ChevronDown size={20} className="text-text-muted group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <div className="px-5 lg:px-6 pb-5 lg:pb-6 pt-0 text-text-secondary text-sm leading-relaxed border-t border-border/50">
                  <p className="pt-4">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      
      {/* ===== CTA ===== */}
      <section className="py-16 bg-navy text-center">
        <div className="section-container">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to join our academic community?</h2>
          <Button href="/enquiry" size="lg" className="bg-gold text-navy hover:bg-gold-light">
            Start Admissions Process <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </>
  );
}
