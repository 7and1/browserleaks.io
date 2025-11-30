'use client';

import { useState } from 'react';

interface ProviderProbe {
  id: string;
  label: string;
  pixel: string;
}

const providers: ProviderProbe[] = [
  { id: 'google', label: 'Google', pixel: 'https://www.google.com/favicon.ico' },
  { id: 'facebook', label: 'Facebook', pixel: 'https://www.facebook.com/favicon.ico' },
  { id: 'twitter', label: 'X / Twitter', pixel: 'https://abs.twimg.com/favicons/twitter.2.ico' },
];

interface ProbeResult {
  provider: string;
  latency: number;
  verdict: 'unknown' | 'likely';
}

export function SocialLoginDetector() {
  const [results, setResults] = useState<ProbeResult[]>([]);
  const [running, setRunning] = useState(false);

  const probeProvider = (provider: ProviderProbe) =>
    new Promise<ProbeResult>((resolve) => {
      const start = performance.now();
      const pixel = new Image();
      pixel.crossOrigin = 'anonymous';
      pixel.referrerPolicy = 'no-referrer';
      pixel.onload = () => {
        const latency = performance.now() - start;
        resolve({
          provider: provider.label,
          latency,
          verdict: latency < 120 ? 'likely' : 'unknown',
        });
      };
      pixel.onerror = () => {
        const latency = performance.now() - start;
        resolve({ provider: provider.label, latency, verdict: 'unknown' });
      };
      pixel.src = `${provider.pixel}?ts=${Date.now()}`;
    });

  const run = async () => {
    setRunning(true);
    const outcome: ProbeResult[] = [];
    for (const provider of providers) {
      const result = await probeProvider(provider);
      outcome.push(result);
    }
    setResults(outcome);
    setRunning(false);
  };

  return (
    <div className="lab-panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Social Login Detector</p>
          <p className="text-xs text-slate-500">Measures authentication cache timing (demo).</p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="rounded-sm border border-cyan-400/40 px-4 py-2 text-xs tracking-[0.3em] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {running ? 'PROBING…' : 'RUN' }
        </button>
      </div>
      <div className="mt-4 grid gap-3">
        {results.map((result) => (
          <div key={result.provider} className="flex items-center justify-between rounded-sm border border-slate-800/80 px-4 py-2 text-sm">
            <span>{result.provider}</span>
            <span className={result.verdict === 'likely' ? 'text-orange-400' : 'text-slate-400'}>
              {result.verdict === 'likely' ? 'Likely logged in' : 'Unknown'} · {result.latency.toFixed(1)} ms
            </span>
          </div>
        ))}
        {!results.length && <p className="text-xs text-slate-500">No probes executed yet.</p>}
      </div>
    </div>
  );
}
