import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Secure Password Generator - Create Strong Random Passwords',
  description: 'Generate cryptographically secure passwords instantly. Customize length, characters, and complexity. Client-side generation means passwords never leave your browser.',
  keywords: ['password generator', 'secure password', 'random password', 'strong password', 'password security', 'crypto random'],
  openGraph: {
    title: 'Secure Password Generator - Create Strong Passwords',
    description: 'Free cryptographically secure password generator. Passwords generated locally in your browser.',
    type: 'website',
    images: ['/og-password.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secure Password Generator',
    description: 'Free tool to generate cryptographically secure random passwords.',
  },
  alternates: {
    canonical: 'https://browserleaks.io/tools/password',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
