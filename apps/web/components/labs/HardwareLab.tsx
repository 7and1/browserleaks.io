'use client';

import { useEffect, useMemo, useState } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { MotionVisualizer } from '@/components/hardware/MotionVisualizer';
import { BioRhythm } from '@/components/hardware/BioRhythm';

interface BatterySnapshot {
  level: string;
  charging: boolean;
}

interface BatteryManager {
  level: number;
  charging: boolean;
}

export function HardwareLab() {
  const [rotation, setRotation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [samples, setSamples] = useState<number[]>([]);
  const [battery, setBattery] = useState<BatterySnapshot>({ level: 'N/A', charging: false });

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const alpha = event.alpha ?? 0;
      const beta = event.beta ?? 0;
      const gamma = event.gamma ?? 0;
      setRotation({ alpha, beta, gamma });
      setSamples((prev) => {
        const next = [...prev, gamma / 90];
        if (next.length > 60) next.shift();
        return next;
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };

    nav.getBattery?.().then((manager) => {
      setBattery({
        level: `${Math.round(manager.level * 100)}%`,
        charging: manager.charging,
      });
    });
  }, []);

  const statusReadings = useMemo(
    () => [
      { label: 'Battery', value: battery.level, detail: battery.charging ? 'Charging' : 'Idle', tone: 'active' as const },
      { label: 'Motion β', value: `${rotation.beta.toFixed(1)}°`, tone: 'active' as const },
      { label: 'Motion γ', value: `${rotation.gamma.toFixed(1)}°`, tone: 'active' as const },
    ],
    [battery, rotation]
  );

  return (
    <LabShell statusReadings={statusReadings} diagnosticsRunning={false}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Hardware Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Sensor Telemetry &amp; Bio-Rhythm</h1>
          <p className="mt-2 text-sm text-slate-400">Visualize DeviceOrientation, Battery, and Audio API exposure.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <MotionVisualizer rotation={rotation} />
          <BioRhythm samples={samples} />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <HardwareStatCard
            title="Battery"
            primary={battery.level}
            secondary={battery.charging ? 'Charging' : 'Not charging'}
            description="Battery Status API"
          />
          <HardwareStatCard
            title="Sensors"
            primary={`${rotation.beta.toFixed(1)}° / ${rotation.gamma.toFixed(1)}°`}
            secondary="β / γ"
            description="DeviceOrientation leak"
          />
          <HardwareStatCard
            title="GPU Estimate"
            primary={getRendererFingerprint()}
            secondary={`Threads: ${navigator.hardwareConcurrency ?? 'n/a'}`}
            description="Derived from Navigator & WebGL"
          />
        </div>
      </div>
    </LabShell>
  );
}

function HardwareStatCard({ title, primary, secondary, description }: { title: string; primary: string; secondary: string; description: string }) {
  return (
    <div className="lab-panel p-5">
      <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">{title}</p>
      <p className="mt-4 text-2xl text-cyan-200">{primary}</p>
      <p className="text-sm text-slate-400">{secondary}</p>
      <p className="mt-4 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function getRendererFingerprint() {
  if (typeof navigator === 'undefined') {
    return 'Unknown';
  }

  const ua = navigator.userAgent;
  const bracket = ua.split('(')[1]?.split(')')[0];
  return bracket || ua.slice(0, 24);
}
