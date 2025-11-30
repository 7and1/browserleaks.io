/**
 * BrowserLeaks Fingerprint Collectors
 * Comprehensive browser fingerprinting library adapted from FingerprintJS/creepjs
 */

// Types
export type {
  CollectorStatus,
  CollectorResult,
  CanvasFingerprint,
  WebGLBasics,
  WebGLExtensions,
  WebGLFingerprint,
  AudioFingerprint,
  FontFingerprint,
  TimezoneFingerprint,
  ScreenFingerprint,
  NavigatorFingerprint,
  PluginInfo,
  PluginsFingerprint,
  BrowserEngine,
  BrowserFingerprint,
  MediaDeviceInfo,
  MediaDevicesFingerprint,
  StorageFingerprint,
  MathFingerprint,
  TouchFingerprint,
  ContentBlockerFingerprint,
  MediaFeaturesFingerprint,
  CompleteFingerprint,
} from './types';

// Collectors
export { collectCanvasFingerprint, getCanvasImageData } from './canvas';
export { collectWebGLFingerprint, getWebGLRendererInfo } from './webgl';
export { collectAudioFingerprint, getAudioContextInfo } from './audio';
export { collectFontFingerprint, getTestedFonts } from './fonts';
export { collectTimezoneFingerprint, getTimezoneDetails } from './timezone';
export { collectScreenFingerprint, getScreenFrameInfo } from './screen';
export { collectNavigatorFingerprint, collectPluginsFingerprint } from './navigator';
export { collectBrowserFingerprint, getBrowserName, getOperatingSystem } from './browser';
export { collectStorageFingerprint, getStorageQuota } from './storage';
export { collectMathFingerprint } from './math';
export { collectTouchFingerprint, getTouchCapabilities } from './touch';
export { collectMediaFeaturesFingerprint, getSupportedMediaFeatures } from './mediaFeatures';

// Utilities
export {
  hash,
  hashObject,
  withTimeout,
  withIframe,
  isChromium,
  isGecko,
  isWebKit,
  isTrident,
  isEdgeHTML,
  isSafariWebKit,
  isDesktopWebKit,
  isAndroid,
  collectWithTiming,
} from './utils';

// Main fingerprint collector
import type { CompleteFingerprint, CollectorResult } from './types';
import { collectCanvasFingerprint } from './canvas';
import { collectWebGLFingerprint } from './webgl';
import { collectAudioFingerprint } from './audio';
import { collectFontFingerprint } from './fonts';
import { collectTimezoneFingerprint } from './timezone';
import { collectScreenFingerprint } from './screen';
import { collectNavigatorFingerprint, collectPluginsFingerprint } from './navigator';
import { collectBrowserFingerprint } from './browser';
import { collectStorageFingerprint } from './storage';
import { collectMathFingerprint } from './math';
import { collectTouchFingerprint } from './touch';
import { collectMediaFeaturesFingerprint } from './mediaFeatures';
import { hash } from './utils';

export interface CollectOptions {
  includeCanvas?: boolean;
  includeWebGL?: boolean;
  includeAudio?: boolean;
  includeFonts?: boolean;
  includeTimezone?: boolean;
  includeScreen?: boolean;
  includeNavigator?: boolean;
  includePlugins?: boolean;
  includeBrowser?: boolean;
  includeStorage?: boolean;
  includeMath?: boolean;
  includeTouch?: boolean;
  includeMediaFeatures?: boolean;
  timeout?: number;
}

const DEFAULT_OPTIONS: CollectOptions = {
  includeCanvas: true,
  includeWebGL: true,
  includeAudio: true,
  includeFonts: true,
  includeTimezone: true,
  includeScreen: true,
  includeNavigator: true,
  includePlugins: true,
  includeBrowser: true,
  includeStorage: true,
  includeMath: true,
  includeTouch: true,
  includeMediaFeatures: true,
  timeout: 10000,
};

/**
 * Collect complete browser fingerprint
 */
export async function collectFingerprint(options: CollectOptions = {}): Promise<CompleteFingerprint> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Run async collectors in parallel
  const collectors: Promise<[string, CollectorResult<unknown>]>[] = [];

  if (opts.includeCanvas) {
    collectors.push(collectCanvasFingerprint().then((r) => ['canvas', r]));
  }
  if (opts.includeWebGL) {
    collectors.push(collectWebGLFingerprint().then((r) => ['webgl', r]));
  }
  if (opts.includeAudio) {
    collectors.push(collectAudioFingerprint().then((r) => ['audio', r]));
  }
  if (opts.includeFonts) {
    collectors.push(collectFontFingerprint().then((r) => ['fonts', r]));
  }
  if (opts.includeTimezone) {
    collectors.push(collectTimezoneFingerprint().then((r) => ['timezone', r]));
  }
  if (opts.includeScreen) {
    collectors.push(collectScreenFingerprint().then((r) => ['screen', r]));
  }
  if (opts.includeNavigator) {
    collectors.push(collectNavigatorFingerprint().then((r) => ['navigator', r]));
  }
  if (opts.includePlugins) {
    collectors.push(collectPluginsFingerprint().then((r) => ['plugins', r]));
  }
  if (opts.includeBrowser) {
    collectors.push(collectBrowserFingerprint().then((r) => ['browser', r]));
  }
  if (opts.includeStorage) {
    collectors.push(collectStorageFingerprint().then((r) => ['storage', r]));
  }
  if (opts.includeMath) {
    collectors.push(collectMathFingerprint().then((r) => ['math', r]));
  }
  if (opts.includeTouch) {
    collectors.push(collectTouchFingerprint().then((r) => ['touch', r]));
  }
  if (opts.includeMediaFeatures) {
    collectors.push(collectMediaFeaturesFingerprint().then((r) => ['mediaFeatures', r]));
  }

  // Wait for all collectors with timeout
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Collection timeout')), opts.timeout);
  });

  let results: [string, CollectorResult<unknown>][];
  try {
    results = await Promise.race([Promise.all(collectors), timeoutPromise]);
  } catch {
    // On timeout, collect what we have
    results = await Promise.all(
      collectors.map((p) =>
        p.catch((err) => ['error', { status: 'timeout', error: err.message, duration: 0 }] as [string, CollectorResult<unknown>])
      )
    );
  }

  // Build components object
  const components: CompleteFingerprint['components'] = {};
  for (const [key, result] of results) {
    if (key !== 'error') {
      (components as Record<string, CollectorResult<unknown>>)[key] = result;
    }
  }

  // Generate visitor ID from stable components
  const stableComponents = [
    components.canvas?.value,
    components.webgl?.value,
    components.audio?.value,
    components.fonts?.value,
    components.timezone?.value,
    components.screen?.value,
    components.navigator?.value,
    components.browser?.value,
    components.math?.value,
  ].filter(Boolean);

  const visitorId = hash(JSON.stringify(stableComponents));

  // Calculate confidence based on successful collections
  const successCount = Object.values(components).filter((r) => r?.status === 'success').length;
  const totalCount = Object.keys(components).length;
  const confidence = totalCount > 0 ? successCount / totalCount : 0;

  return {
    visitorId,
    confidence,
    timestamp: Date.now(),
    components,
  };
}

/**
 * Quick fingerprint collection (fewer components for speed)
 */
export async function collectQuickFingerprint(): Promise<CompleteFingerprint> {
  return collectFingerprint({
    includeCanvas: true,
    includeWebGL: true,
    includeAudio: false, // Slow
    includeFonts: false, // Slow
    includeTimezone: true,
    includeScreen: true,
    includeNavigator: true,
    includePlugins: false,
    includeBrowser: true,
    includeStorage: true,
    includeMath: true,
    includeTouch: true,
    includeMediaFeatures: true,
    timeout: 3000,
  });
}

export default collectFingerprint;
