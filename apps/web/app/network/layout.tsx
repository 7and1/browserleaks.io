import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Network Privacy Tests - IP, DNS, TLS & WebRTC Analysis',
  description: 'Comprehensive network privacy tests including IP detection, DNS leak tests, HTTP header analysis, TLS/JA3 fingerprinting, and WebRTC vulnerability scanning.',
  keywords: ['network privacy test', 'IP leak', 'DNS leak', 'TLS fingerprint', 'WebRTC leak', 'HTTP headers', 'VPN test'],
  openGraph: {
    title: 'Network Privacy Tests - Complete Analysis Suite',
    description: 'Test your network privacy with IP, DNS, TLS, and WebRTC analysis tools.',
    type: 'website',
    images: ['/og-network.png'],
  },
  alternates: {
    canonical: 'https://browserleaks.io/network',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
