/**
 * BrowserLeaks Fingerprint Collector Types
 * Adapted from FingerprintJS/creepjs
 */

// Common result types
export type CollectorStatus = 'success' | 'error' | 'unsupported' | 'timeout' | 'skipped';

export interface CollectorResult<T> {
  status: CollectorStatus;
  value?: T;
  error?: string;
  duration: number;
}

// Canvas Fingerprint
export interface CanvasFingerprint {
  winding: boolean;
  geometry: string;
  text: string;
  hash: string;
}

// WebGL Fingerprint
export interface WebGLBasics {
  version: string;
  vendor: string;
  vendorUnmasked: string;
  renderer: string;
  rendererUnmasked: string;
  shadingLanguageVersion: string;
}

export interface WebGLExtensions {
  contextAttributes: string[];
  parameters: string[];
  shaderPrecisions: string[];
  extensions: string[] | null;
  extensionParameters: string[];
  unsupportedExtensions: string[];
}

export interface WebGLFingerprint {
  basics: WebGLBasics | null;
  extensions: WebGLExtensions | null;
  hash: string;
}

// Audio Fingerprint
export interface AudioFingerprint {
  value: number;
  hash: string;
  status: 'success' | 'unsupported' | 'suspended' | 'timeout' | 'antifingerprinting';
}

// Font Detection
export interface FontFingerprint {
  fonts: string[];
  count: number;
  hash: string;
}

// Timezone
export interface TimezoneFingerprint {
  timezone: string;
  offset: number;
  offsetString: string;
}

// Screen Info
export interface ScreenFingerprint {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelDepth: number;
  devicePixelRatio: number;
  orientation: string;
}

// Navigator Info
export interface NavigatorFingerprint {
  userAgent: string;
  language: string;
  languages: string[];
  platform: string;
  vendor: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
  maxTouchPoints: number;
  pdfViewerEnabled: boolean;
}

// Plugin Info
export interface PluginInfo {
  name: string;
  description: string;
  filename: string;
  mimeTypes: string[];
}

export interface PluginsFingerprint {
  plugins: PluginInfo[];
  count: number;
}

// Browser Detection
export type BrowserEngine = 'chromium' | 'gecko' | 'webkit' | 'trident' | 'edgehtml' | 'unknown';

export interface BrowserFingerprint {
  engine: BrowserEngine;
  isChromium: boolean;
  isGecko: boolean;
  isWebKit: boolean;
  isSafari: boolean;
  isFirefox: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isOpera: boolean;
  isBrave: boolean;
  isVivaldi: boolean;
  isMobile: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
}

// Media Devices
export interface MediaDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

export interface MediaDevicesFingerprint {
  audioinput: number;
  audiooutput: number;
  videoinput: number;
  devices: MediaDeviceInfo[];
}

// Storage Support
export interface StorageFingerprint {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  openDatabase: boolean;
  cookiesEnabled: boolean;
}

// Math Operations (hardware-dependent)
export interface MathFingerprint {
  acos: number;
  acosh: number;
  asin: number;
  asinh: number;
  atan: number;
  atanh: number;
  atan2: number;
  cbrt: number;
  cos: number;
  cosh: number;
  exp: number;
  expm1: number;
  log: number;
  log1p: number;
  log10: number;
  log2: number;
  sin: number;
  sinh: number;
  sqrt: number;
  tan: number;
  tanh: number;
  hash: string;
}

// Touch Support
export interface TouchFingerprint {
  maxTouchPoints: number;
  touchEvent: boolean;
  touchStart: boolean;
}

// Content Blocker Detection
export interface ContentBlockerFingerprint {
  adBlocker: boolean;
  detectableBlockers: string[];
}

// CSS Media Features
export interface MediaFeaturesFingerprint {
  colorGamut: string;
  contrast: string;
  invertedColors: boolean;
  forcedColors: boolean;
  monochrome: number;
  prefersColorScheme: string;
  prefersReducedMotion: boolean;
  prefersReducedTransparency: boolean;
  hdr: boolean;
}

// Complete Fingerprint
export interface CompleteFingerprint {
  visitorId: string;
  confidence: number;
  timestamp: number;
  components: {
    canvas?: CollectorResult<CanvasFingerprint>;
    webgl?: CollectorResult<WebGLFingerprint>;
    audio?: CollectorResult<AudioFingerprint>;
    fonts?: CollectorResult<FontFingerprint>;
    timezone?: CollectorResult<TimezoneFingerprint>;
    screen?: CollectorResult<ScreenFingerprint>;
    navigator?: CollectorResult<NavigatorFingerprint>;
    plugins?: CollectorResult<PluginsFingerprint>;
    browser?: CollectorResult<BrowserFingerprint>;
    mediaDevices?: CollectorResult<MediaDevicesFingerprint>;
    storage?: CollectorResult<StorageFingerprint>;
    math?: CollectorResult<MathFingerprint>;
    touch?: CollectorResult<TouchFingerprint>;
    contentBlocker?: CollectorResult<ContentBlockerFingerprint>;
    mediaFeatures?: CollectorResult<MediaFeaturesFingerprint>;
  };
}
