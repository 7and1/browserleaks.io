'use client';

import { useMemo } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

interface ExposureRadarProps {
  metrics: Array<{ label: string; value: number }>;
}

export function ExposureRadar({ metrics }: ExposureRadarProps) {
  const chartData = useMemo(() => {
    const labels = metrics.map((metric) => metric.label);
    const data = metrics.map((metric) => metric.value);

    return {
      labels,
      datasets: [
        {
          label: 'Exposure',
          data,
          backgroundColor: 'rgba(249,115,22,0.25)',
          borderColor: '#f97316',
          borderWidth: 2,
          pointBackgroundColor: '#22d3ee',
          pointBorderColor: '#0f172a',
        },
      ],
    };
  }, [metrics]);

  return (
    <div className="lab-panel relative overflow-hidden p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Exposure Radar</div>
      <div className="mt-2 text-xs text-slate-400">WebRTC, DNS, Canvas, Audio, Battery, APIs</div>
      <div className="scanline mt-4 h-[280px]">
        <Radar
          data={chartData}
          options={{
            scales: {
              r: {
                grid: {
                  color: 'rgba(94, 234, 212, 0.2)',
                },
                ticks: {
                  display: false,
                },
                suggestedMin: 0,
                suggestedMax: 100,
                angleLines: {
                  color: 'rgba(94, 234, 212, 0.2)',
                },
                pointLabels: {
                  color: '#94a3b8',
                  font: {
                    size: 10,
                  },
                },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => `${ctx.formattedValue}% exposure`,
                },
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
}
