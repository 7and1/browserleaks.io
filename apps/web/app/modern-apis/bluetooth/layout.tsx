import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Web Bluetooth Test - Check Bluetooth Device Exposure',
  description: 'Test Web Bluetooth API access. Check if websites can discover your Bluetooth devices including headphones, fitness trackers, and smart home devices.',
  keywords: ['Web Bluetooth', 'Bluetooth API', 'Bluetooth devices', 'Bluetooth privacy', 'device fingerprint', 'Bluetooth tracking'],
  openGraph: {
    title: 'Web Bluetooth Test - Can Websites See Your Devices?',
    description: 'Check if Web Bluetooth exposes your connected devices to websites.',
    type: 'website',
    images: ['/og-bluetooth.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Bluetooth Privacy Test',
    description: 'Free test to check Web Bluetooth device exposure.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/modern-apis/bluetooth',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
