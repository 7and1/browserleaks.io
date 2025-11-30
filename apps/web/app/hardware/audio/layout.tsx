import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Audio Fingerprint Test - Analyze Your Audio Processing Signature',
  description: 'Test your audio fingerprint. Discover how the Web Audio API creates unique signatures based on your device audio processing characteristics. Used by trackers worldwide.',
  keywords: ['audio fingerprint', 'AudioContext fingerprint', 'Web Audio API', 'audio tracking', 'browser fingerprint', 'audio fingerprinting'],
  openGraph: {
    title: 'Audio Fingerprint Test - Your Sound Signature',
    description: 'Your audio hardware creates a unique fingerprint. See how websites can identify you through sound.',
    type: 'website',
    images: ['/og-audio.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audio Fingerprint Test',
    description: 'Free test to reveal your audio fingerprint used for browser tracking.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/hardware/audio',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
