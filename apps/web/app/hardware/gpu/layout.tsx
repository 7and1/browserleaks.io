import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free GPU Fingerprint Test - See Your Graphics Card Details',
  description: 'Test your GPU fingerprint. Discover the graphics card details exposed by WebGL including vendor, renderer, extensions, and parameters that uniquely identify your device.',
  keywords: ['GPU fingerprint', 'graphics card fingerprint', 'WebGL fingerprint', 'GPU tracking', 'hardware fingerprint', 'GPU identification'],
  openGraph: {
    title: 'GPU Fingerprint Test - Your Graphics Card Exposed',
    description: 'See the GPU details your browser exposes through WebGL. 98% identification accuracy.',
    type: 'website',
    images: ['/og-gpu.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Fingerprint Test',
    description: 'Free test to see your GPU details exposed via WebGL.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/hardware/gpu',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
