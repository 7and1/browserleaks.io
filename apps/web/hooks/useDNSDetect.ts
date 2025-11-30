'use client';

import { useState, useCallback } from 'react';
import { apiClient, type DNSLeakResult, type APIResponse } from '@/lib/api';

interface UseDNSDetectState {
  data: DNSLeakResult | null;
  loading: boolean;
  error: string | null;
}

export function useDNSDetect() {
  const [state, setState] = useState<UseDNSDetectState>({
    data: null,
    loading: false,
    error: null,
  });

  const detect = useCallback(async (userIp?: string, userCountry?: string) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response: APIResponse<DNSLeakResult> = await apiClient.detectDNSLeak(
        userIp,
        userCountry
      );

      if (response.success && response.data) {
        setState({
          data: response.data,
          loading: false,
          error: null,
        });
      } else {
        setState({
          data: null,
          loading: false,
          error: response.error?.message || 'Failed to detect DNS leak',
        });
      }
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    detect,
    reset,
  };
}
