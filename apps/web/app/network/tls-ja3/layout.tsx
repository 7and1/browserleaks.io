import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free TLS/JA3 Fingerprint Test - See Your SSL/TLS Signature',
  description: 'Test your TLS/JA3 fingerprint. Discover the unique SSL/TLS handshake signature that identifies your browser and can be used for tracking even over encrypted connections.',
  keywords: ['TLS fingerprint', 'JA3 fingerprint', 'SSL fingerprint', 'TLS tracking', 'browser fingerprint', 'encrypted traffic fingerprint'],
  openGraph: {
    title: 'TLS/JA3 Fingerprint Test - Your Encrypted Signature',
    description: 'Your TLS handshake creates a unique fingerprint. See your JA3 hash and learn how it identifies you.',
    type: 'website',
    images: ['/og-tls-ja3.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TLS/JA3 Fingerprint Test',
    description: 'Free test to see your TLS fingerprint used to identify your browser.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/network/tls-ja3',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
