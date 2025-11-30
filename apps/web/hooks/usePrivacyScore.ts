'use client';

import { useState, useCallback, useEffect } from 'react';
import type { IPLeakResult, DNSLeakResult, PrivacyScore, WebRTCLeakResult } from '@browserleaks/types';
import { apiClient } from '@/lib/api';

interface UsePrivacyScoreState {
  score: PrivacyScore | null;
  loading: boolean;
  error: string | null;
}

export function usePrivacyScore(
  ipData?: IPLeakResult | null,
  dnsData?: DNSLeakResult | null,
  webrtcData?: WebRTCLeakResult | null
) {
  const [state, setState] = useState<UsePrivacyScoreState>({
    score: null,
    loading: false,
    error: null,
  });

  const calculate = useCallback(async () => {
    if (!ipData && !dnsData && !webrtcData) {
      return;
    }

    setState({ score: null, loading: true, error: null });

    try {
      const response = await apiClient.calculatePrivacyScore({
        ipLeak: ipData,
        dnsLeak: dnsData,
        webrtcLeak: webrtcData,
      });

      if (response.success && response.data) {
        setState({
          score: response.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          score: null,
          loading: false,
          error: response.error?.message || 'Failed to calculate privacy score',
        });
      }
    } catch (err) {
      setState({
        score: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  }, [ipData, dnsData, webrtcData]);

  // Auto-calculate when data changes
  useEffect(() => {
    if (ipData || dnsData || webrtcData) {
      calculate();
    }
  }, [ipData, dnsData, webrtcData, calculate]);

  return {
    ...state,
    calculate,
  };
}
