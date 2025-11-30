/**
 * Screen Fingerprint Collector
 */

import type { ScreenFingerprint, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function getScreenFingerprintInternal(): ScreenFingerprint {
  const scr = window.screen;

  let orientation = 'unknown';
  if (scr.orientation) {
    orientation = scr.orientation.type;
  } else if (window.matchMedia) {
    orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  }

  return {
    width: scr.width || 0,
    height: scr.height || 0,
    availWidth: scr.availWidth || 0,
    availHeight: scr.availHeight || 0,
    colorDepth: scr.colorDepth || 0,
    pixelDepth: scr.pixelDepth || 0,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation,
  };
}

/**
 * Collect screen fingerprint
 */
export async function collectScreenFingerprint(): Promise<CollectorResult<ScreenFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getScreenFingerprintInternal();
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
 * Get screen frame info (window chrome)
 */
export function getScreenFrameInfo(): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const scr = window.screen;
  return {
    top: (scr.availTop ?? 0) || (window.screenY - (scr.height - scr.availHeight)),
    right: scr.width - scr.availWidth - ((scr as Screen & { availLeft?: number }).availLeft ?? 0),
    bottom: scr.height - scr.availHeight - ((scr as Screen & { availTop?: number }).availTop ?? 0),
    left: (scr as Screen & { availLeft?: number }).availLeft ?? 0,
  };
}

export default collectScreenFingerprint;
