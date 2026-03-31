import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { Toaster } from '@/components/ui/toaster';
import BottomNavbar from '@/components/layout/BottomNavbar';
import BrandHeader from '@/components/layout/BrandHeader';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LanguageProvider } from '@/components/providers/language-provider';

export const metadata: Metadata = {
  title: 'AyosGadget | Neural Repair Engine',
  description: 'Ang modernong platform para sa pag-aayos ng iyong gadgets at appliances.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AyosGadget',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#00f2ff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-primary-foreground pb-safe md:pb-0 overscroll-none">
        <ThemeProvider>
          <LanguageProvider>
            <FirebaseClientProvider>
              <div className="flex flex-col min-h-screen">
                <BrandHeader />
                <main className="flex-grow">
                  {children}
                </main>
                <BottomNavbar />
              </div>
              <Toaster />
            </FirebaseClientProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
