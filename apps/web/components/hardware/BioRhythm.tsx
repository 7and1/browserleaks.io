'use client';

interface BioRhythmProps {
  samples: number[];
  height?: number;
}

export function BioRhythm({ samples, height = 160 }: BioRhythmProps) {
  if (!samples.length) {
    return <div className="lab-panel flex h-40 items-center justify-center text-sm text-slate-500">Waiting for sensor data…</div>;
  }

  const width = 420;
  const step = samples.length > 1 ? width / (samples.length - 1) : width;
  const mid = height / 2;
  const path = samples
    .map((value, index) => {
      const x = index * step;
      const y = mid - value * (height / 3);
      return `${index === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <div className="lab-panel overflow-hidden p-4">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Bio-Rhythm</div>
      <svg width={width} height={height} className="mt-2">
        <defs>
          <linearGradient id="bio-wave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <path d={path} stroke="#22d3ee" strokeWidth={2} fill="none" />
        <path d={`${path} L ${width} ${height} L 0 ${height} Z`} fill="url(#bio-wave)" opacity={0.4} />
      </svg>
    </div>
  );
}
