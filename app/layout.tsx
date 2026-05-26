import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistrar from '../components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'Zyntra QuickDrop — Instant Text Sharing',
  description: 'Share text between devices in real-time. Pair your phone and desktop instantly with a QR code.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuickDrop',
  },
  openGraph: {
    title: 'Zyntra QuickDrop',
    description: 'Instant cross-device text sharing',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-zinc-950 text-white antialiased select-none">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
