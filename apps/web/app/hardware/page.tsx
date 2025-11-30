import { HardwareLab } from '@/components/labs/HardwareLab';

export async function generateMetadata() {
  return {
    title: 'Hardware Lab - Device Sensors & Motion Detection',
    description: 'Explore hardware-level privacy leaks including battery status, device motion sensors, gyroscope data, and bio-rhythm analysis. Understand how your device hardware can identify you.',
    keywords: ['hardware fingerprint', 'device sensors', 'motion detection', 'battery status', 'gyroscope', 'accelerometer', 'device fingerprinting'],
    openGraph: {
      title: 'Hardware Lab - Device Sensor Analysis',
      description: 'Explore hardware-level privacy leaks from device sensors and motion data.',
      type: 'website',
      images: ['/og-hardware-lab.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Hardware Lab - Device Sensor Analysis',
      description: 'Battery, motion sensors, and hardware fingerprinting analysis.',
    },
  };
}

export default function HardwarePage() {
  return <HardwareLab />;
}
