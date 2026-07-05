import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PinSaver - Pinterest Video Downloader',
  description: 'Download Pinterest videos in high resolution. Supports batch downloads, collections, bookmarks, and Chrome extension sync without using official API.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        {/* PWA support meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PinSaver" />
      </head>
      <body className={`${outfit.variable} font-sans min-h-screen relative`}>
        {/* Ambient background glows */}
        <div className="ambient-bg" />
        <div className="grid-bg" />
        
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
