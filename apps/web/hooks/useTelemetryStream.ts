'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AuditEntry } from '@/components/dashboard/LiveAuditLog';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type TelemetryWireEvent = {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  timestamp: number;
};

type SeedWireEvent = {
  id: string;
  createdAt: number;
  leaks?: {
    webrtc: boolean;
    dns: string;
  };
  report?: {
    privacyIndex?: {
      score: number;
      exposureLevel?: 'low' | 'medium' | 'high' | 'critical';
    };
  };
};

const severityMap: Record<string, AuditEntry['status']> = {
  low: 'ok',
  medium: 'warn',
  high: 'critical',
  critical: 'critical',
};

export function useTelemetryStream(seed: AuditEntry[] = [], limit = 40) {
  const [entries, setEntries] = useState<AuditEntry[]>(seed);
  const seedSerialized = useMemo(() => JSON.stringify(seed), [seed]);

  useEffect(() => {
    setEntries(seed);
  }, [seedSerialized]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    const source = new EventSource(`${API_BASE}/v1/events/stream`);

    source.addEventListener('telemetry', (event) => {
      const wire = JSON.parse((event as MessageEvent<string>).data) as TelemetryWireEvent;
      const model = mapTelemetryEvent(wire);
      setEntries((prev) => dedupe([model, ...prev], limit));
    });

    source.addEventListener('seed', (event) => {
      const wire = JSON.parse((event as MessageEvent<string>).data) as SeedWireEvent;
      const model = mapSeedEvent(wire);
      setEntries((prev) => dedupe([...prev, model], limit));
    });

    source.addEventListener('error', () => {
      source.close();
    });

    return () => {
      source.close();
    };
  }, [limit]);

  return entries;
}

function mapTelemetryEvent(event: TelemetryWireEvent): AuditEntry {
  return {
    time: new Date(event.timestamp).toLocaleTimeString(),
    label: event.type,
    status: severityMap[event.severity] || 'ok',
    detail: event.summary,
  };
}

function mapSeedEvent(event: SeedWireEvent): AuditEntry {
  const severity = event.report?.privacyIndex?.exposureLevel || 'low';
  return {
    time: new Date(event.createdAt).toLocaleTimeString(),
    label: 'historical',
    status: severityMap[severity] || 'ok',
    detail: `Score ${event.report?.privacyIndex?.score ?? 0}`,
  };
}

function dedupe(list: AuditEntry[], limit: number) {
  const seen = new Set<string>();
  const result: AuditEntry[] = [];
  for (const entry of list) {
    const key = `${entry.time}-${entry.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
    if (result.length >= limit) break;
  }
  return result;
}
