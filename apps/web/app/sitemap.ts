import { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://browserleaks.io';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    // Main pages
    '',
    '/tests',
    '/history',
    '/about',

    // Test pages
    '/tests/ip-leak',
    '/tests/dns-leak',
    '/tests/webrtc-leak',
    '/tests/canvas-fingerprint',
    '/tests/webgl-fingerprint',
    '/tests/audio-fingerprint',
    '/tests/font-detection',
    '/tests/timezone',
    '/tests/browser-fingerprint',
    '/tests/privacy-score',
  ];

  const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'ru', 'pt', 'it'];

  const sitemap: MetadataRoute.Sitemap = [];

  // Add all routes for each locale
  for (const locale of locales) {
    for (const route of routes) {
      sitemap.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route.startsWith('/tests') ? 0.8 : 0.6,
      });
    }
  }

  return sitemap;
}
