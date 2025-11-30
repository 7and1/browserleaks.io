// Core types for BrowserLeaks.io

// ===========================
// Common Types
// ===========================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type LeakType = 'none' | 'partial' | 'full';

export type NATType = 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown';

// ===========================
// IP Leak Detection
// ===========================

export interface IPLeakResult {
  ip: string;
  version: 'ipv4' | 'ipv6';
  geo: {
    country: string;
    countryCode: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    timezone: string;
    postalCode?: string;
  };
  network: {
    isp: string;
    asn: string;
    organization: string;
  };
  privacy: {
    isProxy: boolean;
    isVPN: boolean;
    isDatacenter: boolean;
    isTor: boolean;
    isRelay: boolean;
  };
  reputation: {
    score: number; // 0-100
    isBlacklisted: boolean;
    categories: string[];
  };
}

// ===========================
// DNS Leak Detection
// ===========================

export interface DNSLeakResult {
  testId: string;
  isLeak: boolean;
  leakType: LeakType;
  servers: Array<{
    ip: string;
    country: string;
    countryCode: string;
    isp: string;
    isISP: boolean;
  }>;
  dohEnabled: boolean;
  dotEnabled: boolean;
  risks: Array<{
    severity: RiskLevel;
    title: string;
    description: string;
  }>;
  recommendations: string[];
}

// ===========================
// WebRTC Leak Detection
// ===========================

export interface WebRTCLeakResult {
  isLeak: boolean;
  localIPs: string[];
  publicIPs: string[];
  natType: NATType;
  mdnsLeak: boolean;
  ipv6Leak: boolean;
  stunResults: Array<{
    server: string;
    ip: string;
    country: string;
    latency: number;
  }>;
  riskLevel: RiskLevel;
  risks: Array<{
    severity: RiskLevel;
    title: string;
    description: string;
  }>;
  recommendations: string[];
}

// ===========================
// Browser Fingerprint
// ===========================

export interface FingerprintResult {
  fingerprintId: string;
  hash: string;
  confidence: number; // 0-1
  uniqueness: number; // 0-1
  timestamp: number;
  components: {
    canvas?: CanvasFingerprint;
    webgl?: WebGLFingerprint;
    audio?: AudioFingerprint;
    fonts?: FontFingerprint;
    screen?: ScreenFingerprint;
    timezone?: TimezoneFingerprint;
    navigator?: NavigatorFingerprint;
  };
  spoofingIndicators: string[];
  browserType: 'chrome' | 'firefox' | 'safari' | 'edge' | 'other';
  isHeadless: boolean;
  isBot: boolean;
}

export interface CanvasFingerprint {
  hash: string;
  uniqueness: number;
  spoofed: boolean;
  dataURL?: string;
}

export interface WebGLFingerprint {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  extensions: string[];
  parameters: Record<string, any>;
  hash: string;
  uniqueness: number;
  performanceScore: number;
}

export interface AudioFingerprint {
  hash: string;
  sampleRate: number;
  channelCount: number;
  compressorNode: {
    reduction: number;
    threshold: number;
  };
  oscillatorValues: number[];
  devices: Array<{
    deviceId: string;
    label: string;
    groupId: string;
  }>;
  uniqueness: number;
}

export interface FontFingerprint {
  installedFonts: string[];
  fontCount: number;
  hash: string;
  uniqueness: number;
  cjkFonts: {
    chinese: string[];
    japanese: string[];
    korean: string[];
  };
  customFonts: string[];
}

export interface ScreenFingerprint {
  resolution: string;
  colorDepth: number;
  pixelRatio: number;
  uniqueness: number;
}

export interface TimezoneFingerprint {
  value: string;
  offset: number;
  dstActive: boolean;
  intlTimezone: string;
  dateTimezone: string;
  consistent: boolean;
  spoofed: boolean;
}

export interface NavigatorFingerprint {
  userAgent: string;
  platform: string;
  language: string[];
  hardwareConcurrency: number;
  deviceMemory?: number;
  cookiesEnabled: boolean;
  doNotTrack: string | null;
}

// ===========================
// Privacy Score
// ===========================

export interface PrivacyScore {
  totalScore: number; // 0-100
  riskLevel: RiskLevel;
  breakdown: {
    ipPrivacy: number; // 0-20
    dnsPrivacy: number; // 0-15
    webrtcPrivacy: number; // 0-15
    fingerprintResistance: number; // 0-30
    browserConfig: number; // 0-20
  };
  vulnerabilities: Array<{
    category: string;
    severity: RiskLevel;
    title: string;
    description: string;
    recommendation: string;
  }>;
  timeline: Array<{
    timestamp: number;
    score: number;
  }>;
}

// ===========================
// Leak Logging
// ===========================

export interface LeakReportSnapshot {
  meta: {
    scanId: string;
    time: number;
  };
  privacyIndex: {
    score: number;
    exposureLevel: RiskLevel;
    leakedBits: number;
  };
  hardwareLeaks: {
    battery?: string;
    sensors?: string;
    gpu?: string;
  };
  networkLeaks: {
    ip?: string;
    dns?: string;
    webrtc?: string;
  };
  apiSurface: Record<string, string>;
}

export interface LeakLogEntry {
  id: string;
  createdAt: number;
  privacyScore: number;
  entropyScore: number;
  leaks: {
    webrtc: boolean;
    dns: LeakType;
    battery: boolean;
    motion: boolean;
  };
  apiSurface: Record<string, string>;
  report: LeakReportSnapshot;
}

// ===========================
// API Response Types
// ===========================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> extends APIResponse<T> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// ===========================
// API Request Types
// ===========================

export interface IPDetectRequest {
  ip?: string;
  options?: {
    includeGeo?: boolean;
    includeVPN?: boolean;
    includeReputation?: boolean;
  };
}

export interface DNSLeakRequest {
  testId: string;
  userIp: string;
  userCountry: string;
}

export interface WebRTCLeakRequest {
  publicIp: string;
  localIPs: string[];
  candidates: Array<{
    ip: string;
    type: string;
    server: string;
  }>;
}

export interface FingerprintRequest {
  components: Record<string, any>;
  options?: {
    includeScore?: boolean;
    includeRisks?: boolean;
    includeRecommendations?: boolean;
  };
}
