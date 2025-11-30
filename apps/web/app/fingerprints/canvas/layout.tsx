import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Canvas Fingerprint Test - See Your Browser\'s Unique Tracking Signature',
  description: 'Test your browser\'s canvas fingerprint instantly. Our free tool reveals the hidden tracking signature that identifies your device across websites - even in incognito mode. 83.6% of browsers are uniquely trackable.',
  keywords: [
    'canvas fingerprint test',
    'browser fingerprinting',
    'canvas tracking',
    'browser privacy test',
    'fingerprint protection',
    'anti-fingerprinting',
    'canvas blocker',
    'browser tracking',
    'device fingerprint',
    'privacy test',
  ],
  openGraph: {
    title: 'Canvas Fingerprint Test - Is Your Browser Being Tracked?',
    description: 'Discover your browser\'s unique canvas fingerprint. 83.6% of browsers are uniquely identifiable through this invisible tracking technique.',
    type: 'website',
    images: ['/og-canvas-fingerprint.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canvas Fingerprint Test - See Your Tracking Signature',
    description: 'Free instant test to reveal your browser\'s unique canvas fingerprint used for cross-site tracking.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/fingerprints/canvas',
  },
};

export default function CanvasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
