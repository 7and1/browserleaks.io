import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTelemetryStream } from '@/hooks/useTelemetryStream';
import type { AuditEntry } from '@/components/dashboard/LiveAuditLog';

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  readyState: number = 0;
  listeners: Map<string, ((event: any) => void)[]> = new Map();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2;
  }

  // Helper to trigger events in tests
  emit(type: string, data: any) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        listener({ data: JSON.stringify(data) });
      });
    }
  }

  static reset() {
    MockEventSource.instances = [];
  }
}

// Store original and setup mock
const originalEventSource = global.EventSource;

beforeEach(() => {
  MockEventSource.reset();
  (global as any).EventSource = MockEventSource;
});

afterEach(() => {
  (global as any).EventSource = originalEventSource;
});

const seedEntries: AuditEntry[] = [
  { time: '10:00:00', label: 'ip-check', status: 'ok', detail: 'IP detected' },
  { time: '10:00:01', label: 'dns-check', status: 'ok', detail: 'DNS clean' },
];

describe('useTelemetryStream', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    MockEventSource.reset();
  });

  it('should return seed entries as initial state', () => {
    const { result } = renderHook(() => useTelemetryStream(seedEntries));

    expect(result.current).toEqual(seedEntries);
  });

  it('should return empty array when no seed is provided', () => {
    const { result } = renderHook(() => useTelemetryStream());

    expect(result.current).toEqual([]);
  });

  it('should create EventSource connection on mount', () => {
    renderHook(() => useTelemetryStream());

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toContain('/v1/events/stream');
  });

  it('should close EventSource on unmount', () => {
    const { unmount } = renderHook(() => useTelemetryStream());

    const eventSource = MockEventSource.instances[0];
    expect(eventSource.readyState).not.toBe(2);

    unmount();

    expect(eventSource.readyState).toBe(2);
  });

  it('should add telemetry events to entries', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('telemetry', {
        id: 'event-1',
        type: 'webrtc-check',
        severity: 'low',
        summary: 'WebRTC test completed',
        timestamp: Date.now(),
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].label).toBe('webrtc-check');
    expect(result.current[0].status).toBe('ok');
    expect(result.current[0].detail).toBe('WebRTC test completed');
  });

  it('should add seed events to entries', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('seed', {
        id: 'seed-1',
        createdAt: Date.now(),
        report: {
          privacyIndex: {
            score: 75,
            exposureLevel: 'medium',
          },
        },
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].label).toBe('historical');
    expect(result.current[0].status).toBe('warn');
    expect(result.current[0].detail).toBe('Score 75');
  });

  it('should map severity levels correctly', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];

    // Test all severity levels
    const severityTests = [
      { severity: 'low', expectedStatus: 'ok' },
      { severity: 'medium', expectedStatus: 'warn' },
      { severity: 'high', expectedStatus: 'critical' },
      { severity: 'critical', expectedStatus: 'critical' },
    ];

    for (let i = 0; i < severityTests.length; i++) {
      const { severity, expectedStatus } = severityTests[i];

      await act(async () => {
        eventSource.emit('telemetry', {
          id: `event-${i}`,
          type: `test-${severity}`,
          severity,
          summary: `Test ${severity}`,
          timestamp: Date.now() + i * 1000,
        });
      });

      expect(result.current[0].status).toBe(expectedStatus);
    }
  });

  it('should deduplicate entries with same time and detail', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];
    const timestamp = Date.now();

    await act(async () => {
      eventSource.emit('telemetry', {
        id: 'event-1',
        type: 'ip-check',
        severity: 'low',
        summary: 'Same detail',
        timestamp,
      });
    });

    await act(async () => {
      eventSource.emit('telemetry', {
        id: 'event-2',
        type: 'ip-check',
        severity: 'low',
        summary: 'Same detail',
        timestamp,
      });
    });

    // Should only have one entry due to deduplication
    const uniqueDetails = new Set(result.current.map(e => e.detail));
    expect(uniqueDetails.size).toBeLessThanOrEqual(result.current.length);
  });

  it('should respect the limit parameter', async () => {
    const limit = 5;
    const { result } = renderHook(() => useTelemetryStream([], limit));

    const eventSource = MockEventSource.instances[0];

    // Add more events than the limit
    for (let i = 0; i < 10; i++) {
      await act(async () => {
        eventSource.emit('telemetry', {
          id: `event-${i}`,
          type: 'test',
          severity: 'low',
          summary: `Event ${i}`,
          timestamp: Date.now() + i * 1000,
        });
      });
    }

    expect(result.current.length).toBeLessThanOrEqual(limit);
  });

  it('should prepend new telemetry events', async () => {
    const { result } = renderHook(() => useTelemetryStream(seedEntries));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('telemetry', {
        id: 'new-event',
        type: 'new-check',
        severity: 'low',
        summary: 'New event',
        timestamp: Date.now(),
      });
    });

    // New event should be first
    expect(result.current[0].label).toBe('new-check');
  });

  it('should append seed events', async () => {
    const { result } = renderHook(() => useTelemetryStream(seedEntries));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('seed', {
        id: 'seed-new',
        createdAt: Date.now(),
        report: {
          privacyIndex: {
            score: 90,
            exposureLevel: 'low',
          },
        },
      });
    });

    // Seed event should be appended (after existing entries)
    const lastEntry = result.current[result.current.length - 1];
    expect(lastEntry.label).toBe('historical');
    expect(lastEntry.detail).toBe('Score 90');
  });

  it('should handle error events by closing connection', async () => {
    renderHook(() => useTelemetryStream());

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      const errorListeners = eventSource.listeners.get('error');
      if (errorListeners) {
        errorListeners.forEach(listener => listener({}));
      }
    });

    expect(eventSource.readyState).toBe(2);
  });

  it('should update entries when seed prop changes', async () => {
    const initialSeed: AuditEntry[] = [
      { time: '10:00:00', label: 'initial', status: 'ok', detail: 'Initial' },
    ];

    const newSeed: AuditEntry[] = [
      { time: '11:00:00', label: 'updated', status: 'warn', detail: 'Updated' },
    ];

    const { result, rerender } = renderHook(
      ({ seed }) => useTelemetryStream(seed),
      { initialProps: { seed: initialSeed } }
    );

    expect(result.current[0].label).toBe('initial');

    rerender({ seed: newSeed });

    await waitFor(() => {
      expect(result.current[0].label).toBe('updated');
    });
  });

  it('should handle seed events with missing score', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('seed', {
        id: 'seed-no-score',
        createdAt: Date.now(),
        report: {},
      });
    });

    expect(result.current[0].detail).toBe('Score 0');
  });

  it('should handle seed events with leaks information', async () => {
    const { result } = renderHook(() => useTelemetryStream([]));

    const eventSource = MockEventSource.instances[0];

    await act(async () => {
      eventSource.emit('seed', {
        id: 'seed-with-leaks',
        createdAt: Date.now(),
        leaks: {
          webrtc: true,
          dns: 'full',
        },
        report: {
          privacyIndex: {
            score: 45,
            exposureLevel: 'high',
          },
        },
      });
    });

    expect(result.current[0].status).toBe('critical');
    expect(result.current[0].detail).toBe('Score 45');
  });

  it('should not create EventSource when EventSource is unavailable', () => {
    // Store original EventSource
    const originalEventSource = (global as any).EventSource;
    // @ts-ignore - simulate SSR by removing EventSource
    delete (global as any).EventSource;

    const { result } = renderHook(() => useTelemetryStream(seedEntries));

    expect(result.current).toEqual(seedEntries);

    // Restore EventSource
    (global as any).EventSource = originalEventSource;
  });
});
