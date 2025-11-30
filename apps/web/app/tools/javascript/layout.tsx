import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free JavaScript Browser Info Test - See What JS Reveals',
  description: 'Explore all browser information exposed via JavaScript. Navigator properties, screen details, timezone, language, and dozens of other values websites can read.',
  keywords: ['JavaScript browser info', 'navigator object', 'screen properties', 'browser JavaScript', 'JS fingerprint', 'window object'],
  openGraph: {
    title: 'JavaScript Browser Info - What JS Can See',
    description: 'Comprehensive view of browser information accessible via JavaScript.',
    type: 'website',
    images: ['/og-javascript.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JavaScript Browser Info Test',
    description: 'Free test to see all browser info exposed via JavaScript.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/tools/javascript',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
