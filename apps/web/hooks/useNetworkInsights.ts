'use client';

import { useEffect, useState } from 'react';
import type { NetworkInsightsPayload } from '@/types/network';
import { apiClient } from '@/lib/api';

interface UseNetworkInsightsState {
  data: NetworkInsightsPayload | null;
  loading: boolean;
  error: string | null;
}

export function useNetworkInsights() {
  const [state, setState] = useState<UseNetworkInsightsState>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;
    setState((prev) => ({ ...prev, loading: true }));

    apiClient
      .getNetworkInsights()
      .then((response) => {
        if (!isMounted) return;
        if (response.success && response.data) {
          setState({ data: response.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: response.error?.message || 'Unable to load network lab' });
        }
      })
      .catch((error) => {
        if (!isMounted) return;
        setState({ data: null, loading: false, error: error.message });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
