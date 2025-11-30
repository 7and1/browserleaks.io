'use client';

import { useState, useCallback } from 'react';
import { WebRTCDetector } from '@/lib/webrtc-detector';
import { apiClient } from '@/lib/api';

interface WebRTCLeakResult {
  isLeak: boolean;
  localIPs: string[];
  publicIPs: string[];
  natType: 'host' | 'srflx' | 'prflx' | 'relay' | 'unknown';
  mdnsLeak: boolean;
  ipv6Leak: boolean;
  stunResults: Array<{
    server: string;
    ip: string;
    country: string;
    latency: number;
  }>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
  }>;
  recommendations: string[];
}

interface UseWebRTCDetectState {
  data: WebRTCLeakResult | null;
  loading: boolean;
  error: string | null;
  progress: number;
}

export function useWebRTCDetect() {
  const [state, setState] = useState<UseWebRTCDetectState>({
    data: null,
    loading: false,
    error: null,
    progress: 0,
  });

  const detect = useCallback(async () => {
    setState({ data: null, loading: true, error: null, progress: 0 });

    try {
      const detector = new WebRTCDetector();

      // Update progress
      setState((prev) => ({ ...prev, progress: 25 }));

      // Detect WebRTC leaks
      const { candidates, localIPs, publicIPs } = await detector.detectAll();

      setState((prev) => ({ ...prev, progress: 75 }));

      // Send to backend for analysis
      const response = await apiClient.detectWebRTCLeak({
        publicIp: '',
        localIPs,
        candidates: candidates.map((c) => ({
          ip: c.ip,
          type: c.type,
          server: c.server,
        })),
      });

      setState((prev) => ({ ...prev, progress: 100 }));

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
          progress: 100,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error?.message || 'Failed to detect WebRTC leak',
          progress: 0,
        });
      }
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
        progress: 0,
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, progress: 0 });
  }, []);

  return {
    ...state,
    detect,
    reset,
  };
}
