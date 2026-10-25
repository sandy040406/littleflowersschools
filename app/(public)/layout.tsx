import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

async function getLayoutSettings() {
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  try {
    const res = await fetch(`${base}/api/content/settings`, { next: { revalidate: 60 } });
    if (res.ok) return await res.json();
  } catch {}
  return null;
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getLayoutSettings();

  return (
    <>
      <Navbar initialSettings={settings} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
