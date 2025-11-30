'use client';

import { LabDock } from './LabDock';
import { StatusBar, type StatusReading } from './StatusBar';

interface LabShellProps {
  children: React.ReactNode;
  statusReadings: StatusReading[];
  diagnosticsRunning?: boolean;
  onRunDiagnostics?: () => void;
}

export function LabShell({
  children,
  statusReadings,
  diagnosticsRunning,
  onRunDiagnostics,
}: LabShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <LabDock />
      <div className="flex-1 overflow-hidden">
        <StatusBar
          readings={statusReadings}
          diagnosticsRunning={diagnosticsRunning}
          onRunDiagnostics={onRunDiagnostics}
        />
        <div className="relative h-full bg-slate-950">
          <div className="pointer-events-none absolute inset-0 bg-lab-grid opacity-20" aria-hidden="true" />
          <div className="relative z-10 px-6 py-10 lg:px-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
