import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Web MIDI Test - Check MIDI Device Exposure',
  description: 'Test Web MIDI API access. Check if websites can detect your MIDI devices including keyboards, controllers, and audio interfaces.',
  keywords: ['Web MIDI', 'MIDI API', 'MIDI devices', 'MIDI privacy', 'device access', 'music devices'],
  openGraph: {
    title: 'Web MIDI Test - Can Websites Detect Your MIDI Devices?',
    description: 'Check if Web MIDI API exposes your connected MIDI devices to websites.',
    type: 'website',
    images: ['/og-midi.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web MIDI Privacy Test',
    description: 'Free test to check Web MIDI device exposure.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/modern-apis/midi',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
