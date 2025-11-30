'use client';

import type { LanHost } from '@/types/network';

const tone: Record<LanHost['status'], string> = {
  open: 'text-orange-300',
  filtered: 'text-yellow-300',
  closed: 'text-slate-400',
};

export function LanScannerPanel({ hosts }: { hosts: LanHost[] }) {
  return (
    <div className="lab-panel p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">LAN Scanner</div>
      <div className="mt-4 space-y-3 text-sm">
        {hosts.map((host) => (
          <div key={host.ip} className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-none">
            <div>
              <p className="font-mono text-cyan-200">{host.ip}</p>
              <p className="text-xs text-slate-500">{host.device}</p>
            </div>
            <div className="text-right">
              <p className={`${tone[host.status]} font-semibold`}>{host.status.toUpperCase()}</p>
              <p className="text-xs text-slate-500">{host.service}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
