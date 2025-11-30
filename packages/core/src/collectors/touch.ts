/**
 * Touch Support Collector
 */

import type { TouchFingerprint, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function getTouchFingerprintInternal(): TouchFingerprint {
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const touchEvent = 'TouchEvent' in window;
  const touchStart = 'ontouchstart' in window;

  return {
    maxTouchPoints,
    touchEvent,
    touchStart,
  };
}

/**
 * Collect touch support fingerprint
 */
export async function collectTouchFingerprint(): Promise<CollectorResult<TouchFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getTouchFingerprintInternal();
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
 * Get detailed touch capabilities
 */
export function getTouchCapabilities(): {
  maxTouchPoints: number;
  touchEvent: boolean;
  touchStart: boolean;
  touchForce: boolean;
  pointerEvent: boolean;
  coarsePrimaryInput: boolean;
} {
  const finger = getTouchFingerprintInternal();

  // Check for touch force (3D Touch / Force Touch)
  const touchForce = 'TouchEvent' in window &&
    TouchEvent.prototype &&
    'force' in TouchEvent.prototype;

  // Check for Pointer Events
  const pointerEvent = 'PointerEvent' in window;

  // Check if primary input is coarse (touch)
  let coarsePrimaryInput = false;
  if (window.matchMedia) {
    coarsePrimaryInput = window.matchMedia('(pointer: coarse)').matches;
  }

  return {
    ...finger,
    touchForce,
    pointerEvent,
    coarsePrimaryInput,
  };
}

export default collectTouchFingerprint;
