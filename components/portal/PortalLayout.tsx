'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, LogOut, Bell, Search, UserCircle, Loader2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { logout } from '@/lib/auth';
import { useSession, useHydrated } from '@/lib/session';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface PortalLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  sidebarItems: SidebarItem[];
}

export default function PortalLayout({ children, role, sidebarItems }: PortalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useSession();
  const authorized = session?.role === role;
  const user = authorized ? { name: session.name } : null;

  // Redirect to the right login page if not signed in for this portal
  useEffect(() => {
    if (hydrated && !authorized) {
      router.replace(`/${role}/login`);
    }
  }, [hydrated, authorized, role, router]);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = () => {
    logout();
    router.replace(`/${role}/login`);
  };

  if (!hydrated || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-soft-blue" aria-busy="true">
        <Loader2 className="animate-spin text-school-blue" size={32} />
        <span className="sr-only">Checking your session…</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-soft-blue overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-navy text-white flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 flex-shrink-0">
          <Link href="/" className="flex items-center">
            <div className="relative w-40 h-10 bg-white/5 rounded p-1">
              <Image src="/school_logo.jpeg" alt="School Logo" fill className="object-contain object-left" />
            </div>
          </Link>
          <button 
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info (Mobile only) */}
        <div className="p-6 border-b border-white/10 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-school-blue/20 flex items-center justify-center">
              <UserCircle size={24} className="text-school-blue" />
            </div>
            <div>
              <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-white/50 capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {sidebarItems.map((item) => {
            // Pages not built yet use href "#": show them disabled with a badge
            if (item.href === '#') {
              return (
                <span
                  key={item.label}
                  aria-disabled="true"
                  title="Coming soon"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/35 cursor-not-allowed select-none"
                >
                  <div className="text-white/25">{item.icon}</div>
                  {item.label}
                  <span className="ml-auto text-[10px] uppercase tracking-wide bg-white/10 text-white/50 px-1.5 py-0.5 rounded">
                    Soon
                  </span>
                </span>
              );
            }

            // Highlight only the most specific match (e.g. "Upload Media" not also "Gallery")
            const matches = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
            const bestMatch = sidebarItems
              .filter((i) => i.href !== '#' && matches(i.href))
              .sort((a, b) => b.href.length - a.href.length)[0];
            const isActive = bestMatch?.href === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-school-blue text-white shadow-md' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`${isActive ? 'text-white' : 'text-white/50'}`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            id="portal-sign-out"
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/5 hover:text-error transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-navy hover:bg-soft-blue rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Search (placeholder) */}
            <div className="hidden sm:flex items-center gap-2 bg-soft-blue px-3 py-2 rounded-lg text-text-muted focus-within:ring-2 focus-within:ring-school-blue/20 transition-shadow">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm text-text-primary w-48 lg:w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <button className="relative p-2 text-text-secondary hover:text-navy hover:bg-soft-blue rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white" />
            </button>
            
            <div className="hidden lg:flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right">
                <p className="font-semibold text-navy text-sm leading-tight">{user?.name || 'User'}</p>
                <p className="text-xs text-text-secondary capitalize">{role}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-school-blue/10 flex items-center justify-center text-school-blue font-bold shadow-sm">
                {user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-soft-blue p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
