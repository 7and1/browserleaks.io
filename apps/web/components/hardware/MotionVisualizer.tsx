'use client';

interface MotionVisualizerProps {
  rotation: {
    alpha: number;
    beta: number;
    gamma: number;
  };
}

export function MotionVisualizer({ rotation }: MotionVisualizerProps) {
  const style = {
    transform: `rotateX(${rotation.beta.toFixed(1)}deg) rotateY(${rotation.gamma.toFixed(1)}deg) rotateZ(${rotation.alpha.toFixed(1)}deg)`,
  };

  return (
    <div className="lab-panel p-6">
      <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">Motion Visualizer</div>
      <div className="mt-6 flex flex-col items-center gap-4" style={{ perspective: '900px' }}>
        <div className="relative h-56 w-32 origin-center rounded-md border border-cyan-400/30 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lab-glow-cyan transition-transform duration-200" style={style}>
          <div className="absolute inset-3 rounded-sm border border-slate-700/80"></div>
          <div className="absolute bottom-4 left-1/2 h-8 w-12 -translate-x-1/2 rounded-full bg-slate-800/80" />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-slate-400">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em]">Alpha</p>
            <p className="text-cyan-300">{rotation.alpha.toFixed(1)}°</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em]">Beta</p>
            <p className="text-cyan-300">{rotation.beta.toFixed(1)}°</p>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em]">Gamma</p>
            <p className="text-cyan-300">{rotation.gamma.toFixed(1)}°</p>
          </div>
        </div>
      </div>
    </div>
  );
}
