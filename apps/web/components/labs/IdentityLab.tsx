'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { LabShell } from '@/components/layout/LabShell';
import { useFingerprintDetect } from '@/hooks/useFingerprintDetect';

export function IdentityLab() {
  const { data, detect, loading, error, progress } = useFingerprintDetect();

  const statusReadings = useMemo(() => {
    return [
      {
        label: 'Canvas',
        value: data?.canvas.hash.slice(0, 8) || 'IDLE',
        tone: data?.canvas.isSupported ? 'active' as const : 'neutral' as const,
      },
      {
        label: 'WebGL',
        value: data?.webgl.vendor || 'IDLE',
        tone: data?.webgl.isSupported ? 'active' as const : 'neutral' as const,
      },
      {
        label: 'Audio',
        value: data?.audio.sampleRate ? `${data.audio.sampleRate}hz` : 'IDLE',
        tone: data?.audio.isSupported ? 'active' as const : 'neutral' as const,
      },
    ];
  }, [data]);

  return (
    <LabShell statusReadings={statusReadings} diagnosticsRunning={loading} onRunDiagnostics={detect}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Identity Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Canvas &amp; WebGL Specimens</h1>
          <p className="mt-2 text-sm text-slate-400">Capture pixel-perfect fingerprints and entropy breakdowns.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="specimen-container p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Canvas Specimen</p>
            {data?.canvas.dataURL ? (
              <div className="mt-4">
                <Image
                  src={data.canvas.dataURL}
                  alt="Canvas fingerprint specimen"
                  width={data.canvas.width}
                  height={data.canvas.height}
                  className="w-full max-w-md border border-slate-800"
                  unoptimized
                />
                <p className="mt-4 font-mono text-xs text-cyan-300">{data.canvas.hash}</p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">Run the capture to render a specimen.</p>
            )}
          </div>
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Uniqueness</p>
            <p className="mt-4 text-4xl text-orange-400">{data?.uniquenessScore ?? 0}<span className="text-lg text-slate-500">/100</span></p>
            <p className="text-sm text-slate-400">Risk level: {data?.riskLevel ?? 'unknown'}</p>
            <div className="mt-6 space-y-2 text-xs text-slate-400">
              <FingerprintStat label="WebGL Vendor" value={data?.webgl.vendor || 'n/a'} />
              <FingerprintStat label="Renderer" value={data?.webgl.renderer || 'n/a'} />
              <FingerprintStat label="Fonts Detected" value={`${data?.fonts.fontCount ?? 0}`} />
              <FingerprintStat label="Audio Hash" value={data?.audio.hash || 'n/a'} />
            </div>
            {error && <p className="mt-4 text-xs text-orange-400">{error}</p>}
            {loading && (
              <div className="mt-4 text-xs text-slate-500">
                Capturing… <span className="text-cyan-300">{progress}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </LabShell>
  );
}

function FingerprintStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1 last:border-none">
      <span>{label}</span>
      <span className="font-mono text-cyan-200">{value}</span>
    </div>
  );
}
