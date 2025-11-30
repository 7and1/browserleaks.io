'use client';

import { Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SpecimenTestCardProps {
  title: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  metric?: string;
  actionLabel?: string;
  onRun?: () => void;
  href: string;
}

const statusColor: Record<SpecimenTestCardProps['status'], string> = {
  idle: 'text-slate-400',
  running: 'text-cyan-200',
  passed: 'text-cyan-300',
  failed: 'text-orange-400',
};

export function SpecimenTestCard({
  title,
  description,
  status,
  metric,
  onRun,
  actionLabel = 'RUN',
  href,
}: SpecimenTestCardProps) {
  return (
    <div className="specimen-container flex flex-col gap-4 p-4 shadow-lab-card">
      <div>
        <div className="text-xs uppercase tracking-[0.4em] text-slate-500">{title}</div>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
      </div>
      <div className={`text-sm font-mono ${statusColor[status]}`}>
        {status === 'running' && <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />} {status.toUpperCase()}
      </div>
      {metric && <div className="text-lg font-mono text-cyan-300">{metric}</div>}
      <div className="mt-auto flex items-center gap-3 text-xs">
        <button
          onClick={onRun}
          disabled={status === 'running'}
          className="rounded-sm border border-cyan-400/50 px-3 py-1 tracking-[0.3em] text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'running' ? 'SCANNING' : actionLabel}
        </button>
        <Link href={href} className="text-slate-400 underline-offset-4 hover:text-cyan-200">
          DETAILS
        </Link>
      </div>
    </div>
  );
}
