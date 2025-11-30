/**
 * Browser Detection Collector
 */

import type { BrowserFingerprint, BrowserEngine, CollectorResult } from './types';
import {
  isChromium,
  isGecko,
  isWebKit,
  isTrident,
  isEdgeHTML,
  isSafariWebKit,
  isAndroid,
  isDesktopWebKit,
  collectWithTiming,
} from './utils';

function detectBrowserEngine(): BrowserEngine {
  if (isChromium()) return 'chromium';
  if (isGecko()) return 'gecko';
  if (isWebKit()) return 'webkit';
  if (isTrident()) return 'trident';
  if (isEdgeHTML()) return 'edgehtml';
  return 'unknown';
}

function isIOS(): boolean {
  return (
    isWebKit() &&
    !isDesktopWebKit() &&
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
}

function isMobile(): boolean {
  return isAndroid() || isIOS() || /mobile/i.test(navigator.userAgent);
}

function isFirefox(): boolean {
  return isGecko();
}

function isChrome(): boolean {
  if (!isChromium()) return false;
  const ua = navigator.userAgent;
  return /Chrome\//.test(ua) && !/Edge|Edg|OPR|Opera|Brave|Vivaldi/.test(ua);
}

function isEdge(): boolean {
  if (!isChromium()) return false;
  return /Edg\//.test(navigator.userAgent);
}

function isOpera(): boolean {
  if (!isChromium()) return false;
  return /OPR\/|Opera/.test(navigator.userAgent);
}

function isBrave(): boolean {
  if (!isChromium()) return false;
  // Brave has a specific navigator property
  return !!(navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave?.isBrave;
}

function isVivaldi(): boolean {
  if (!isChromium()) return false;
  return /Vivaldi/.test(navigator.userAgent);
}

function isSafari(): boolean {
  return isWebKit() && isSafariWebKit();
}

function getBrowserFingerprintInternal(): BrowserFingerprint {
  const engine = detectBrowserEngine();
  const mobile = isMobile();

  return {
    engine,
    isChromium: isChromium(),
    isGecko: isGecko(),
    isWebKit: isWebKit(),
    isSafari: isSafari(),
    isFirefox: isFirefox(),
    isChrome: isChrome(),
    isEdge: isEdge(),
    isOpera: isOpera(),
    isBrave: isBrave(),
    isVivaldi: isVivaldi(),
    isMobile: mobile,
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    isDesktop: !mobile,
  };
}

/**
 * Collect browser fingerprint
 */
export async function collectBrowserFingerprint(): Promise<CollectorResult<BrowserFingerprint>> {
  try {
    const { value, duration } = await collectWithTiming(() => {
      return getBrowserFingerprintInternal();
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
 * Get browser name from detection
 */
export function getBrowserName(): string {
  const fingerprint = getBrowserFingerprintInternal();

  if (fingerprint.isBrave) return 'Brave';
  if (fingerprint.isVivaldi) return 'Vivaldi';
  if (fingerprint.isOpera) return 'Opera';
  if (fingerprint.isEdge) return 'Microsoft Edge';
  if (fingerprint.isChrome) return 'Google Chrome';
  if (fingerprint.isFirefox) return 'Mozilla Firefox';
  if (fingerprint.isSafari) return 'Apple Safari';
  if (fingerprint.isChromium) return 'Chromium-based';
  if (fingerprint.isGecko) return 'Gecko-based';
  if (fingerprint.isWebKit) return 'WebKit-based';

  return 'Unknown Browser';
}

/**
 * Get operating system from detection
 */
export function getOperatingSystem(): string {
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (/Windows/.test(platform) || /Win/.test(ua)) return 'Windows';
  if (/Mac/.test(platform) && !isIOS()) return 'macOS';
  if (isIOS()) return 'iOS';
  if (isAndroid()) return 'Android';
  if (/Linux/.test(platform)) return 'Linux';
  if (/CrOS/.test(ua)) return 'Chrome OS';

  return 'Unknown OS';
}

export default collectBrowserFingerprint;
