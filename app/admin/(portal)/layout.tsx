import { LayoutDashboard, Users, Image as ImageIcon, Settings, Megaphone, MonitorPlay } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Enquiries', href: '/admin/enquiries', icon: <Users size={20} /> },
  { label: 'User Management', href: '/admin/users', icon: <Users size={20} /> },
  { label: 'Announcements', href: '/admin/content/announcements', icon: <Megaphone size={20} /> },
  { label: 'Hero Slider', href: '/admin/content/slider', icon: <MonitorPlay size={20} /> },
  { label: 'Gallery & Events', href: '#', icon: <ImageIcon size={20} /> },
  { label: 'Settings', href: '#', icon: <Settings size={20} /> },
];

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout role="admin" sidebarItems={sidebarItems}>
      {children}
    </PortalLayout>
  );
}
