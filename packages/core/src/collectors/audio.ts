/**
 * Audio Fingerprint Collector
 * Adapted from FingerprintJS
 * @see https://fingerprint.com/blog/audio-fingerprinting/
 */

import type { AudioFingerprint, CollectorResult } from './types';
import {
  hash,
  isWebKit,
  isWebKit616OrNewer,
  isSafariWebKit,
  isDesktopWebKit,
  isChromium,
  collectWithTiming,
} from './utils';

type AudioFingerprintStatus = 'success' | 'unsupported' | 'suspended' | 'timeout' | 'antifingerprinting';

// WebKit version check for mobile Safari
function isWebKit606OrNewer(): boolean {
  const w = window;
  return (
    ['DOMRectList', 'RTCPeerConnectionIceEvent', 'SVGGeometryElement', 'ontransitioncancel'].filter(
      (prop) => prop in w
    ).length >= 3
  );
}

// Check for Samsung Internet
function isSamsungInternet(): boolean {
  const n = navigator;
  const audioPrototype = Audio.prototype;
  const { visualViewport } = window;

  return (
    ['srLatency', 'srChannelCount'].filter((prop) => prop in audioPrototype).length >= 1 &&
    (!!visualViewport && 'segments' in visualViewport)
  );
}

function isChromium122OrNewer(): boolean {
  const w = window;
  const { URLPattern } = w as Window & { URLPattern?: { prototype: { hasRegExpGroups?: boolean } } };

  return (
    ['union' in Set.prototype, 'Iterator' in w, URLPattern && 'hasRegExpGroups' in URLPattern.prototype].filter(
      Boolean
    ).length >= 2
  );
}

function doesBrowserSuspendAudioContext(): boolean {
  return isWebKit() && !isDesktopWebKit() && !isWebKit606OrNewer();
}

function doesBrowserPerformAntifingerprinting(): boolean {
  return (
    (isWebKit() && isWebKit616OrNewer() && isSafariWebKit()) ||
    (isChromium() && isSamsungInternet() && isChromium122OrNewer())
  );
}

function getAudioHash(signal: ArrayLike<number>): number {
  let hashValue = 0;
  for (let i = 0; i < signal.length; ++i) {
    hashValue += Math.abs(signal[i]);
  }
  return hashValue;
}

async function getAudioFingerprintInternal(): Promise<{ value: number; status: AudioFingerprintStatus }> {
  // Check for anti-fingerprinting
  if (doesBrowserPerformAntifingerprinting()) {
    return { value: -4, status: 'antifingerprinting' };
  }

  const w = window as Window & {
    webkitOfflineAudioContext?: typeof OfflineAudioContext;
  };

  const AudioContextClass = w.OfflineAudioContext || w.webkitOfflineAudioContext;

  if (!AudioContextClass) {
    return { value: -2, status: 'unsupported' };
  }

  if (doesBrowserSuspendAudioContext()) {
    return { value: -1, status: 'suspended' };
  }

  const hashFromIndex = 4500;
  const hashToIndex = 5000;

  try {
    const context = new AudioContextClass(1, hashToIndex, 44100);

    const oscillator = context.createOscillator();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;

    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    oscillator.connect(compressor);
    compressor.connect(context.destination);
    oscillator.start(0);

    // Create promise with timeout
    const renderPromise = new Promise<AudioBuffer>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 3000);

      context.oncomplete = (event) => {
        clearTimeout(timeout);
        resolve(event.renderedBuffer);
      };

      context.startRendering().catch((err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });

    const buffer = await renderPromise;
    const audioData = buffer.getChannelData(0).subarray(hashFromIndex);
    const audioHash = getAudioHash(audioData);

    return { value: audioHash, status: 'success' };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'timeout') {
        return { value: -3, status: 'timeout' };
      }
    }
    return { value: -2, status: 'unsupported' };
  }
}

/**
 * Collect audio fingerprint
 */
export async function collectAudioFingerprint(): Promise<CollectorResult<AudioFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(async () => {
      const result = await getAudioFingerprintInternal();
      return {
        value: result.value,
        hash: hash(result.value.toString()),
        status: result.status,
      };
    });

    return {
      status: value.status === 'success' ? 'success' : value.status === 'unsupported' ? 'unsupported' : 'error',
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
 * Get audio context properties for display
 */
export function getAudioContextInfo(): {
  sampleRate: number;
  baseLatency: number | undefined;
  outputLatency: number | undefined;
  channelCount: number;
  maxChannelCount: number;
} | null {
  try {
    const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    const context = new AudioContextClass();
    const destination = context.destination;

    const info = {
      sampleRate: context.sampleRate,
      baseLatency: (context as AudioContext & { baseLatency?: number }).baseLatency,
      outputLatency: (context as AudioContext & { outputLatency?: number }).outputLatency,
      channelCount: destination.channelCount,
      maxChannelCount: destination.maxChannelCount,
    };

    context.close();
    return info;
  } catch {
    return null;
  }
}

export default collectAudioFingerprint;
