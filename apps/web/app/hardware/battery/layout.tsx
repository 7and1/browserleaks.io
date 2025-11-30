import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Battery Status Test - Check Battery API Privacy Exposure',
  description: 'Test if your browser exposes battery status. The Battery Status API can reveal charging state, level, and timing that create unique device fingerprints for tracking.',
  keywords: ['battery API', 'battery fingerprint', 'battery status', 'battery tracking', 'device fingerprint', 'privacy test'],
  openGraph: {
    title: 'Battery Status Test - Is Your Battery Being Tracked?',
    description: 'Check if websites can read your battery status. Battery level + charging state = unique fingerprint.',
    type: 'website',
    images: ['/og-battery.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Battery Status Privacy Test',
    description: 'Free test to check if your battery status is exposed to websites.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/hardware/battery',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
