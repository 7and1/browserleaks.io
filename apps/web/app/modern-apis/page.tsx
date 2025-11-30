import { ModernApiLab } from '@/components/labs/ModernApiLab';

export async function generateMetadata() {
  return {
    title: 'Modern API Lab - Bluetooth, USB & Credentials',
    description: 'Test modern browser APIs for privacy risks including Web Bluetooth, WebUSB, Clipboard API, and Credential Management. Discover how cutting-edge APIs can expose your data.',
    keywords: ['Web Bluetooth', 'WebUSB', 'Clipboard API', 'Credential Management', 'browser APIs', 'modern web APIs', 'API security'],
    openGraph: {
      title: 'Modern API Lab - Browser API Security',
      description: 'Test modern browser APIs for privacy risks and security vulnerabilities.',
      type: 'website',
      images: ['/og-modern-api-lab.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: 'Modern API Lab - Browser API Security',
      description: 'Bluetooth, USB, Clipboard, and Credential API security testing.',
    },
  };
}

export default function ModernApisPage() {
  return <ModernApiLab />;
}
