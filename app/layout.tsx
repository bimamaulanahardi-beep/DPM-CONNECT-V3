import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'DPM Connect — Sistem Informasi DPM ITB Riau',
    template: '%s | DPM Connect',
  },
  description:
    'Platform digital Dewan Perwakilan Mahasiswa ITB Riau. Transparansi, legislasi, dan aspirasi mahasiswa dalam satu sistem terintegrasi.',
  keywords: ['DPM', 'ITB Riau', 'Mahasiswa', 'Aspirasi', 'Legislasi', 'Transparansi'],
  openGraph: {
    title: 'DPM Connect — Sistem Informasi DPM ITB Riau',
    description: 'Platform digital Dewan Perwakilan Mahasiswa ITB Riau',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
