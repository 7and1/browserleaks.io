'use client';

interface AttackSurfaceEntry {
  label: string;
  status: 'active' | 'guarded' | 'unsupported';
  detail: string;
}

const surfaceTone: Record<AttackSurfaceEntry['status'], string> = {
  active: 'border-orange-500/40 bg-orange-500/10 text-orange-200',
  guarded: 'border-cyan-400/40 bg-cyan-500/5 text-cyan-200',
  unsupported: 'border-slate-700 bg-slate-900 text-slate-500',
};

export function AttackSurfacePanel({ apis }: { apis: AttackSurfaceEntry[] }) {
  return (
    <div className="lab-panel h-full p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Attack Surface</div>
      <div className="mt-4 space-y-3">
        {apis.map((api) => (
          <div
            key={api.label}
            className={`rounded-sm border px-4 py-3 text-sm font-mono ${surfaceTone[api.status]}`}
          >
            <div className="flex items-center justify-between">
              <span>{api.label}</span>
              <span className="text-[0.65rem] uppercase tracking-[0.3em]">
                {api.status}
              </span>
            </div>
            <div className="mt-1 text-xs text-slate-400">{api.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export type { AttackSurfaceEntry };
