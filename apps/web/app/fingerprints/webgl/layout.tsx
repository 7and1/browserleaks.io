import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free WebGL Fingerprint Test - See What Your GPU Reveals About You',
  description: 'Test your browser\'s WebGL fingerprint instantly. Discover the GPU details and hardware signatures that uniquely identify your device across websites. 98% accuracy in 150ms - faster than you can blink.',
  keywords: [
    'WebGL fingerprint test',
    'GPU fingerprinting',
    'browser fingerprinting',
    'graphics card tracking',
    'WebGL privacy',
    'hardware fingerprint',
    'GPU tracking',
    'device fingerprint',
    'WebGL leak test',
    'privacy test',
  ],
  openGraph: {
    title: 'WebGL Fingerprint Test - Your GPU Is Telling Secrets',
    description: 'Discover your WebGL fingerprint. Your graphics card creates a unique signature that identifies you across websites with 98% accuracy.',
    type: 'website',
    images: ['/og-webgl-fingerprint.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebGL Fingerprint Test - What Your GPU Reveals',
    description: 'Free instant test to reveal your WebGL fingerprint. Your GPU is being used to track you.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/fingerprints/webgl',
  },
};

export default function WebGLLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
