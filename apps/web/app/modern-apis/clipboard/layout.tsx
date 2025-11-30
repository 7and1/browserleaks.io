import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Clipboard API Test - Check Clipboard Access Permissions',
  description: 'Test Clipboard API access. Check if websites can read or write to your clipboard, potentially accessing sensitive data like passwords or credit cards.',
  keywords: ['Clipboard API', 'clipboard access', 'clipboard privacy', 'clipboard permissions', 'copy paste security'],
  openGraph: {
    title: 'Clipboard API Test - Can Websites Read Your Clipboard?',
    description: 'Check if websites can access your clipboard contents. Clipboard hijacking is a real threat.',
    type: 'website',
    images: ['/og-clipboard.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clipboard Privacy Test',
    description: 'Free test to check clipboard read/write access.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/modern-apis/clipboard',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
