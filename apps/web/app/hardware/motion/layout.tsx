import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Motion Sensor Test - Check Accelerometer & Gyroscope Access',
  description: 'Test if your browser exposes motion sensors. Accelerometer and gyroscope data can reveal device orientation, movement patterns, and even typing behavior.',
  keywords: ['motion sensors', 'accelerometer', 'gyroscope', 'device motion', 'sensor API', 'motion tracking', 'device orientation'],
  openGraph: {
    title: 'Motion Sensor Test - Device Movement Exposure',
    description: 'Check if websites can access your accelerometer and gyroscope. Motion data reveals device behavior.',
    type: 'website',
    images: ['/og-motion.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motion Sensor Privacy Test',
    description: 'Free test to check if motion sensors are exposed to websites.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/hardware/motion',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
