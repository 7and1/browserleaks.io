import { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Free Browser Privacy Dashboard - Complete Security Analysis',
  description: 'Run a complete privacy analysis on your browser in seconds. Test for IP leaks, DNS leaks, WebRTC vulnerabilities, and fingerprinting risks. See your privacy score and attack surface instantly.',
  keywords: [
    'browser privacy test',
    'privacy dashboard',
    'IP leak test',
    'DNS leak test',
    'WebRTC leak',
    'browser fingerprint',
    'privacy score',
    'security analysis',
    'VPN test',
    'browser security',
  ],
  openGraph: {
    title: 'Browser Privacy Dashboard - Know Your Exposure Level',
    description: 'Complete browser privacy analysis. Test for IP leaks, DNS leaks, WebRTC vulnerabilities, and fingerprinting risks in one dashboard.',
    type: 'website',
    images: ['/og-dashboard.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Browser Privacy Dashboard - Complete Security Analysis',
    description: 'Run a complete privacy analysis on your browser. Test for leaks and vulnerabilities in seconds.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/dashboard',
  },
};

export default function DashboardPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'BrowserLeaks Privacy Dashboard',
            description: 'Complete browser privacy analysis tool testing for IP leaks, DNS leaks, WebRTC vulnerabilities, and fingerprinting risks.',
            url: 'https://browserleaks.io/dashboard',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
      <DashboardContent />
    </>
  );
}
