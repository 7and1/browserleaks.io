'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';
import { useHistoryStore, type HistoryEntry } from '@/stores';

interface LocalComparisonResult {
  entries: Array<{
    id: string;
    timestamp: number;
    privacyScore: number;
    riskLevel: string;
  }>;
  changes: string[];
  trends: {
    privacyScore: {
      direction: 'improved' | 'declined' | 'stable';
      change: number;
      firstScore: number;
      lastScore: number;
    };
  };
}

export default function HistoryPage() {
  const { entries, removeEntry, clearHistory } = useHistoryStore();
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [comparison, setComparison] = useState<LocalComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectEntry = useCallback((entryId: string) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      }
      if (prev.length >= 5) {
        return prev;
      }
      return [...prev, entryId];
    });
  }, []);

  const handleCompare = useCallback(async () => {
    if (selectedEntries.length < 2) return;

    setLoading(true);
    try {
      const selectedData = entries.filter(e => selectedEntries.includes(e.id));

      const sortedEntries = [...selectedData].sort(
        (a, b) => a.timestamp - b.timestamp
      );

      const changes: string[] = [];
      const first = sortedEntries[0];
      const last = sortedEntries[sortedEntries.length - 1];

      if (first && last) {
        const scoreDiff = last.privacyScore.totalScore - first.privacyScore.totalScore;

        if (scoreDiff > 5) {
          changes.push(`Privacy score improved by ${scoreDiff} points`);
        } else if (scoreDiff < -5) {
          changes.push(`Privacy score declined by ${Math.abs(scoreDiff)} points`);
        }

        if (first.metadata?.ip !== last.metadata?.ip) {
          changes.push(`IP changed from ${first.metadata?.ip || 'unknown'} to ${last.metadata?.ip || 'unknown'}`);
        }
      }

      setComparison({
        entries: sortedEntries.map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          privacyScore: e.privacyScore.totalScore,
          riskLevel: e.privacyScore.riskLevel,
        })),
        changes,
        trends: {
          privacyScore: {
            direction: first && last ? (
              last.privacyScore.totalScore > first.privacyScore.totalScore ? 'improved' :
              last.privacyScore.totalScore < first.privacyScore.totalScore ? 'declined' : 'stable'
            ) : 'stable',
            change: first && last ? last.privacyScore.totalScore - first.privacyScore.totalScore : 0,
            firstScore: first?.privacyScore.totalScore || 0,
            lastScore: last?.privacyScore.totalScore || 0,
          },
        },
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEntries, entries]);

  const clearComparison = useCallback(() => {
    setComparison(null);
    setSelectedEntries([]);
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const statusReadings = [
    {
      label: 'Total Scans',
      value: entries.length.toString(),
      tone: 'active' as const,
    },
    {
      label: 'Selected',
      value: `${selectedEntries.length}/5`,
      tone: selectedEntries.length > 0 ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Last Scan',
      value: entries[0] ? new Date(entries[0].timestamp).toLocaleDateString() : '---',
      tone: 'neutral' as const,
    },
  ];

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Privacy Dashboard</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Scan History</h1>
          <p className="mt-2 text-sm text-slate-400">
            Track your privacy posture over time and compare scans to identify changes.
          </p>
        </header>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleCompare}
            disabled={selectedEntries.length < 2 || loading}
            className="px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Compare Selected ({selectedEntries.length})
          </button>
          {comparison && (
            <button
              onClick={clearComparison}
              className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/50 border border-slate-600 rounded hover:bg-slate-700 transition-colors"
            >
              Clear Comparison
            </button>
          )}
          {entries.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to clear all history?')) {
                  clearHistory();
                }
              }}
              className="px-4 py-2 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/30 rounded hover:bg-red-500/20 transition-colors"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Comparison Result */}
        {comparison && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Comparison Result
            </p>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Trend */}
              <div className="space-y-4">
                <h3 className="text-lg text-slate-200">Privacy Score Trend</h3>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-light">
                    {comparison.trends.privacyScore.direction === 'improved' && (
                      <span className="text-green-400">↑</span>
                    )}
                    {comparison.trends.privacyScore.direction === 'declined' && (
                      <span className="text-red-400">↓</span>
                    )}
                    {comparison.trends.privacyScore.direction === 'stable' && (
                      <span className="text-slate-400">→</span>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-mono text-cyan-300">
                      {comparison.trends.privacyScore.firstScore} → {comparison.trends.privacyScore.lastScore}
                    </p>
                    <p className="text-sm text-slate-400">
                      {comparison.trends.privacyScore.change > 0 ? '+' : ''}
                      {comparison.trends.privacyScore.change} points
                    </p>
                  </div>
                </div>
              </div>

              {/* Changes */}
              <div className="space-y-4">
                <h3 className="text-lg text-slate-200">Detected Changes</h3>
                {comparison.changes.length > 0 ? (
                  <ul className="space-y-2">
                    {comparison.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-cyan-400 mt-1">•</span>
                        <span className="text-slate-300">{change}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No significant changes detected</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scan History */}
        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Scan History (Last 30 Days)
          </p>

          {entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  selected={selectedEntries.includes(entry.id)}
                  onSelect={() => handleSelectEntry(entry.id)}
                  onDelete={() => removeEntry(entry.id)}
                  getRiskColor={getRiskColor}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No scans yet</p>
              <Link
                href="/dashboard"
                className="inline-block px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 rounded hover:bg-cyan-500/20 transition-colors"
              >
                Run Your First Scan
              </Link>
            </div>
          )}
        </div>

        {/* Educational Content */}
        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-4">
            Why Track Your Privacy Over Time?
          </h2>
          <div className="prose prose-invert prose-sm max-w-none text-slate-400">
            <p>
              Your browser fingerprint and privacy posture can change over time as you install
              software, update browsers, or change network configurations. By tracking your
              scans over time, you can identify when changes occur and take corrective action.
            </p>
            <p className="mt-4">
              The comparison feature helps you understand how your privacy has improved or
              declined between scans. Look for patterns - did enabling a VPN improve your
              score? Did a browser update change your fingerprint uniqueness?
            </p>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

interface EntryCardProps {
  entry: HistoryEntry;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  getRiskColor: (level: string) => string;
}

function EntryCard({ entry, selected, onSelect, onDelete, getRiskColor }: EntryCardProps) {
  const date = new Date(entry.timestamp);
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`p-4 rounded border transition-colors ${
        selected
          ? 'bg-cyan-500/10 border-cyan-500/50'
          : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
          />
          <div>
            <p className="text-sm text-slate-300">
              {formattedDate} at {formattedTime}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {entry.metadata.browser} / {entry.metadata.os}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-2xl font-mono text-cyan-300">{entry.privacyScore.totalScore}</p>
            <p className={`text-xs uppercase ${getRiskColor(entry.privacyScore.riskLevel)}`}>
              {entry.privacyScore.riskLevel} risk
            </p>
          </div>

          <div className="flex gap-2">
            {entry.metadata?.ip && (
              <span className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded font-mono">
                {entry.metadata.ip}
              </span>
            )}
          </div>

          <button
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
            title="Delete scan"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-5 gap-4 text-center">
        <ScoreItem label="IP" value={entry.privacyScore.breakdown.ipPrivacy.score} max={20} />
        <ScoreItem label="DNS" value={entry.privacyScore.breakdown.dnsPrivacy.score} max={15} />
        <ScoreItem label="WebRTC" value={entry.privacyScore.breakdown.webrtcPrivacy.score} max={15} />
        <ScoreItem label="Fingerprint" value={entry.privacyScore.breakdown.fingerprintResistance.score} max={30} />
        <ScoreItem label="Browser" value={entry.privacyScore.breakdown.browserConfig.score} max={20} />
      </div>
    </div>
  );
}

function ScoreItem({ label, value, max }: { label: string; value: number; max: number }) {
  const percentage = Math.round((value / max) * 100);
  const color = percentage >= 70 ? 'bg-green-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <div className="h-1 bg-slate-700 rounded overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-xs text-slate-400 mt-1">{value}/{max}</p>
    </div>
  );
}
