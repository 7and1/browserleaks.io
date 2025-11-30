import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Font Fingerprint Test - See What Your Installed Fonts Reveal',
  description: 'Test your browser\'s font fingerprint instantly. Discover how your installed fonts create a unique signature that identifies your OS, software, and browsing habits. Adds 10-15 bits of entropy to your trackability.',
  keywords: [
    'font fingerprint test',
    'font detection',
    'browser fingerprinting',
    'installed fonts privacy',
    'font enumeration',
    'typography tracking',
    'system fonts',
    'privacy test',
    'font fingerprinting',
    'browser tracking',
  ],
  openGraph: {
    title: 'Font Fingerprint Test - Your Fonts Are Tracking You',
    description: 'See how your installed fonts create a unique fingerprint. Font detection adds 10-15 bits of entropy to identify you.',
    type: 'website',
    images: ['/og-font-fingerprint.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Font Fingerprint Test - Typography Reveals Your Identity',
    description: 'Free instant test to see your font fingerprint. Your installed fonts reveal your OS, software, and identity.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/fingerprints/fonts',
  },
};

export default function FontsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
