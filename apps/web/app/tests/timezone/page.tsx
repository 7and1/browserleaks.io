'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface TimezoneResult {
  timezone: string;
  offset: number;
  offsetString: string;
  locale: string;
  languages: string[];
  dateFormat: string;
  timeFormat: string;
  hasDST: boolean;
  dstOffset: number;
}

function detectTimezone(): TimezoneResult {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);

  const janOffset = jan.getTimezoneOffset();
  const julOffset = jul.getTimezoneOffset();
  const currentOffset = now.getTimezoneOffset();

  const hasDST = janOffset !== julOffset;
  const standardOffset = Math.max(janOffset, julOffset);

  const formatOffset = (offset: number): string => {
    const sign = offset <= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  let timezone = '';
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    timezone = 'Unknown';
  }

  let locale = '';
  try {
    locale = Intl.DateTimeFormat().resolvedOptions().locale;
  } catch {
    locale = navigator.language || 'Unknown';
  }

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(now);
  const timeFormat = new Intl.DateTimeFormat(locale, { timeStyle: 'full' }).format(now);

  return {
    timezone,
    offset: currentOffset,
    offsetString: formatOffset(currentOffset),
    locale,
    languages: Array.from(navigator.languages || [navigator.language]),
    dateFormat,
    timeFormat,
    hasDST,
    dstOffset: hasDST ? standardOffset - currentOffset : 0,
  };
}

export default function TimezonePage() {
  const [result, setResult] = useState<TimezoneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const data = detectTimezone();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Timezone detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = [
    {
      label: 'Timezone',
      value: result?.timezone?.split('/')[1] || loading ? 'DETECTING' : '---',
      tone: result?.timezone ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Offset',
      value: result?.offsetString || '---',
      tone: result?.offset !== undefined ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'DST',
      value: result?.hasDST ? 'ACTIVE' : 'NONE',
      tone: result?.hasDST ? 'alert' as const : 'neutral' as const,
    },
  ];

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runTest}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Privacy Test</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Timezone Detection</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your timezone and locale settings can reveal your approximate location.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Timezone Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Timezone Information
            </p>

            <div className="space-y-4">
              <ResultRow label="Timezone" value={result?.timezone || '---'} />
              <ResultRow label="UTC Offset" value={result?.offsetString || '---'} />
              <ResultRow label="Offset (minutes)" value={result?.offset?.toString() || '---'} />
              <ResultRow label="DST Active" value={result?.hasDST ? 'Yes' : 'No'} />
              {result?.hasDST && (
                <ResultRow label="DST Offset" value={`${result.dstOffset} minutes`} />
              )}
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
              <p className="text-sm text-cyan-300">
                Your timezone ({result?.timezone}) can narrow your location to a specific region.
              </p>
            </div>
          </div>

          {/* Locale Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Locale Information
            </p>

            <div className="space-y-4">
              <ResultRow label="Locale" value={result?.locale || '---'} />
              <ResultRow label="Languages" value={result?.languages?.join(', ') || '---'} />
            </div>

            {result?.dateFormat && (
              <div className="mt-6 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Date Format</p>
                  <p className="text-sm font-mono text-cyan-200">{result.dateFormat}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Time Format</p>
                  <p className="text-sm font-mono text-cyan-200">{result.timeFormat}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Clock */}
        <div className="lab-panel p-6 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Current Time (Your Timezone)
          </p>
          <LiveClock timezone={result?.timezone} />
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Educational Content */}
        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Timezone Fingerprinting: Your Clock Reveals Your Location
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              You&apos;re connected through a VPN in Switzerland. Your IP says Zurich. But your
              browser just told that website you&apos;re actually in California. How? Your timezone.
              It&apos;s one of the most overlooked privacy leaks on the web.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Timezone-VPN Mismatch Problem</h3>
            <p>
              Here&apos;s the scenario that burns VPN users every day:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You connect to a VPN server in London (GMT+0)</li>
              <li>Your IP address now appears to be from the UK</li>
              <li>But your computer&apos;s clock is set to EST (GMT-5)</li>
              <li>JavaScript reports your timezone as &quot;America/New_York&quot;</li>
              <li>Website detects the mismatch: IP says UK, timezone says US East Coast</li>
              <li>Conclusion: probable VPN user, flag for additional scrutiny</li>
            </ul>
            <p>
              Streaming services, banks, and anti-fraud systems actively look for this discrepancy.
              It&apos;s one of the primary methods Netflix uses to detect and block VPN users.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What JavaScript Reveals</h3>
            <p>
              The Intl API and Date object expose extensive timezone information:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Direct Timezone Data</h4>
                <ul className="text-sm space-y-1">
                  <li>• IANA timezone name (e.g., &quot;America/Los_Angeles&quot;)</li>
                  <li>• UTC offset (e.g., -480 minutes)</li>
                  <li>• Daylight Saving Time status</li>
                  <li>• Historical DST transitions</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Locale Information</h4>
                <ul className="text-sm space-y-1">
                  <li>• Date format (MM/DD vs DD/MM)</li>
                  <li>• Time format (12h vs 24h)</li>
                  <li>• First day of week</li>
                  <li>• Number formatting (1,000 vs 1.000)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">DST: The Time-Based Fingerprint</h3>
            <p>
              Daylight Saving Time creates another tracking vector. Different regions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Switch on different dates (US: March/November, EU: late March/October)</li>
              <li>Some don&apos;t observe DST at all (Arizona, Hawaii, most of Asia)</li>
              <li>Historical DST rules varied by country and even by year</li>
            </ul>
            <p>
              By checking how your browser handles DST transitions, trackers can narrow down
              your likely location even further. A user in Phoenix (no DST) behaves differently
              than one in Denver (observes DST), even though both might be in the same timezone
              during winter.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The 38 Timezone Zones</h3>
            <p>
              The world is divided into approximately 38 unique timezone offsets, but IANA
              maintains about <strong className="text-slate-300">400+ timezone identifiers</strong> to account
              for historical and regional variations. This granularity is powerful for tracking:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>&quot;America/New_York&quot; vs &quot;America/Detroit&quot; - both EST, different histories</li>
              <li>&quot;Asia/Kolkata&quot; is the only timezone at UTC+5:30</li>
              <li>&quot;Asia/Kathmandu&quot; is unique at UTC+5:45</li>
              <li>&quot;Pacific/Chatham&quot; uses UTC+12:45, serving only ~600 people</li>
            </ul>
            <p>
              If your timezone is &quot;Asia/Kathmandu&quot;, that alone narrows you down to Nepal&apos;s
              ~30 million people - before any other fingerprinting even begins.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Language-Timezone Correlation</h3>
            <p>
              Trackers cross-reference timezone with browser language settings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Timezone: America/Los_Angeles + Language: zh-CN = Likely Chinese expat in California</li>
              <li>Timezone: Europe/London + Language: de-DE = German working in UK</li>
              <li>Timezone: Asia/Tokyo + Language: en-US = Likely US military/contractor</li>
            </ul>
            <p>
              These correlations create demographic profiles that are valuable for advertising
              targeting and can reveal sensitive information about nationality and immigration status.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Match your timezone to your VPN</strong> - If
                connecting to a UK server, change your system timezone to GMT.
              </li>
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Reports UTC (GMT+0) for
                all users regardless of actual timezone.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Forces
                timezone to UTC, eliminating location leakage.
              </li>
              <li>
                <strong className="text-slate-300">Browser extensions</strong> - Some extensions
                can spoof timezone values, though effectiveness varies.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Practical Reality</h3>
            <p>
              For casual privacy, timezone leaks often don&apos;t matter much - revealing you&apos;re in
              Eastern Time isn&apos;t catastrophic. But for users in sensitive situations - journalists,
              activists, people evading regional restrictions - timezone mismatches can expose them.
            </p>
            <p>
              The key insight: <strong className="text-slate-300">your timezone is independent of your IP</strong>.
              VPNs don&apos;t change it. Only manual configuration or browser-level protection does.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Timezone Privacy Facts</h4>
              <ul className="text-sm space-y-2">
                <li>• 400+ unique IANA timezone identifiers exist</li>
                <li>• VPNs do NOT change your reported timezone</li>
                <li>• Timezone-IP mismatch is a primary VPN detection method</li>
                <li>• DST behavior adds another layer of location fingerprinting</li>
                <li>• Combined with language, creates detailed demographic profiles</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function LiveClock({ timezone }: { timezone?: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: timezone,
        };
        setTime(new Intl.DateTimeFormat('en-US', options).format(now));
      } catch {
        setTime(new Date().toLocaleTimeString());
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <p className="text-5xl font-mono text-cyan-300 tracking-wider">{time || '--:--:--'}</p>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-none">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-mono text-sm text-cyan-200">{value}</span>
    </div>
  );
}
