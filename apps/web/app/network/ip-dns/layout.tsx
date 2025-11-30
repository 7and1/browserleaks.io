import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free IP & DNS Leak Test - Verify VPN Protection Status',
  description: 'Test for IP and DNS leaks instantly. Detect if your VPN is exposing your real IP address or DNS queries to your ISP. 21% of VPNs leak DNS requests.',
  keywords: ['IP leak test', 'DNS leak test', 'VPN test', 'IP address checker', 'DNS privacy', 'VPN leak', 'IP exposure'],
  openGraph: {
    title: 'IP & DNS Leak Test - Is Your VPN Really Working?',
    description: 'Verify your VPN is protecting both your IP address and DNS queries. Many VPNs leak despite claims.',
    type: 'website',
    images: ['/og-ip-dns-leak.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IP & DNS Leak Test - VPN Verification',
    description: 'Free test to check if your VPN is leaking your real IP or DNS queries.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/network/ip-dns',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
