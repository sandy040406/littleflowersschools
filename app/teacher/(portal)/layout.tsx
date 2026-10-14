import { LayoutDashboard, Image as ImageIcon, UploadCloud } from 'lucide-react';
import PortalLayout from '@/components/portal/PortalLayout';

const sidebarItems = [
  { label: 'Dashboard', href: '/teacher/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Gallery & Events', href: '/teacher/gallery', icon: <ImageIcon size={20} /> },
  { label: 'Upload Media', href: '/teacher/gallery/upload', icon: <UploadCloud size={20} /> },
];

export default function TeacherPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalLayout role="teacher" sidebarItems={sidebarItems}>
      {children}
    </PortalLayout>
  );
}
