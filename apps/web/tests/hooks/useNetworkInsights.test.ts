import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useNetworkInsights } from '@/hooks/useNetworkInsights';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    getNetworkInsights: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';

const mockNetworkInsightsPayload = {
  connectionType: '4g',
  effectiveType: '4g',
  downlink: 10.0,
  rtt: 50,
  saveData: false,
  ipInfo: {
    ip: '203.0.113.5',
    version: 'ipv4',
    country: 'United States',
    countryCode: 'US',
    city: 'New York',
    isp: 'Test ISP',
    asn: 'AS12345',
  },
  latencyTests: [
    { server: 'us-east', latency: 25, status: 'ok' },
    { server: 'us-west', latency: 75, status: 'ok' },
    { server: 'eu-west', latency: 120, status: 'ok' },
    { server: 'ap-east', latency: 200, status: 'ok' },
  ],
  speedTest: {
    download: 95.5,
    upload: 25.3,
    ping: 15,
    jitter: 2.5,
  },
  networkScore: 85,
  recommendations: [
    'Your network connection is excellent for most online activities',
    'Consider using a wired connection for even better stability',
  ],
};

describe('useNetworkInsights', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state and immediately start loading', () => {
    vi.mocked(apiClient.getNetworkInsights).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, data: mockNetworkInsightsPayload }), 100))
    );

    const { result } = renderHook(() => useNetworkInsights());

    // Hook immediately starts loading on mount
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch network insights on mount', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiClient.getNetworkInsights).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockNetworkInsightsPayload);
    expect(result.current.error).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockRejectedValueOnce(
      new Error('Network request failed')
    );

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Network request failed');
  });

  it('should handle API response errors', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: false,
      error: { message: 'Unable to analyze network' },
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Unable to analyze network');
  });

  it('should use default error message when API error has no message', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: false,
      error: {},
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Unable to load network lab');
  });

  it('should handle unmount during pending request', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(apiClient.getNetworkInsights).mockReturnValueOnce(pendingPromise as any);

    const { result, unmount } = renderHook(() => useNetworkInsights());

    expect(result.current.loading).toBe(true);

    // Unmount before promise resolves
    unmount();

    // Resolve promise after unmount - should not cause errors
    resolvePromise!({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    // No assertion needed - test passes if no errors are thrown
  });

  it('should include all expected data fields', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveProperty('connectionType');
    expect(result.current.data).toHaveProperty('effectiveType');
    expect(result.current.data).toHaveProperty('downlink');
    expect(result.current.data).toHaveProperty('rtt');
    expect(result.current.data).toHaveProperty('ipInfo');
    expect(result.current.data).toHaveProperty('latencyTests');
    expect(result.current.data).toHaveProperty('speedTest');
    expect(result.current.data).toHaveProperty('networkScore');
    expect(result.current.data).toHaveProperty('recommendations');
  });

  it('should correctly parse latency test results', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.latencyTests).toHaveLength(4);
    expect(result.current.data?.latencyTests[0]).toHaveProperty('server');
    expect(result.current.data?.latencyTests[0]).toHaveProperty('latency');
    expect(result.current.data?.latencyTests[0]).toHaveProperty('status');
  });

  it('should correctly parse speed test results', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.speedTest.download).toBe(95.5);
    expect(result.current.data?.speedTest.upload).toBe(25.3);
    expect(result.current.data?.speedTest.ping).toBe(15);
    expect(result.current.data?.speedTest.jitter).toBe(2.5);
  });

  it('should handle slow network connections', async () => {
    const slowNetworkData = {
      ...mockNetworkInsightsPayload,
      connectionType: '2g',
      effectiveType: '2g',
      downlink: 0.25,
      rtt: 1800,
      networkScore: 25,
    };

    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: slowNetworkData,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.connectionType).toBe('2g');
    expect(result.current.data?.networkScore).toBe(25);
  });

  it('should handle save data mode', async () => {
    const saveDataEnabled = {
      ...mockNetworkInsightsPayload,
      saveData: true,
    };

    vi.mocked(apiClient.getNetworkInsights).mockResolvedValueOnce({
      success: true,
      data: saveDataEnabled,
    });

    const { result } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data?.saveData).toBe(true);
  });

  it('should only fetch once regardless of re-renders', async () => {
    vi.mocked(apiClient.getNetworkInsights).mockResolvedValue({
      success: true,
      data: mockNetworkInsightsPayload,
    });

    const { result, rerender } = renderHook(() => useNetworkInsights());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Rerender the hook
    rerender();
    rerender();
    rerender();

    // Should still only have been called once
    expect(apiClient.getNetworkInsights).toHaveBeenCalledTimes(1);
  });
});
