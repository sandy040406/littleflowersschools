import Link from 'next/link';
import { Users, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import PageHero from '@/components/ui/PageHero';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Login',
};

export default function LoginGatewayPage() {
  return (
    <>
      <PageHero
        title="School Portals"
        subtitle="Access your dedicated dashboard to manage academics, view gallery, and stay connected."
        breadcrumb="Login"
      />

      <section className="py-16 lg:py-24 bg-soft-blue min-h-[60vh] flex items-center">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-navy mb-4">Select your portal</h2>
              <p className="text-text-secondary">
                Please select the appropriate portal to login to your account.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {/* Parent Portal */}
              <Link href="/parent/login" className="block group">
                <Card hover className="h-full flex flex-col items-center text-center border-school-blue/20 group-hover:border-school-blue transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-school-blue/10 flex items-center justify-center text-school-blue mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Parent Portal</h3>
                  <p className="text-sm text-text-secondary mb-6 flex-grow">
                    Access your child's academic progress, private gallery, and school communications.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-school-blue font-semibold text-sm group-hover:gap-2 transition-all">
                    Login to Parent Portal <ArrowRight size={16} />
                  </div>
                </Card>
              </Link>

              {/* Teacher Portal */}
              <Link href="/teacher/login" className="block group">
                <Card hover className="h-full flex flex-col items-center text-center border-gold/20 group-hover:border-gold transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold-dark mb-6 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Teacher Portal</h3>
                  <p className="text-sm text-text-secondary mb-6 flex-grow">
                    Manage classes, upload gallery media, and communicate with parents.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-gold-dark font-semibold text-sm group-hover:gap-2 transition-all">
                    Login to Teacher Portal <ArrowRight size={16} />
                  </div>
                </Card>
              </Link>

              {/* Admin Portal */}
              <Link href="/admin/login" className="block group">
                <Card hover className="h-full flex flex-col items-center text-center border-navy/20 group-hover:border-navy transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-navy/10 flex items-center justify-center text-navy mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-2">Admin Portal</h3>
                  <p className="text-sm text-text-secondary mb-6 flex-grow">
                    Manage school operations, users, events, and global settings.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-navy font-semibold text-sm group-hover:gap-2 transition-all">
                    Login to Admin Portal <ArrowRight size={16} />
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
