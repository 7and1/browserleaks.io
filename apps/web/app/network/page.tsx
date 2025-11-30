import { NetworkLab } from '@/components/labs/NetworkLab';

export async function generateMetadata() {
  return {
    title: 'Network Lab - Traceroute, JA3 & LAN Scanner',
    description: 'Analyze your network security with traceroute visualization, JA3 fingerprinting, LAN device discovery, and DNS beacon testing. Identify network-level privacy leaks.',
    keywords: ['network security', 'traceroute', 'JA3 fingerprint', 'LAN scanner', 'DNS beacon', 'network privacy', 'network analysis'],
    openGraph: {
      title: 'Network Lab - Network Security Analysis',
      description: 'Analyze your network security with traceroute, JA3 fingerprinting, and LAN scanning.',
      type: 'website',
      images: ['/og-network-lab.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Network Lab - Network Security Analysis',
      description: 'Traceroute, JA3 fingerprinting, and LAN device discovery.',
    },
  };
}

export default function NetworkPage() {
  return <NetworkLab />;
}
