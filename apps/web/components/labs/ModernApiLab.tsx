'use client';

import { useMemo, useState } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { ApiScannerGrid } from '@/components/modern/ApiScannerGrid';
import { SocialLoginDetector } from '@/components/modern/SocialLoginDetector';
import { ApiSurfaceFuzzer } from '@/components/modern/ApiSurfaceFuzzer';

export function ModernApiLab() {
  const capabilitySnapshot = useMemo(() => detectCapabilities(), []);
  const [clipboardSample, setClipboardSample] = useState<string>('');
  const [clipboardError, setClipboardError] = useState<string>('');

  const statusReadings = capabilitySnapshot.slice(0, 3).map((cap) => ({
    label: cap.label,
    value: cap.status,
    detail: cap.detail,
    tone: cap.status === 'active' ? 'alert' as const : 'neutral' as const,
  }));

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard?.readText();
      setClipboardSample(text || '(empty)');
      setClipboardError('');
    } catch (error) {
      setClipboardError(error instanceof Error ? error.message : 'Permission denied');
    }
  };

  return (
    <LabShell statusReadings={statusReadings} diagnosticsRunning={false}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Modern API Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Capability &amp; Attack Surface Scanner</h1>
          <p className="mt-2 text-sm text-slate-400">Inspect high-risk Web APIs (Bluetooth, USB, Clipboard, Credentials).</p>
        </header>
        <ApiScannerGrid />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Clipboard Probe</p>
                <p className="text-xs text-slate-500">Requests read access (requires user gesture).</p>
              </div>
              <button
                onClick={readClipboard}
                className="rounded-sm border border-cyan-400/40 px-4 py-2 text-xs tracking-[0.3em] text-cyan-200"
              >
                READ
              </button>
            </div>
            {clipboardSample && (
              <p className="mt-4 whitespace-pre-wrap rounded-sm border border-slate-800/80 p-3 text-sm text-cyan-200">{clipboardSample}</p>
            )}
            {clipboardError && <p className="mt-4 text-xs text-orange-400">{clipboardError}</p>}
          </div>
          <SocialLoginDetector />
        </div>
        <ApiSurfaceFuzzer />
      </div>
    </LabShell>
  );
}

function detectCapabilities() {
  if (typeof navigator === 'undefined') {
    return [
      { label: 'Bluetooth', status: 'unknown', detail: 'Loading...' },
      { label: 'USB', status: 'unknown', detail: 'Loading...' },
      { label: 'Clipboard', status: 'unknown', detail: 'Loading...' },
    ];
  }
  return [
    {
      label: 'Bluetooth',
      status: 'bluetooth' in navigator ? 'active' : 'unsupported',
      detail: 'bluetooth' in navigator ? 'Device discovery available' : 'Not exposed',
    },
    {
      label: 'USB',
      status: 'usb' in navigator ? 'active' : 'unsupported',
      detail: 'usb' in navigator ? 'Potential serial leak' : 'Not exposed',
    },
    {
      label: 'Clipboard',
      status: navigator.clipboard ? 'active' : 'guarded',
      detail: navigator.clipboard ? 'Read/write gated by permission' : 'Requires gestures',
    },
  ];
}
