/**
 * CSS Media Features Collector
 */

import type { MediaFeaturesFingerprint, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function matchMedia(query: string): boolean {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

function getColorGamut(): string {
  if (matchMedia('(color-gamut: rec2020)')) return 'rec2020';
  if (matchMedia('(color-gamut: p3)')) return 'p3';
  if (matchMedia('(color-gamut: srgb)')) return 'srgb';
  return 'unknown';
}

function getContrast(): string {
  if (matchMedia('(prefers-contrast: more)')) return 'more';
  if (matchMedia('(prefers-contrast: less)')) return 'less';
  if (matchMedia('(prefers-contrast: custom)')) return 'custom';
  return 'no-preference';
}

function getMonochrome(): number {
  // Check for monochrome display and return bits per pixel
  for (let i = 0; i <= 100; i++) {
    if (matchMedia(`(monochrome: ${i})`)) return i;
  }
  return 0;
}

function getMediaFeaturesFingerprintInternal(): MediaFeaturesFingerprint {
  return {
    colorGamut: getColorGamut(),
    contrast: getContrast(),
    invertedColors: matchMedia('(inverted-colors: inverted)'),
    forcedColors: matchMedia('(forced-colors: active)'),
    monochrome: getMonochrome(),
    prefersColorScheme: matchMedia('(prefers-color-scheme: dark)') ? 'dark' : 'light',
    prefersReducedMotion: matchMedia('(prefers-reduced-motion: reduce)'),
    prefersReducedTransparency: matchMedia('(prefers-reduced-transparency: reduce)'),
    hdr: matchMedia('(dynamic-range: high)'),
  };
}

/**
 * Collect media features fingerprint
 */
export async function collectMediaFeaturesFingerprint(): Promise<CollectorResult<MediaFeaturesFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getMediaFeaturesFingerprintInternal();
    });

    return {
      status: 'success',
      value,
      duration,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: 0,
    };
  }
}

/**
 * Get all supported media features
 */
export function getSupportedMediaFeatures(): string[] {
  const features: string[] = [];

  const queries = [
    'prefers-color-scheme',
    'prefers-reduced-motion',
    'prefers-reduced-transparency',
    'prefers-contrast',
    'inverted-colors',
    'forced-colors',
    'color-gamut',
    'dynamic-range',
    'monochrome',
    'pointer',
    'hover',
    'any-pointer',
    'any-hover',
  ];

  for (const query of queries) {
    try {
      if (window.matchMedia(`(${query})`).media !== 'not all') {
        features.push(query);
      }
    } catch {
      // Feature not supported
    }
  }

  return features;
}

export default collectMediaFeaturesFingerprint;
