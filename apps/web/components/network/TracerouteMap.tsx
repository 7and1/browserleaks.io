'use client';

import type { TracerouteHop } from '@/types/network';

interface TracerouteMapProps {
  hops: TracerouteHop[];
}

export function TracerouteMap({ hops }: TracerouteMapProps) {
  const width = 520;
  const height = 240;
  const step = hops.length > 1 ? width / (hops.length - 1) : width;

  return (
    <div className="lab-panel p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Traceroute</div>
      <svg width={width} height={height} className="mt-4">
        <defs>
          <linearGradient id="hop-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {hops.map((hop, index) => {
          if (index === hops.length - 1) return null;
          const x1 = index * step;
          const x2 = (index + 1) * step;
          const y1 = height / 2 + Math.sin(index) * 25;
          const y2 = height / 2 + Math.sin(index + 1) * 25;
          return <line key={hop.ip} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#hop-line)" strokeWidth={2} strokeLinecap="round" />;
        })}
        {hops.map((hop, index) => {
          const x = index * step;
          const y = height / 2 + Math.sin(index) * 25;
          return (
            <g key={`${hop.ip}-${index}`}>
              <circle cx={x} cy={y} r={9} fill="#0f172a" stroke="#22d3ee" strokeWidth={2} />
              <text x={x} y={y - 16} textAnchor="middle" className="text-[10px] fill-slate-300 font-mono">
                {hop.ip}
              </text>
              <text x={x} y={y + 20} textAnchor="middle" className="text-[10px] fill-slate-500">
                {hop.location}
              </text>
              <text x={x} y={y + 34} textAnchor="middle" className="text-[9px] fill-cyan-300">
                {hop.rtt} ms
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
