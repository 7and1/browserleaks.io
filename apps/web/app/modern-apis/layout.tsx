import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modern API Privacy Tests - Bluetooth, USB, MIDI & Clipboard',
  description: 'Test exposure of modern browser APIs. Check Web Bluetooth, Web USB, Web MIDI, and Clipboard access that can reveal connected devices and sensitive data.',
  keywords: ['Web Bluetooth', 'Web USB', 'Web MIDI', 'Clipboard API', 'browser APIs', 'device access', 'API privacy'],
  openGraph: {
    title: 'Modern API Privacy Tests - Device Access Analysis',
    description: 'Test which modern APIs your browser exposes for device access and data sharing.',
    type: 'website',
    images: ['/og-modern-apis.png'],
  },
  alternates: {
    canonical: 'https://browserleaks.io/modern-apis',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
