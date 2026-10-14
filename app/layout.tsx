import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Little Flowers Schools",
    template: "%s | Little Flowers Schools",
  },
  description:
    "Growing Curious Minds. Building Confident Futures. Little Flowers Schools provides quality education in a warm, nurturing environment.",
  keywords: ["school", "education", "Little Flowers Schools", "admissions"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased bg-warm-white text-text-primary">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
