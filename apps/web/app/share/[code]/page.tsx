'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';

interface SharedScan {
  scan: {
    id: string;
    timestamp: string;
    privacyScore: {
      total: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      breakdown: {
        ipPrivacy: number;
        dnsPrivacy: number;
        webrtcPrivacy: number;
        fingerprintResistance: number;
        browserConfig: number;
      };
    };
    fingerprint?: {
      combinedHash: string;
      uniquenessScore: number;
    };
    ip?: {
      address: string;
      country?: string;
      city?: string;
      privacy?: {
        isVpn?: boolean;
        isProxy?: boolean;
        isTor?: boolean;
      };
    };
    dns?: {
      isLeak: boolean;
      leakType: string;
    };
    webrtc?: {
      isLeak: boolean;
    };
    recommendations?: string[];
    shared?: {
      createdAt: string;
      isShared: boolean;
    };
  };
  createdAt: string;
  viewCount: number;
  remainingViews: number | null;
  expiresAt: string | null;
}

export default function SharePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<SharedScan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        // In production, this would fetch from the API
        // For now, create mock data
        const mockData: SharedScan = {
          scan: {
            id: `scan_${code}`,
            timestamp: new Date().toISOString(),
            privacyScore: {
              total: 65,
              riskLevel: 'medium',
              breakdown: {
                ipPrivacy: 15,
                dnsPrivacy: 12,
                webrtcPrivacy: 10,
                fingerprintResistance: 18,
                browserConfig: 10,
              },
            },
            fingerprint: {
              combinedHash: 'abc123def456',
              uniquenessScore: 0.78,
            },
            ip: {
              address: '192.168.*.*',
              country: 'United States',
              city: 'New York',
              privacy: {
                isVpn: true,
                isProxy: false,
                isTor: false,
              },
            },
            dns: {
              isLeak: false,
              leakType: 'none',
            },
            webrtc: {
              isLeak: false,
            },
            recommendations: [
              'Enable Do Not Track in browser settings',
              'Consider using a fingerprint protection extension',
              'Your privacy score is moderate - keep improving!',
            ],
            shared: {
              createdAt: new Date().toISOString(),
              isShared: true,
            },
          },
          createdAt: new Date().toISOString(),
          viewCount: 5,
          remainingViews: 95,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared scan');
      } finally {
        setLoading(false);
      }
    };

    fetchShare();
  }, [code]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskBgColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/20';
      case 'medium': return 'bg-yellow-500/20';
      case 'high': return 'bg-orange-500/20';
      case 'critical': return 'bg-red-500/20';
      default: return 'bg-slate-500/20';
    }
  };

  if (loading) {
    return (
      <LabShell statusReadings={[]} diagnosticsRunning={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading shared report...</p>
          </div>
        </div>
      </LabShell>
    );
  }

  if (error || !data) {
    return (
      <LabShell statusReadings={[]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl text-slate-200 mb-2">Report Not Found</h2>
            <p className="text-slate-400 mb-4">{error || 'This shared report may have expired or been deleted.'}</p>
            <Link
              href="/"
              className="inline-block px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors"
            >
              Run Your Own Scan
            </Link>
          </div>
        </div>
      </LabShell>
    );
  }

  const { scan } = data;

  return (
    <LabShell
      statusReadings={[
        {
          label: 'Score',
          value: scan.privacyScore.total.toString(),
          tone: scan.privacyScore.total >= 70 ? 'active' : scan.privacyScore.total >= 40 ? 'alert' : 'alert',
        },
        {
          label: 'Risk',
          value: scan.privacyScore.riskLevel.toUpperCase(),
          tone: scan.privacyScore.riskLevel === 'low' ? 'active' : 'alert',
        },
        {
          label: 'Views',
          value: data.viewCount.toString(),
          tone: 'neutral',
        },
      ]}
    >
      <div className="space-y-10">
        <header>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded">SHARED REPORT</span>
            {data.expiresAt && (
              <span className="text-xs text-slate-500">
                Expires {new Date(data.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-light text-slate-100">Privacy Scan Report</h1>
          <p className="mt-2 text-sm text-slate-400">
            Scanned on {new Date(scan.timestamp).toLocaleDateString()} at {new Date(scan.timestamp).toLocaleTimeString()}
          </p>
        </header>

        {/* Privacy Score Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Overall Privacy Score
            </p>
            <div className="flex items-center gap-6">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center ${getRiskBgColor(scan.privacyScore.riskLevel)}`}>
                <span className="text-5xl font-light text-slate-100">{scan.privacyScore.total}</span>
              </div>
              <div>
                <p className={`text-2xl font-light capitalize ${getRiskColor(scan.privacyScore.riskLevel)}`}>
                  {scan.privacyScore.riskLevel} Risk
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  {scan.privacyScore.total >= 80 && 'Excellent privacy protection'}
                  {scan.privacyScore.total >= 60 && scan.privacyScore.total < 80 && 'Good privacy with room for improvement'}
                  {scan.privacyScore.total >= 40 && scan.privacyScore.total < 60 && 'Privacy needs attention'}
                  {scan.privacyScore.total < 40 && 'Significant privacy concerns'}
                </p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Score Breakdown
            </p>
            <div className="space-y-3">
              <ScoreBar label="IP Privacy" value={scan.privacyScore.breakdown.ipPrivacy} max={20} />
              <ScoreBar label="DNS Privacy" value={scan.privacyScore.breakdown.dnsPrivacy} max={15} />
              <ScoreBar label="WebRTC Privacy" value={scan.privacyScore.breakdown.webrtcPrivacy} max={15} />
              <ScoreBar label="Fingerprint Resistance" value={scan.privacyScore.breakdown.fingerprintResistance} max={30} />
              <ScoreBar label="Browser Config" value={scan.privacyScore.breakdown.browserConfig} max={20} />
            </div>
          </div>
        </div>

        {/* Detection Results */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* IP */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              IP Detection
            </p>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">IP Address</span>
                <span className="font-mono text-cyan-200">{scan.ip?.address || 'Hidden'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Location</span>
                <span className="text-slate-200">{scan.ip?.city || 'Unknown'}, {scan.ip?.country || 'Unknown'}</span>
              </div>
              <div className="flex gap-2 mt-4">
                {scan.ip?.privacy?.isVpn && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">VPN</span>
                )}
                {scan.ip?.privacy?.isProxy && (
                  <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">Proxy</span>
                )}
                {scan.ip?.privacy?.isTor && (
                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded">Tor</span>
                )}
              </div>
            </div>
          </div>

          {/* DNS */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              DNS Leak Test
            </p>
            <div className="text-center py-4">
              {scan.dns?.isLeak ? (
                <>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-400 font-medium">DNS Leak Detected</p>
                  <p className="text-xs text-slate-500 mt-1">Type: {scan.dns.leakType}</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-green-400 font-medium">No DNS Leak</p>
                  <p className="text-xs text-slate-500 mt-1">DNS queries are protected</p>
                </>
              )}
            </div>
          </div>

          {/* WebRTC */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              WebRTC Leak Test
            </p>
            <div className="text-center py-4">
              {scan.webrtc?.isLeak ? (
                <>
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-red-400 font-medium">WebRTC Leak Detected</p>
                  <p className="text-xs text-slate-500 mt-1">Real IP may be exposed</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">✓</span>
                  </div>
                  <p className="text-green-400 font-medium">No WebRTC Leak</p>
                  <p className="text-xs text-slate-500 mt-1">WebRTC is secure</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Fingerprint */}
        {scan.fingerprint && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Browser Fingerprint
            </p>
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm text-slate-400 mb-2">Fingerprint Hash</p>
                <p className="font-mono text-cyan-200 bg-slate-800/50 p-3 rounded break-all">
                  {scan.fingerprint.combinedHash}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-2">Uniqueness Score</p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-4 bg-slate-700 rounded overflow-hidden">
                    <div
                      className={`h-full ${scan.fingerprint.uniquenessScore > 0.8 ? 'bg-red-500' : scan.fingerprint.uniquenessScore > 0.5 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      style={{ width: `${scan.fingerprint.uniquenessScore * 100}%` }}
                    />
                  </div>
                  <span className="text-xl font-mono text-cyan-300">
                    {Math.round(scan.fingerprint.uniquenessScore * 100)}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {scan.fingerprint.uniquenessScore > 0.8 && 'Highly unique - easily trackable'}
                  {scan.fingerprint.uniquenessScore > 0.5 && scan.fingerprint.uniquenessScore <= 0.8 && 'Moderately unique - somewhat trackable'}
                  {scan.fingerprint.uniquenessScore <= 0.5 && 'Low uniqueness - good for privacy'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {scan.recommendations && scan.recommendations.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Recommendations
            </p>
            <ul className="space-y-3">
              {scan.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs">{i + 1}</span>
                  </span>
                  <span className="text-slate-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <div className="lab-panel p-8 text-center">
          <h2 className="text-2xl font-light text-slate-100 mb-4">
            Want to check your own privacy?
          </h2>
          <p className="text-slate-400 mb-6">
            Run a free privacy scan to see how your browser compares.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors"
          >
            Start Your Free Scan
          </Link>
        </div>
      </div>
    </LabShell>
  );
}

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.round((value / max) * 100);
  const color = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}/{max}</span>
      </div>
      <div className="h-2 bg-slate-700 rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
