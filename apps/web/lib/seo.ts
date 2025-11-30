import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://browserleaks.io';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
}

/**
 * Generate metadata for a page
 */
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = '/og-image.png',
    noIndex = false,
    canonicalUrl,
  } = config;

  const fullTitle = title.includes('BrowserLeaks') ? title : `${title} | BrowserLeaks.io`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'BrowserLeaks.io Team' }],
    creator: 'BrowserLeaks.io',
    publisher: 'BrowserLeaks.io',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl || baseUrl,
      siteName: 'BrowserLeaks.io',
      images: [
        {
          url: image.startsWith('http') ? image : `${baseUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image.startsWith('http') ? image : `${baseUrl}${image}`],
      creator: '@browserleaks',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    },
  };
}

/**
 * Generate JSON-LD structured data for a test page
 */
export function generateTestPageJsonLd(config: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: config.name,
    description: config.description,
    url: config.url,
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    provider: {
      '@type': 'Organization',
      name: 'BrowserLeaks.io',
      url: baseUrl,
    },
  };
}

/**
 * Generate JSON-LD structured data for the organization
 */
export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BrowserLeaks.io',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Browser privacy testing and fingerprint detection tools',
    sameAs: [
      'https://twitter.com/browserleaks',
      'https://github.com/browserleaks',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@browserleaks.io',
    },
  };
}

/**
 * Generate JSON-LD structured data for a FAQ page
 */
export function generateFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate JSON-LD structured data for a HowTo guide
 */
export function generateHowToJsonLd(config: {
  name: string;
  description: string;
  steps: Array<{ name: string; text: string }>;
  totalTime?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    totalTime: config.totalTime,
    step: config.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

/**
 * Page-specific SEO configurations
 */
export const pagesSEO = {
  home: {
    title: 'BrowserLeaks.io - Free Browser Privacy & Fingerprint Test',
    description: 'Test your browser for privacy leaks, fingerprint uniqueness, IP exposure, DNS leaks, and WebRTC vulnerabilities. Free, comprehensive privacy analysis.',
    keywords: ['browser privacy test', 'fingerprint test', 'IP leak test', 'DNS leak test', 'WebRTC leak', 'browser fingerprint', 'online privacy'],
  },
  ipLeak: {
    title: 'IP Leak Test - Check Your Real IP Address',
    description: 'Detect if your real IP address is exposed despite using a VPN or proxy. Test for IPv4, IPv6, and WebRTC IP leaks with detailed geolocation info.',
    keywords: ['IP leak test', 'VPN leak test', 'IPv6 leak', 'IP address check', 'real IP detection', 'geolocation test'],
  },
  dnsLeak: {
    title: 'DNS Leak Test - Check Your DNS Security',
    description: 'Test your DNS for leaks that could expose your browsing activity. Detect ISP DNS usage and verify your VPN DNS protection is working.',
    keywords: ['DNS leak test', 'DNS security', 'VPN DNS leak', 'ISP DNS', 'DNS privacy', 'secure DNS'],
  },
  webrtcLeak: {
    title: 'WebRTC Leak Test - Detect IP Exposure',
    description: 'Check if WebRTC is leaking your local or public IP address. Test for STUN/TURN server vulnerabilities and mDNS leaks.',
    keywords: ['WebRTC leak test', 'WebRTC IP leak', 'STUN leak', 'local IP leak', 'WebRTC security'],
  },
  canvasFingerprint: {
    title: 'Canvas Fingerprint Test - Browser Tracking Detection',
    description: 'See your unique canvas fingerprint and learn how websites track you using HTML5 canvas rendering. Test your browser tracking resistance.',
    keywords: ['canvas fingerprint', 'canvas tracking', 'browser fingerprinting', 'HTML5 canvas', 'anti-tracking'],
  },
  webglFingerprint: {
    title: 'WebGL Fingerprint Test - GPU Detection',
    description: 'Detect your WebGL fingerprint including GPU vendor, renderer, and extensions. Understand how your graphics hardware makes you trackable.',
    keywords: ['WebGL fingerprint', 'GPU fingerprint', 'graphics fingerprint', 'WebGL tracking', 'GPU detection'],
  },
  audioFingerprint: {
    title: 'Audio Fingerprint Test - AudioContext Detection',
    description: 'Test your browser audio fingerprint generated by the Web Audio API. See how your audio hardware creates a unique identifier.',
    keywords: ['audio fingerprint', 'AudioContext fingerprint', 'Web Audio API', 'audio tracking', 'browser audio'],
  },
  fontDetection: {
    title: 'Font Detection Test - System Font Fingerprint',
    description: 'Discover which fonts are installed on your system. Font enumeration is a powerful tracking vector that reveals your unique font set.',
    keywords: ['font fingerprint', 'font detection', 'system fonts', 'font enumeration', 'font tracking'],
  },
  timezone: {
    title: 'Timezone Detection Test - Location Fingerprint',
    description: 'See how your timezone and locale settings can reveal your approximate location, even when using a VPN.',
    keywords: ['timezone fingerprint', 'locale detection', 'timezone tracking', 'location fingerprint', 'VPN timezone'],
  },
  browserFingerprint: {
    title: 'Browser Fingerprint Test - Comprehensive Analysis',
    description: 'Complete browser fingerprint analysis including navigator, screen, plugins, and hardware info. Calculate your uniqueness score.',
    keywords: ['browser fingerprint', 'browser tracking', 'fingerprint uniqueness', 'navigator fingerprint', 'device fingerprint'],
  },
  privacyScore: {
    title: 'Privacy Score - Overall Browser Privacy Rating',
    description: 'Get your comprehensive privacy score based on IP protection, DNS security, WebRTC leaks, and fingerprint resistance.',
    keywords: ['privacy score', 'privacy rating', 'browser privacy', 'privacy test', 'security score'],
  },
};
