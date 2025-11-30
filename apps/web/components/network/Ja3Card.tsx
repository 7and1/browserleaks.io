'use client';

interface Ja3CardProps {
  hash: string;
  userAgent: string;
  ciphers: string[];
}

export function Ja3Card({ hash, userAgent, ciphers }: Ja3CardProps) {
  return (
    <div className="lab-panel p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">JA3 Fingerprint</div>
      <p className="mt-2 text-sm text-slate-400">{userAgent}</p>
      <p className="mt-4 font-mono text-lg text-orange-400">{hash}</p>
      <div className="mt-4 text-xs text-slate-400">
        <p className="uppercase tracking-[0.3em] text-slate-500">Cipher Suites</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {ciphers.slice(0, 10).map((cipher) => (
            <span key={cipher} className="rounded-sm border border-slate-700/60 px-2 py-1 text-[0.65rem]">{cipher}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
