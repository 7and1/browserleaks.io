import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free HTTP Headers Fingerprint Test - See Your Browser Metadata',
  description: 'Analyze your HTTP request headers and fingerprint. See HTTP/2 pseudo-headers, Client Hints, Accept-Language and other metadata that uniquely identifies your browser.',
  keywords: ['HTTP headers', 'browser fingerprint', 'HTTP/2 fingerprint', 'Client Hints', 'Accept-Language', 'header fingerprinting'],
  openGraph: {
    title: 'HTTP Headers Fingerprint - Your Browser Metadata Exposed',
    description: 'Discover the HTTP headers your browser sends and how they can be used for fingerprinting.',
    type: 'website',
    images: ['/og-http-headers.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HTTP Headers Fingerprint Test',
    description: 'Free test to see your HTTP request headers and fingerprint.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/network/http-headers',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
