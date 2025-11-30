/**
 * Timezone Fingerprint Collector
 */

import type { TimezoneFingerprint, CollectorResult } from './types';
import { collectWithTiming } from './utils';

function getTimezoneOffset(): number {
  const date = new Date();
  return date.getTimezoneOffset();
}

function getTimezoneName(): string {
  try {
    const formatter = new Intl.DateTimeFormat(undefined, { timeZoneName: 'long' });
    const parts = formatter.formatToParts(new Date());
    const timeZonePart = parts.find((part) => part.type === 'timeZoneName');
    return timeZonePart?.value || '';
  } catch {
    return '';
  }
}

function getTimezoneId(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    return '';
  }
}

function formatOffset(offset: number): string {
  const sign = offset <= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;
  return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function getTimezoneFingerprintInternal(): TimezoneFingerprint {
  const offset = getTimezoneOffset();
  const timezone = getTimezoneId() || getTimezoneName();

  return {
    timezone,
    offset,
    offsetString: formatOffset(offset),
  };
}

/**
 * Collect timezone fingerprint
 */
export async function collectTimezoneFingerprint(): Promise<CollectorResult<TimezoneFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getTimezoneFingerprintInternal();
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
 * Get detailed timezone info
 */
export function getTimezoneDetails(): {
  timezone: string;
  offset: number;
  offsetString: string;
  dstOffset: number;
  hasDST: boolean;
  locale: string;
} {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);

  const janOffset = jan.getTimezoneOffset();
  const julOffset = jul.getTimezoneOffset();
  const currentOffset = now.getTimezoneOffset();

  const hasDST = janOffset !== julOffset;
  const dstOffset = hasDST ? Math.min(janOffset, julOffset) : currentOffset;

  return {
    timezone: getTimezoneId(),
    offset: currentOffset,
    offsetString: formatOffset(currentOffset),
    dstOffset: currentOffset - dstOffset,
    hasDST,
    locale: Intl.DateTimeFormat().resolvedOptions().locale || navigator.language,
  };
}

export default collectTimezoneFingerprint;
