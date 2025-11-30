import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebRTCDetect } from '@/hooks/useWebRTCDetect';

// Mock the WebRTC detector
vi.mock('@/lib/webrtc-detector', () => ({
  WebRTCDetector: vi.fn().mockImplementation(() => ({
    detectAll: vi.fn().mockResolvedValue({
      candidates: [
        { ip: '192.168.1.1', type: 'host', server: 'local' },
        { ip: '203.0.113.5', type: 'srflx', server: 'stun.l.google.com' },
      ],
      localIPs: ['192.168.1.1'],
      publicIPs: ['203.0.113.5'],
    }),
  })),
}));

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    request: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';
import { WebRTCDetector } from '@/lib/webrtc-detector';

const mockWebRTCLeakResult = {
  isLeak: false,
  localIPs: ['192.168.1.1'],
  publicIPs: ['203.0.113.5'],
  natType: 'srflx' as const,
  mdnsLeak: false,
  ipv6Leak: false,
  stunResults: [
    {
      server: 'stun.l.google.com:19302',
      ip: '203.0.113.5',
      country: 'United States',
      latency: 25,
    },
  ],
  riskLevel: 'low' as const,
  risks: [],
  recommendations: ['WebRTC is properly configured'],
};

const mockWebRTCWithLeak = {
  ...mockWebRTCLeakResult,
  isLeak: true,
  mdnsLeak: true,
  riskLevel: 'high' as const,
  risks: [
    {
      severity: 'high' as const,
      title: 'Local IP Exposed',
      description: 'Your local IP address is visible through WebRTC',
    },
  ],
};

describe('useWebRTCDetect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useWebRTCDetect());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
    expect(typeof result.current.detect).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should set loading state and progress when detect is called', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: mockWebRTCLeakResult,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    act(() => {
      result.current.detect();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should detect WebRTC leaks successfully', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: mockWebRTCLeakResult,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(WebRTCDetector).toHaveBeenCalled();
    expect(apiClient.request).toHaveBeenCalledWith(
      '/v1/detect/webrtc-leak',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result.current.data).toEqual(mockWebRTCLeakResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(100);
  });

  it('should detect and report WebRTC leak correctly', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: mockWebRTCWithLeak,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.isLeak).toBe(true);
    expect(result.current.data?.mdnsLeak).toBe(true);
    expect(result.current.data?.riskLevel).toBe('high');
    expect(result.current.data?.risks).toHaveLength(1);
  });

  it('should handle WebRTC detector errors', async () => {
    const mockDetectorWithError = vi.fn().mockImplementation(() => ({
      detectAll: vi.fn().mockRejectedValue(new Error('WebRTC not supported')),
    }));
    vi.mocked(WebRTCDetector).mockImplementationOnce(mockDetectorWithError);

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('WebRTC not supported');
    expect(result.current.progress).toBe(0);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.request).mockRejectedValueOnce(new Error('API unavailable'));

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('API unavailable');
    expect(result.current.progress).toBe(0);
  });

  it('should handle API response errors', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: false,
      error: { message: 'WebRTC analysis failed' },
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('WebRTC analysis failed');
    expect(result.current.progress).toBe(0);
  });

  it('should use default error message when API error has no message', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: false,
      error: {},
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('Failed to detect WebRTC leak');
  });

  it('should reset state correctly', async () => {
    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: mockWebRTCLeakResult,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).not.toBeNull();
    expect(result.current.progress).toBe(100);

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBe(0);
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(apiClient.request).mockRejectedValueOnce('Network failure');

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('An error occurred');
  });

  it('should report different NAT types correctly', async () => {
    const relayResult = {
      ...mockWebRTCLeakResult,
      natType: 'relay' as const,
    };

    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: relayResult,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.natType).toBe('relay');
  });

  it('should detect IPv6 leaks', async () => {
    const ipv6LeakResult = {
      ...mockWebRTCLeakResult,
      isLeak: true,
      ipv6Leak: true,
      publicIPs: ['203.0.113.5', '2001:db8::1'],
      riskLevel: 'medium' as const,
    };

    vi.mocked(apiClient.request).mockResolvedValueOnce({
      success: true,
      data: ipv6LeakResult,
    });

    const { result } = renderHook(() => useWebRTCDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.ipv6Leak).toBe(true);
    expect(result.current.data?.publicIPs).toContain('2001:db8::1');
  });
});
