import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original fetch
const originalFetch = global.fetch;

// Create a mock fetch that we can control
let mockFetch: ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetch = vi.fn();
  global.fetch = mockFetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  vi.resetModules();
});

describe('APIClient', () => {
  describe('detectIP', () => {
    it('should detect IP without specific IP (POST)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            ip: '203.0.113.5',
            version: 'ipv4',
            geo: { country: 'United States', countryCode: 'US' },
          },
        }),
      });

      // Dynamically import to get fresh instance
      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/detect/ip'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.ip).toBe('203.0.113.5');
    });

    it('should detect specific IP (GET)', async () => {
      const specificIP = '8.8.8.8';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            ip: specificIP,
            version: 'ipv4',
            geo: { country: 'United States', countryCode: 'US' },
          },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP(specificIP);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/v1/detect/ip/${specificIP}`),
        expect.any(Object)
      );
      expect(result.data?.ip).toBe(specificIP);
    });
  });

  describe('detectDNSLeak', () => {
    it('should detect DNS leak with user IP and country', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            testId: 'test-123',
            isLeak: false,
            servers: [],
          },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectDNSLeak('192.168.1.1', 'US');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/detect/dns-leak'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userIp: '192.168.1.1', userCountry: 'US' }),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data?.isLeak).toBe(false);
    });

    it('should detect DNS leak without parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            testId: 'test-456',
            isLeak: true,
            leakType: 'full',
          },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectDNSLeak();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/detect/dns-leak'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userIp: undefined, userCountry: undefined }),
        })
      );
      expect(result.data?.isLeak).toBe(true);
    });
  });

  describe('calculatePrivacyScore', () => {
    it('should calculate privacy score with all data', async () => {
      const mockScore = {
        totalScore: 85,
        riskLevel: 'low',
        breakdown: {
          ipPrivacy: 18,
          dnsPrivacy: 15,
          webrtcPrivacy: 15,
          fingerprintResistance: 22,
          browserConfig: 15,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockScore,
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.calculatePrivacyScore({
        ipLeak: { ip: '203.0.113.5', version: 'ipv4' } as any,
        dnsLeak: { isLeak: false } as any,
        webrtcLeak: { isLeak: false } as any,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/privacy-score'),
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.data?.totalScore).toBe(85);
      expect(result.data?.riskLevel).toBe('low');
    });

    it('should handle partial data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { totalScore: 50, riskLevel: 'medium' },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.calculatePrivacyScore({
        ipLeak: { ip: '203.0.113.5' } as any,
        dnsLeak: null,
        webrtcLeak: null,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getNetworkInsights', () => {
    it('should fetch network insights', async () => {
      const mockInsights = {
        connectionType: '4g',
        downlink: 10.0,
        rtt: 50,
        networkScore: 85,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockInsights,
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.getNetworkInsights();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/network/insights'),
        expect.any(Object)
      );
      expect(result.data?.networkScore).toBe(85);
    });
  });

  describe('getHealth', () => {
    it('should check API health', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { status: 'healthy' },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.getHealth();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.any(Object)
      );
      expect(result.data?.status).toBe('healthy');
    });
  });

  describe('error handling', () => {
    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Server error',
          },
        }),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INTERNAL_ERROR');
      expect(result.error?.message).toBe('Server error');
    });

    it('should handle HTTP errors with missing error details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({}),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNKNOWN_ERROR');
      expect(result.error?.message).toBe('An error occurred');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failed'));

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.message).toBe('Network failed');
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.message).toBe('Network error');
    });

    it('should handle JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const { apiClient } = await import('@/lib/api');
      const result = await apiClient.detectIP();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
    });
  });

  describe('request headers', () => {
    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: {} }),
      });

      const { apiClient } = await import('@/lib/api');
      await apiClient.detectIP();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });
});
