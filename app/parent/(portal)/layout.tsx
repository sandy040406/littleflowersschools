import { LayoutDashboard, Image as ImageIcon, Users, Phone, Bell } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';

const sidebarItems = [
  { label: 'Dashboard', href: '/parent/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Children', href: '/parent/children', icon: <Users size={20} /> },
  { label: 'Notices & Circulars', href: '/parent/notices', icon: <Bell size={20} /> },
  { label: 'My Gallery', href: '/parent/gallery', icon: <ImageIcon size={20} /> },
  { label: 'Contact School', href: '/contact', icon: <Phone size={20} /> },
];

export default function ParentPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout role="parent" sidebarItems={sidebarItems}>
      {children}
    </PortalLayout>
  );
}
