'use client';

import { Activity, Power, ShieldCheck, Wifi } from 'lucide-react';

export type StatusReading = {
  label: string;
  value: string;
  tone?: 'neutral' | 'active' | 'alert';
  detail?: string;
};

interface StatusBarProps {
  readings: StatusReading[];
  diagnosticsRunning?: boolean;
  onRunDiagnostics?: () => void;
}

const toneClasses: Record<NonNullable<StatusReading['tone']>, string> = {
  neutral: 'text-slate-400',
  active: 'text-cyan-300',
  alert: 'text-orange-400',
};

export function StatusBar({ readings, diagnosticsRunning, onRunDiagnostics }: StatusBarProps) {
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
      <div className="mr-6 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-slate-500">
        <ShieldCheck className="h-3.5 w-3.5" />
        STATUS FEED
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-4 text-sm font-mono">
        {readings.map((reading) => (
          <div key={reading.label} className="flex flex-col">
            <span className="text-[0.6rem] uppercase tracking-[0.35em] text-slate-500">
              {reading.label}
            </span>
            <span className={`decrypted-text text-base ${toneClasses[reading.tone || 'neutral']}`}>
              {reading.value}
            </span>
            {reading.detail && (
              <span className="text-[0.6rem] text-slate-500">{reading.detail}</span>
            )}
          </div>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden xl:flex items-center gap-1 text-xs text-slate-500">
          <Wifi className="h-4 w-4" />
          <Activity className="h-4 w-4" />
          <Power className="h-4 w-4" />
        </div>
        {onRunDiagnostics && (
          <button
            onClick={onRunDiagnostics}
            disabled={diagnosticsRunning}
            className="rounded-sm border border-cyan-400/40 px-4 py-2 text-xs font-semibold tracking-[0.3em] text-cyan-200 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {diagnosticsRunning ? 'SCANNING…' : 'RUN FULL SCAN'}
          </button>
        )}
      </div>
    </div>
  );
}
