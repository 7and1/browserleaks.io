'use client';

import { useState, useCallback } from 'react';
import { apiClient, type IPLeakResult, type APIResponse } from '@/lib/api';

interface UseIPDetectState {
  data: IPLeakResult | null;
  loading: boolean;
  error: string | null;
}

export function useIPDetect() {
  const [state, setState] = useState<UseIPDetectState>({
    data: null,
    loading: false,
    error: null,
  });

  const detect = useCallback(async (ip?: string) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response: APIResponse<IPLeakResult> = await apiClient.detectIP(ip);

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
          error: response.error?.message || 'Failed to detect IP',
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
