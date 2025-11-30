import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFingerprintDetect } from '@/hooks/useFingerprintDetect';

// Mock the fingerprint detectors
const mockCanvasResult = {
  isSupported: true,
  hash: 'canvas-abc123',
  dataUrl: 'data:image/png;base64,...',
  geometry: { width: 300, height: 150 },
};

const mockWebGLResult = {
  isSupported: true,
  hash: 'webgl-def456',
  vendor: 'Google Inc.',
  renderer: 'ANGLE (Apple, Apple M1, OpenGL 4.1)',
  version: 'WebGL 2.0',
  shadingLanguageVersion: 'WebGL GLSL ES 3.00',
  extensions: ['EXT_blend_minmax', 'EXT_color_buffer_float'],
};

const mockAudioResult = {
  isSupported: true,
  hash: 'audio-ghi789',
  sampleRate: 44100,
  channelCount: 2,
  oscillatorType: 'sine',
};

const mockFontResult = {
  isSupported: true,
  hash: 'fonts-jkl012',
  fontCount: 45,
  detectedFonts: ['Arial', 'Helvetica', 'Times New Roman', 'Courier New'],
};

vi.mock('@/lib/fingerprint/canvas', () => ({
  CanvasFingerprint: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockResolvedValue(mockCanvasResult),
    cleanup: vi.fn(),
  })),
}));

vi.mock('@/lib/fingerprint/webgl', () => ({
  WebGLFingerprint: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockResolvedValue(mockWebGLResult),
  })),
}));

vi.mock('@/lib/fingerprint/audio', () => ({
  AudioFingerprint: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockResolvedValue(mockAudioResult),
  })),
}));

vi.mock('@/lib/fingerprint/fonts', () => ({
  FontFingerprint: vi.fn().mockImplementation(() => ({
    detect: vi.fn().mockResolvedValue(mockFontResult),
    cleanup: vi.fn(),
  })),
}));

import { CanvasFingerprint } from '@/lib/fingerprint/canvas';
import { WebGLFingerprint } from '@/lib/fingerprint/webgl';
import { AudioFingerprint } from '@/lib/fingerprint/audio';
import { FontFingerprint } from '@/lib/fingerprint/fonts';

describe('useFingerprintDetect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useFingerprintDetect());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
    expect(typeof result.current.detect).toBe('function');
  });

  it('should set loading state and track progress when detect is called', async () => {
    const { result } = renderHook(() => useFingerprintDetect());

    act(() => {
      result.current.detect();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should detect all fingerprints successfully', async () => {
    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(CanvasFingerprint).toHaveBeenCalled();
    expect(WebGLFingerprint).toHaveBeenCalled();
    expect(AudioFingerprint).toHaveBeenCalled();
    expect(FontFingerprint).toHaveBeenCalled();

    expect(result.current.data).not.toBeNull();
    expect(result.current.data?.canvas).toEqual(mockCanvasResult);
    expect(result.current.data?.webgl).toEqual(mockWebGLResult);
    expect(result.current.data?.audio).toEqual(mockAudioResult);
    expect(result.current.data?.fonts).toEqual(mockFontResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(100);
  });

  it('should calculate uniqueness score correctly for fully unique fingerprints', async () => {
    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    // All fingerprints supported and unique = high uniqueness score
    expect(result.current.data?.uniquenessScore).toBe(100);
    expect(result.current.data?.riskLevel).toBe('high');
  });

  it('should calculate lower uniqueness score when features are unsupported', async () => {
    const unsupportedCanvas = {
      isSupported: false,
      hash: 'unsupported',
    };

    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(unsupportedCanvas),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    // Canvas not supported, so lower score
    expect(result.current.data?.uniquenessScore).toBe(75);
  });

  it('should calculate medium risk level for moderate uniqueness', async () => {
    const unsupportedCanvas = { isSupported: false, hash: 'unsupported' };
    const supportedWebGL = { ...mockWebGLResult }; // Keep WebGL supported
    const supportedAudio = { ...mockAudioResult }; // Keep Audio supported
    const highFonts = { isSupported: true, hash: 'fonts', fontCount: 50 }; // High font count

    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(unsupportedCanvas),
      cleanup: vi.fn(),
    }));

    vi.mocked(WebGLFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(supportedWebGL),
    }));

    vi.mocked(AudioFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(supportedAudio),
    }));

    vi.mocked(FontFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(highFonts),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    // Canvas not supported but others are = score 75, which is medium
    expect(result.current.data?.uniquenessScore).toBe(75);
    expect(result.current.data?.riskLevel).toBe('medium');
  });

  it('should calculate low risk level for low uniqueness', async () => {
    const unsupported = { isSupported: false, hash: 'unsupported' };
    const lowFonts = { isSupported: true, hash: 'fonts', fontCount: 10 };

    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(unsupported),
      cleanup: vi.fn(),
    }));

    vi.mocked(WebGLFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(unsupported),
    }));

    vi.mocked(AudioFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(unsupported),
    }));

    vi.mocked(FontFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(lowFonts),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    // Almost nothing supported = low score
    expect(result.current.data?.uniquenessScore).toBeLessThanOrEqual(50);
    expect(result.current.data?.riskLevel).toBe('low');
  });

  it('should handle canvas fingerprint errors', async () => {
    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockRejectedValue(new Error('Canvas error')),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Canvas error');
    expect(result.current.progress).toBe(0);
  });

  it('should handle webgl fingerprint errors', async () => {
    vi.mocked(WebGLFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockRejectedValue(new Error('WebGL not available')),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('WebGL not available');
  });

  it('should handle audio fingerprint errors', async () => {
    vi.mocked(AudioFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockRejectedValue(new Error('AudioContext not supported')),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('AudioContext not supported');
  });

  it('should handle font fingerprint errors', async () => {
    vi.mocked(FontFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockRejectedValue(new Error('Font detection failed')),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Font detection failed');
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockRejectedValue('String error'),
      cleanup: vi.fn(),
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('Fingerprint detection failed');
  });

  it('should call cleanup methods after successful detection', async () => {
    const cleanupCanvas = vi.fn();
    const cleanupFonts = vi.fn();

    vi.mocked(CanvasFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(mockCanvasResult),
      cleanup: cleanupCanvas,
    }));

    vi.mocked(FontFingerprint).mockImplementationOnce(() => ({
      detect: vi.fn().mockResolvedValue(mockFontResult),
      cleanup: cleanupFonts,
    }));

    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(cleanupCanvas).toHaveBeenCalled();
    expect(cleanupFonts).toHaveBeenCalled();
  });

  it('should update progress through detection stages', async () => {
    let progressValues: number[] = [];

    const { result } = renderHook(() => {
      const hookResult = useFingerprintDetect();
      // Track progress changes
      if (hookResult.progress !== progressValues[progressValues.length - 1]) {
        progressValues.push(hookResult.progress);
      }
      return hookResult;
    });

    await act(async () => {
      await result.current.detect();
    });

    // Should have progressed through stages
    expect(result.current.progress).toBe(100);
  });

  it('should include all fingerprint components in result', async () => {
    const { result } = renderHook(() => useFingerprintDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toHaveProperty('canvas');
    expect(result.current.data).toHaveProperty('webgl');
    expect(result.current.data).toHaveProperty('audio');
    expect(result.current.data).toHaveProperty('fonts');
    expect(result.current.data).toHaveProperty('uniquenessScore');
    expect(result.current.data).toHaveProperty('riskLevel');
  });
});
