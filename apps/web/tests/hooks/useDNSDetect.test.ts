import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDNSDetect } from '@/hooks/useDNSDetect';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    detectDNSLeak: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';

const mockDNSLeakResult = {
  testId: 'test-123',
  servers: [
    {
      ip: '8.8.8.8',
      country: 'United States',
      countryCode: 'US',
      isp: 'Google',
    },
    {
      ip: '8.8.4.4',
      country: 'United States',
      countryCode: 'US',
      isp: 'Google',
    },
  ],
  isLeak: false,
  leakType: 'none' as const,
  dohEnabled: true,
  dotEnabled: false,
  risks: [],
  recommendations: ['Consider enabling DNS-over-HTTPS'],
};

const mockDNSLeakWithLeak = {
  ...mockDNSLeakResult,
  isLeak: true,
  leakType: 'full' as const,
  servers: [
    {
      ip: '192.168.1.1',
      country: 'United States',
      countryCode: 'US',
      isp: 'Local ISP',
    },
  ],
  risks: [
    {
      severity: 'high' as const,
      title: 'DNS Leak Detected',
      description: 'Your DNS requests are being leaked to your ISP',
    },
  ],
};

describe('useDNSDetect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useDNSDetect());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.detect).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should set loading state when detect is called', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockDNSLeakResult }), 100))
    );

    const { result } = renderHook(() => useDNSDetect());

    act(() => {
      result.current.detect();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should detect DNS leak without parameters', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: true,
      data: mockDNSLeakResult,
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(apiClient.detectDNSLeak).toHaveBeenCalledWith(undefined, undefined);
    expect(result.current.data).toEqual(mockDNSLeakResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should detect DNS leak with user IP and country', async () => {
    const userIp = '192.168.1.100';
    const userCountry = 'US';

    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: true,
      data: mockDNSLeakResult,
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect(userIp, userCountry);
    });

    expect(apiClient.detectDNSLeak).toHaveBeenCalledWith(userIp, userCountry);
    expect(result.current.data).toEqual(mockDNSLeakResult);
  });

  it('should detect DNS leak and report leak correctly', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: true,
      data: mockDNSLeakWithLeak,
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.isLeak).toBe(true);
    expect(result.current.data?.leakType).toBe('full');
    expect(result.current.data?.risks).toHaveLength(1);
    expect(result.current.data?.risks[0].severity).toBe('high');
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockRejectedValueOnce(new Error('Connection timeout'));

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Connection timeout');
  });

  it('should handle API response errors', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: false,
      error: { message: 'DNS test failed' },
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('DNS test failed');
  });

  it('should use default error message when API error has no message', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: false,
      error: {},
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('Failed to detect DNS leak');
  });

  it('should reset state correctly', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: true,
      data: mockDNSLeakResult,
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(apiClient.detectDNSLeak).mockRejectedValueOnce({ code: 'ERR_NETWORK' });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('An error occurred');
  });

  it('should clear previous data when detecting again', async () => {
    vi.mocked(apiClient.detectDNSLeak)
      .mockResolvedValueOnce({
        success: true,
        data: mockDNSLeakResult,
      })
      .mockResolvedValueOnce({
        success: true,
        data: mockDNSLeakWithLeak,
      });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.isLeak).toBe(false);

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.isLeak).toBe(true);
  });

  it('should correctly identify DoH and DoT status', async () => {
    const dnsWithDoT = {
      ...mockDNSLeakResult,
      dohEnabled: false,
      dotEnabled: true,
    };

    vi.mocked(apiClient.detectDNSLeak).mockResolvedValueOnce({
      success: true,
      data: dnsWithDoT,
    });

    const { result } = renderHook(() => useDNSDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.dohEnabled).toBe(false);
    expect(result.current.data?.dotEnabled).toBe(true);
  });
});
