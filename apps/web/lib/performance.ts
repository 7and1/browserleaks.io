import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Debounce hook for expensive operations
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttle hook for rate-limiting function calls
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timeoutId = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options]);

  return [ref, isIntersecting];
}

/**
 * Lazy load component only when visible
 */
export function useLazyLoad(
  threshold = 0.1
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isIntersecting, hasLoaded]);

  return [ref, hasLoaded];
}

/**
 * Prefetch data on hover
 */
export function usePrefetch<T>(
  fetchFn: () => Promise<T>
): [() => void, T | null, boolean] {
  const [data, setData] = useState<T | null>(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const hasPrefetched = useRef(false);

  const prefetch = useCallback(async () => {
    if (hasPrefetched.current || isPrefetching) return;

    hasPrefetched.current = true;
    setIsPrefetching(true);

    try {
      const result = await fetchFn();
      setData(result);
    } catch (error) {
      console.error('Prefetch error:', error);
      hasPrefetched.current = false;
    } finally {
      setIsPrefetching(false);
    }
  }, [fetchFn, isPrefetching]);

  return [prefetch, data, isPrefetching];
}

/**
 * Request idle callback hook for non-urgent tasks
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    } else {
      const id = setTimeout(callback, 1);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Performance mark hook for debugging
 */
export function usePerformanceMark(name: string): void {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(`${name}-start`);
      return () => {
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
      };
    }
  }, [name]);
}

/**
 * Memory usage monitor (development only)
 */
export function useMemoryMonitor(): number | null {
  const [memory, setMemory] = useState<number | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateMemory = () => {
      // @ts-expect-error - memory is not in the Performance type
      if (performance.memory) {
        // @ts-expect-error - memory is not in the Performance type
        setMemory(Math.round(performance.memory.usedJSHeapSize / 1048576));
      }
    };

    updateMemory();
    const interval = setInterval(updateMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  return memory;
}

/**
 * Stable callback that doesn't cause re-renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: unknown[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Web Vitals reporting
 */
export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: string;
}): void {
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    // Example: send to Google Analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-expect-error - gtag is not typed
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value}`);
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Preconnect to API server
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = new URL(apiUrl).origin;
    document.head.appendChild(link);
  }

  // Preload critical fonts
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/jetbrains-mono.woff2',
  ];

  fonts.forEach((font) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = font;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

/**
 * Measure component render time
 */
export function measureRender(componentName: string): () => void {
  if (process.env.NODE_ENV !== 'development') {
    return () => {};
  }

  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`[Slow Render] ${componentName}: ${duration.toFixed(2)}ms`);
    }
  };
}
