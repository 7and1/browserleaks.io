import type { CanvasFingerprintResult } from '@/lib/fingerprint/canvas';
import type { WebGLFingerprintResult } from '@/lib/fingerprint/webgl';
import type { AudioFingerprintResult } from '@/lib/fingerprint/audio';
import type { FontFingerprintResult } from '@/lib/fingerprint/fonts';

export interface FingerprintResult {
  canvas: CanvasFingerprintResult;
  webgl: WebGLFingerprintResult;
  audio: AudioFingerprintResult;
  fonts: FontFingerprintResult;
  uniquenessScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}
