import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIPDetect } from '@/hooks/useIPDetect';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    detectIP: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';

const mockIPLeakResult = {
  ip: '192.168.1.1',
  version: 'ipv4' as const,
  geo: {
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    region: 'NY',
    timezone: 'America/New_York',
    latitude: 40.7128,
    longitude: -74.006,
  },
  network: {
    asn: 'AS12345',
    isp: 'Test ISP',
    organization: 'Test Org',
  },
  privacy: {
    isProxy: false,
    isVPN: false,
    isTor: false,
    isDatacenter: false,
    isRelay: false,
  },
  reputation: {
    score: 85,
    isBlacklisted: false,
    categories: [],
  },
};

describe('useIPDetect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useIPDetect());

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.detect).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should set loading state when detect is called', async () => {
    vi.mocked(apiClient.detectIP).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockIPLeakResult }), 100))
    );

    const { result } = renderHook(() => useIPDetect());

    act(() => {
      result.current.detect();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should detect IP without providing specific IP', async () => {
    vi.mocked(apiClient.detectIP).mockResolvedValueOnce({
      success: true,
      data: mockIPLeakResult,
    });

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(apiClient.detectIP).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockIPLeakResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should detect specific IP when provided', async () => {
    const specificIP = '8.8.8.8';
    vi.mocked(apiClient.detectIP).mockResolvedValueOnce({
      success: true,
      data: { ...mockIPLeakResult, ip: specificIP },
    });

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect(specificIP);
    });

    expect(apiClient.detectIP).toHaveBeenCalledWith(specificIP);
    expect(result.current.data?.ip).toBe(specificIP);
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.detectIP).mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network Error');
  });

  it('should handle API response errors', async () => {
    vi.mocked(apiClient.detectIP).mockResolvedValueOnce({
      success: false,
      error: { message: 'Invalid IP address' },
    });

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Invalid IP address');
  });

  it('should use default error message when API error has no message', async () => {
    vi.mocked(apiClient.detectIP).mockResolvedValueOnce({
      success: false,
      error: {},
    });

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('Failed to detect IP');
  });

  it('should reset state correctly', async () => {
    vi.mocked(apiClient.detectIP).mockResolvedValueOnce({
      success: true,
      data: mockIPLeakResult,
    });

    const { result } = renderHook(() => useIPDetect());

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
    vi.mocked(apiClient.detectIP).mockRejectedValueOnce('String error');

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.error).toBe('An error occurred');
  });

  it('should clear previous data when detecting again', async () => {
    vi.mocked(apiClient.detectIP)
      .mockResolvedValueOnce({
        success: true,
        data: mockIPLeakResult,
      })
      .mockResolvedValueOnce({
        success: true,
        data: { ...mockIPLeakResult, ip: '10.0.0.1' },
      });

    const { result } = renderHook(() => useIPDetect());

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.ip).toBe('192.168.1.1');

    await act(async () => {
      await result.current.detect();
    });

    expect(result.current.data?.ip).toBe('10.0.0.1');
  });
});
