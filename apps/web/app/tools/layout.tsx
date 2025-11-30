import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Tools - Password Generator, MAC Lookup & JavaScript Info',
  description: 'Free privacy tools including secure password generator, MAC address lookup, and JavaScript browser information. Essential utilities for privacy-conscious users.',
  keywords: ['privacy tools', 'password generator', 'MAC lookup', 'JavaScript info', 'security tools', 'browser info'],
  openGraph: {
    title: 'Privacy Tools - Security Utilities',
    description: 'Free privacy and security tools: password generator, MAC lookup, JavaScript browser info.',
    type: 'website',
    images: ['/og-tools.png'],
  },
  alternates: {
    canonical: 'https://browserleaks.io/tools',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
