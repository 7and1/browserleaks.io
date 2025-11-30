import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Web USB Test - Check USB Device Exposure',
  description: 'Test Web USB API access. Check if websites can access your USB devices including Arduino, hardware keys, and USB peripherals.',
  keywords: ['Web USB', 'USB API', 'USB devices', 'USB privacy', 'device access', 'USB fingerprint'],
  openGraph: {
    title: 'Web USB Test - Can Websites Access Your USB Devices?',
    description: 'Check if Web USB API exposes your connected USB devices to websites.',
    type: 'website',
    images: ['/og-usb.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web USB Privacy Test',
    description: 'Free test to check Web USB device exposure.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/modern-apis/usb',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
