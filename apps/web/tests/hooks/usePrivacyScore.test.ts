import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrivacyScore } from '@/hooks/usePrivacyScore';

// Mock the API client
vi.mock('@/lib/api', () => ({
  apiClient: {
    calculatePrivacyScore: vi.fn(),
  },
}));

import { apiClient } from '@/lib/api';

const mockIPData = {
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

const mockDNSData = {
  testId: 'test-123',
  servers: [
    {
      ip: '8.8.8.8',
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
  recommendations: [],
};

const mockWebRTCData = {
  isLeak: false,
  localIPs: [],
  publicIPs: [],
  natType: 'relay' as const,
  stunResults: [],
  mdnsLeak: false,
  ipv6Leak: false,
  riskLevel: 'low' as const,
  risks: [],
  recommendations: [],
};

const mockPrivacyScore = {
  totalScore: 85,
  riskLevel: 'low' as const,
  breakdown: {
    ipPrivacy: 18,
    dnsPrivacy: 15,
    webrtcPrivacy: 15,
    fingerprintResistance: 22,
    browserConfig: 15,
  },
  vulnerabilities: [],
  recommendations: ['Use encrypted DNS'],
};

describe('usePrivacyScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => usePrivacyScore());

    expect(result.current.score).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should calculate score when IP data is provided', async () => {
    vi.mocked(apiClient.calculatePrivacyScore).mockResolvedValueOnce({
      success: true,
      data: mockPrivacyScore,
    });

    const { result } = renderHook(() => usePrivacyScore(mockIPData, null, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.score).toEqual(mockPrivacyScore);
    expect(result.current.error).toBeNull();
  });

  it('should calculate score with all data sources', async () => {
    vi.mocked(apiClient.calculatePrivacyScore).mockResolvedValueOnce({
      success: true,
      data: mockPrivacyScore,
    });

    const { result } = renderHook(() =>
      usePrivacyScore(mockIPData, mockDNSData, mockWebRTCData)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiClient.calculatePrivacyScore).toHaveBeenCalledWith({
      ipLeak: mockIPData,
      dnsLeak: mockDNSData,
      webrtcLeak: mockWebRTCData,
    });
    expect(result.current.score).toEqual(mockPrivacyScore);
  });

  it('should handle API errors', async () => {
    vi.mocked(apiClient.calculatePrivacyScore).mockRejectedValueOnce(
      new Error('API Error')
    );

    const { result } = renderHook(() => usePrivacyScore(mockIPData, null, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.score).toBeNull();
    expect(result.current.error).toBe('API Error');
  });

  it('should handle API response errors', async () => {
    vi.mocked(apiClient.calculatePrivacyScore).mockResolvedValueOnce({
      success: false,
      error: { message: 'Invalid data' },
    });

    const { result } = renderHook(() => usePrivacyScore(mockIPData, null, null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.score).toBeNull();
    expect(result.current.error).toBe('Invalid data');
  });

  it('should not calculate if no data is provided', () => {
    renderHook(() => usePrivacyScore(null, null, null));

    expect(apiClient.calculatePrivacyScore).not.toHaveBeenCalled();
  });

  it('should recalculate when data changes', async () => {
    vi.mocked(apiClient.calculatePrivacyScore).mockResolvedValue({
      success: true,
      data: mockPrivacyScore,
    });

    const { result, rerender } = renderHook(
      ({ ip, dns }) => usePrivacyScore(ip, dns, null),
      {
        initialProps: { ip: mockIPData, dns: null as typeof mockDNSData | null },
      }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(apiClient.calculatePrivacyScore).toHaveBeenCalledTimes(1);

    // Rerender with DNS data
    rerender({ ip: mockIPData, dns: mockDNSData });

    await waitFor(() => {
      expect(apiClient.calculatePrivacyScore).toHaveBeenCalledTimes(2);
    });
  });
});
