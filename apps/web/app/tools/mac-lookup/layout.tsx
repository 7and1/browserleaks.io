import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free MAC Address Lookup - Find Device Manufacturer from MAC',
  description: 'Look up any MAC address to find the device manufacturer. Identify network device vendors from their OUI (Organizationally Unique Identifier).',
  keywords: ['MAC address lookup', 'MAC vendor', 'OUI lookup', 'network device', 'manufacturer lookup', 'IEEE OUI'],
  openGraph: {
    title: 'MAC Address Lookup - Find Device Manufacturer',
    description: 'Free MAC address lookup tool. Identify device manufacturers from MAC/OUI.',
    type: 'website',
    images: ['/og-mac-lookup.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAC Address Lookup Tool',
    description: 'Free tool to look up MAC address manufacturers.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/tools/mac-lookup',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
