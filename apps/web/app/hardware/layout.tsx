import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hardware Fingerprint Tests - GPU, Audio, Battery & Motion',
  description: 'Test your hardware fingerprint. Analyze GPU details, audio processing signatures, battery status exposure, and motion sensors that can uniquely identify your device.',
  keywords: ['hardware fingerprint', 'GPU fingerprint', 'audio fingerprint', 'battery API', 'motion sensors', 'device fingerprint'],
  openGraph: {
    title: 'Hardware Fingerprint Tests - Device Identification',
    description: 'Discover how your hardware creates unique fingerprints through GPU, audio, battery, and sensors.',
    type: 'website',
    images: ['/og-hardware.png'],
  },
  alternates: {
    canonical: 'https://browserleaks.io/hardware',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
