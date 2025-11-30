'use client';

interface AuditEntry {
  time: string;
  label: string;
  status: 'ok' | 'warn' | 'critical' | 'pending';
  detail: string;
}

const statusClasses: Record<AuditEntry['status'], string> = {
  ok: 'text-cyan-300',
  warn: 'text-yellow-300',
  critical: 'text-orange-400',
  pending: 'text-slate-400 animate-pulse',
};

export function LiveAuditLog({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="lab-panel h-full overflow-hidden p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Live Audit Log</div>
      <div className="mt-4 h-[320px] overflow-hidden">
        <div className="space-y-3 font-mono text-xs">
          {entries.map((entry) => (
            <div
              key={`${entry.label}-${entry.time}`}
              className="border-b border-slate-800/60 pb-3 last:border-none"
            >
              <div className="flex items-center justify-between text-[0.6rem] text-slate-500">
                <span>{entry.time}</span>
                <span>{entry.label}</span>
              </div>
              <div className={`mt-1 text-sm ${statusClasses[entry.status]}`}>{entry.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { AuditEntry };
