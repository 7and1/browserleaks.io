import { IdentityLab } from '@/components/labs/IdentityLab';

export async function generateMetadata() {
  return {
    title: 'Identity Lab - Canvas, WebGL, Audio & Font Fingerprinting',
    description: 'Comprehensive browser fingerprint analysis including Canvas, WebGL, Audio, and Font detection. Calculate your unique fingerprint hash and understand your tracking surface.',
    keywords: ['browser fingerprint', 'canvas fingerprint', 'WebGL fingerprint', 'audio fingerprint', 'font fingerprint', 'tracking prevention', 'fingerprint resistance'],
    openGraph: {
      title: 'Identity Lab - Browser Fingerprint Analysis',
      description: 'Comprehensive browser fingerprint analysis including Canvas, WebGL, Audio, and Font detection.',
      type: 'website',
      images: ['/og-identity-lab.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Identity Lab - Browser Fingerprint Analysis',
      description: 'Canvas, WebGL, Audio, and Font fingerprinting analysis.',
    },
  };
}

export default function FingerprintsPage() {
  return <IdentityLab />;
}
