'use client';

import { useState } from 'react';

interface SurfaceEntry {
  name: string;
  type: string;
}

const baseline = new Set([
  'window',
  'document',
  'navigator',
  'location',
  'history',
  'localStorage',
  'sessionStorage',
  'console',
]);

export function ApiSurfaceFuzzer() {
  const [entries, setEntries] = useState<SurfaceEntry[]>([]);

  const run = () => {
    if (typeof window === 'undefined') return;
    const props = Object.getOwnPropertyNames(window)
      .filter((prop) => !baseline.has(prop) && !prop.startsWith('on'))
      .map((prop) => ({ name: prop, type: typeof (window as unknown as Record<string, unknown>)[prop] }));

    setEntries(props.sort((a, b) => a.name.localeCompare(b.name)));
  };

  const download = (format: 'json' | 'csv') => {
    if (!entries.length) return;
    let blob: Blob;
    if (format === 'json') {
      blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    } else {
      const header = 'name,type\n';
      const rows = entries.map((entry) => `${entry.name},${entry.type}`).join('\n');
      blob = new Blob([header + rows], { type: 'text/csv' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-surface.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lab-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">API Surface Fuzzer</p>
          <p className="text-xs text-slate-500">Lists non-standard globals visible to scripts.</p>
        </div>
        <div className="flex gap-2 text-xs">
          <button onClick={run} className="rounded-sm border border-cyan-400/40 px-4 py-2 tracking-[0.3em] text-cyan-200">SCAN</button>
          <button onClick={() => download('json')} disabled={!entries.length} className="rounded-sm border border-slate-700/80 px-3 py-2 text-slate-400 disabled:opacity-40">JSON</button>
          <button onClick={() => download('csv')} disabled={!entries.length} className="rounded-sm border border-slate-700/80 px-3 py-2 text-slate-400 disabled:opacity-40">CSV</button>
        </div>
      </div>
      <div className="mt-4 max-h-64 overflow-auto text-sm">
        {!entries.length && <p className="text-slate-500">No scan yet.</p>}
        {entries.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between border-b border-slate-800/60 py-1">
            <span className="font-mono text-cyan-200">{entry.name}</span>
            <span className="text-xs text-slate-500">{entry.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
