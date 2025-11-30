import { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { WebVitals } from '@/components/WebVitals';
import { SkipLink } from '@/components/ui/skip-link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://browserleaks.io';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'BrowserLeaks.io - Free Browser Privacy & Fingerprint Test',
    template: '%s | BrowserLeaks.io',
  },
  description: 'Test your browser for privacy leaks, fingerprint uniqueness, IP exposure, DNS leaks, and WebRTC vulnerabilities. Free, comprehensive privacy analysis.',
  keywords: ['browser privacy test', 'fingerprint test', 'IP leak test', 'DNS leak test', 'WebRTC leak', 'browser fingerprint', 'online privacy', 'VPN test'],
  authors: [{ name: 'BrowserLeaks.io Team' }],
  creator: 'BrowserLeaks.io',
  publisher: 'BrowserLeaks.io',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'BrowserLeaks.io',
    title: 'BrowserLeaks.io - Free Browser Privacy & Fingerprint Test',
    description: 'Test your browser for privacy leaks and fingerprint uniqueness. Free comprehensive privacy analysis.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BrowserLeaks.io - Browser Privacy Testing',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BrowserLeaks.io - Free Browser Privacy Test',
    description: 'Test your browser for privacy leaks and fingerprint uniqueness.',
    creator: '@browserleaks',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020617" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BrowserLeaks.io" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="@browserleaks" />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        <WebVitals />
        <SkipLink />

        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
          {/* Gradient orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-lab-grid opacity-30" />
        </div>

        {/* Header */}
        <Header />

        {/* Main content */}
        <main id="main-content" role="main" className="relative flex-1" tabIndex={-1}>
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
