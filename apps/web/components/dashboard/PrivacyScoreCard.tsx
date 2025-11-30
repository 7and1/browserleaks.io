'use client';

interface PrivacyScore {
  totalScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    ipPrivacy: number;
    dnsPrivacy: number;
    webrtcPrivacy: number;
    fingerprintResistance: number;
    browserConfig: number;
  };
  vulnerabilities: Array<{
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    recommendation: string;
  }>;
}

interface PrivacyScoreCardProps {
  score: PrivacyScore | null;
  loading?: boolean;
}

const riskStyles: Record<PrivacyScore['riskLevel'], string> = {
  low: 'text-cyan-300',
  medium: 'text-yellow-300',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

export function PrivacyScoreCard({ score, loading }: PrivacyScoreCardProps) {
  if (loading) {
    return (
      <div className="specimen-container animate-pulse bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60 bg-[length:400%_400%] p-8">
        <div className="h-32 w-full animate-shimmer rounded-sm bg-slate-800/80" />
      </div>
    );
  }

  if (!score) {
    return (
      <div className="specimen-container p-8 text-center text-slate-400">
        No data yet. Run a scan to get your privacy score.
      </div>
    );
  }

  const breakdown = [
    { label: 'IP Privacy', score: score.breakdown.ipPrivacy, max: 20 },
    { label: 'DNS Privacy', score: score.breakdown.dnsPrivacy, max: 15 },
    { label: 'WebRTC Privacy', score: score.breakdown.webrtcPrivacy, max: 15 },
    { label: 'Fingerprint Resistance', score: score.breakdown.fingerprintResistance, max: 30 },
    { label: 'Browser Config', score: score.breakdown.browserConfig, max: 20 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
      <div className="specimen-container p-8 text-center shadow-lab-glow-cyan">
        <div className="text-[0.65rem] uppercase tracking-[0.8em] text-slate-500">
          Privacy Score
        </div>
        <div className={`mt-6 text-8xl font-bold decrypted-text ${riskStyles[score.riskLevel]}`}>
          {score.totalScore.toString().padStart(2, '0')}
        </div>
        <div className="mt-2 text-sm uppercase tracking-[0.5em] text-slate-500">/100 INDEX</div>
        <div className="mt-6 inline-flex items-center gap-3 rounded-sm border border-slate-700/80 px-5 py-2 text-xs uppercase tracking-[0.4em] text-slate-200">
          <span>RISK</span>
          <span className={riskStyles[score.riskLevel]}>{score.riskLevel}</span>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-4 text-left text-xs text-slate-400">
          <div>
            <p className="uppercase tracking-[0.4em] text-[0.6rem]">Leaks</p>
            <p className="text-lg text-orange-400">{score.vulnerabilities.length}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.4em] text-[0.6rem]">Integrity</p>
            <p className="text-lg text-cyan-300">
              {Math.max(0, 100 - score.totalScore)}%
            </p>
          </div>
          <div>
            <p className="uppercase tracking-[0.4em] text-[0.6rem]">Entropy</p>
            <p className="text-lg text-slate-200">{score.breakdown.fingerprintResistance}</p>
          </div>
        </div>
      </div>
      <div className="lab-panel p-6">
        <div className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">
          Summary
        </div>
        <div className="mt-4 space-y-4">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{item.label}</span>
                <span className="font-mono text-slate-200">
                  {item.score}/{item.max}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-none bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300"
                  style={{ width: `${Math.min(100, (item.score / item.max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {score.vulnerabilities.length > 0 && (
          <div className="mt-6 rounded-sm border border-orange-500/40 bg-orange-500/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-orange-300">
              Vulnerabilities
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {score.vulnerabilities.slice(0, 2).map((vuln) => (
                <li key={vuln.title} className="text-orange-200">
                  <span className="font-semibold">{vuln.title}</span>
                  <span className="ml-2 text-xs text-orange-300/80">{vuln.recommendation}</span>
                </li>
              ))}
              {score.vulnerabilities.length > 2 && (
                <li className="text-[0.7rem] text-orange-300/70">
                  +{score.vulnerabilities.length - 2} more findings
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
