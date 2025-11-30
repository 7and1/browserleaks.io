export interface FingerprintResult {
  canvas: CanvasFingerprintData;
  webgl: WebGLFingerprintData;
  audio: AudioFingerprintData;
  fonts: FontFingerprintData;
  uniquenessScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CanvasFingerprintData {
  hash: string;
  isSupported: boolean;
}

export interface WebGLFingerprintData {
  vendor: string;
  renderer: string;
  hash: string;
  isSupported: boolean;
}

export interface AudioFingerprintData {
  hash: string;
  sampleRate: number;
  isSupported: boolean;
}

export interface FontFingerprintData {
  fontCount: number;
  hash: string;
  isSupported: boolean;
}
