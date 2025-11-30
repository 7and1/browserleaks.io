'use client';

import { useState, useCallback } from 'react';
import { CanvasFingerprint } from '@/lib/fingerprint/canvas';
import { WebGLFingerprint } from '@/lib/fingerprint/webgl';
import { AudioFingerprint } from '@/lib/fingerprint/audio';
import { FontFingerprint } from '@/lib/fingerprint/fonts';
import type { FingerprintResult } from '@/types/fingerprint';

interface UseFingerprintDetectState {
  data: FingerprintResult | null;
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useFingerprintDetect() {
  const [state, setState] = useState<UseFingerprintDetectState>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const detect = useCallback(async () => {
    setState({ data: null, loading: true, error: null, progress: 0 });

    try {
      // Canvas fingerprint (25%)
      const canvasDetector = new CanvasFingerprint();
      const canvasResult = await canvasDetector.detect();
      setState((prev) => ({ ...prev, progress: 25 }));

      // WebGL fingerprint (50%)
      const webglDetector = new WebGLFingerprint();
      const webglResult = await webglDetector.detect();
      setState((prev) => ({ ...prev, progress: 50 }));

      // Audio fingerprint (75%)
      const audioDetector = new AudioFingerprint();
      const audioResult = await audioDetector.detect();
      setState((prev) => ({ ...prev, progress: 75 }));

      // Font fingerprint (100%)
      const fontDetector = new FontFingerprint();
      const fontResult = await fontDetector.detect();
      setState((prev) => ({ ...prev, progress: 100 }));

      // Calculate uniqueness score
      const uniquenessScore = calculateUniquenessScore({
        canvas: canvasResult,
        webgl: webglResult,
        audio: audioResult,
        fonts: fontResult,
      });

      const riskLevel = uniquenessScore > 80 ? 'high' : uniquenessScore > 50 ? 'medium' : 'low';

      const fingerprintData: FingerprintResult = {
        canvas: canvasResult,
        webgl: webglResult,
        audio: audioResult,
        fonts: fontResult,
        uniquenessScore,
        riskLevel,
      };

      setState({
        data: fingerprintData,
        loading: false,
        error: null,
        progress: 100,
      });

      // Cleanup
      canvasDetector.cleanup();
      fontDetector.cleanup();
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Fingerprint detection failed',
        progress: 0,
      });
    }
  }, []);

  return {
    ...state,
    detect,
  };
}

function calculateUniquenessScore(data: {
  canvas: any;
  webgl: any;
  audio: any;
  fonts: any;
}): number {
  let score = 0;

  // Each unique fingerprint contributes to uniqueness
  if (data.canvas.isSupported && data.canvas.hash !== 'unsupported') score += 25;
  if (data.webgl.isSupported && data.webgl.hash !== 'unsupported') score += 25;
  if (data.audio.isSupported && data.audio.hash !== 'unsupported') score += 25;
  if (data.fonts.isSupported && data.fonts.fontCount > 30) score += 25;

  return score;
}
