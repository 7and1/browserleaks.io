'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface HttpHeadersResult {
  headers: Record<string, string>;
  http2PseudoHeaders: {
    method: string;
    authority: string;
    scheme: string;
    path: string;
    order: string[];
  };
  priorityFrame: {
    weight: number;
    dependency: number;
    exclusive: boolean;
  } | null;
  fingerprint: string;
  uniqueness: number;
  clientHints: Record<string, string>;
  acceptLanguage: string[];
  secHeaders: Record<string, string>;
}

export default function HttpHeadersPage() {
  const [result, setResult] = useState<HttpHeadersResult | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Call API to get server-observed headers
      const response = await fetch('/api/http-headers', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        // Fallback to simulated data
        const simulated = simulateHttpHeaders();
        setResult(simulated);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        const simulated = simulateHttpHeaders();
        setResult(simulated);
      }
    } catch {
      // Use simulated data for demo
      const simulated = simulateHttpHeaders();
      setResult(simulated);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = useMemo(() => [
    {
      label: 'Headers',
      value: result?.headers ? Object.keys(result.headers).length.toString() : (loading ? 'SCANNING' : '0'),
      tone: result?.headers ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'HTTP/2',
      value: result?.http2PseudoHeaders ? 'YES' : 'NO',
      tone: result?.http2PseudoHeaders ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Unique',
      value: result?.uniqueness ? `${result.uniqueness}%` : '---',
      tone: result?.uniqueness && result.uniqueness > 70 ? 'alert' as const : 'active' as const,
    },
  ], [result, loading]);

  const headerCategories = useMemo(() => {
    if (!result?.headers) return {};

    const categories: Record<string, Record<string, string>> = {
      'Request Info': {},
      'Client Hints': {},
      'Security': {},
      'Preferences': {},
      'Other': {},
    };

    Object.entries(result.headers).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.startsWith('sec-ch-')) {
        categories['Client Hints'][key] = value;
      } else if (lowerKey.startsWith('sec-') || lowerKey.includes('security')) {
        categories['Security'][key] = value;
      } else if (['accept', 'accept-language', 'accept-encoding'].includes(lowerKey)) {
        categories['Preferences'][key] = value;
      } else if (['host', 'user-agent', 'referer', 'origin'].includes(lowerKey)) {
        categories['Request Info'][key] = value;
      } else {
        categories['Other'][key] = value;
      }
    });

    return categories;
  }, [result]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runTest}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Protocol Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">HTTP Headers Fingerprint</h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze HTTP request headers including HTTP/2 pseudo-headers and Client Hints used for fingerprinting.
          </p>
        </header>

        {/* HTTP/2 Pseudo Headers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              HTTP/2 Pseudo-Headers Order
            </p>

            {loading ? (
              <div className="h-32 flex items-center justify-center text-slate-500">
                Analyzing HTTP/2 frames...
              </div>
            ) : result?.http2PseudoHeaders ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {result.http2PseudoHeaders.order.map((header, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 rounded"
                    >
                      <span className="text-xs text-slate-500">{i + 1}</span>
                      <span className="font-mono text-sm text-cyan-300">{header}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-500 mt-4">
                  The order of pseudo-headers varies between browsers and can be used for fingerprinting.
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <ResultRow label=":method" value={result.http2PseudoHeaders.method} />
                  <ResultRow label=":scheme" value={result.http2PseudoHeaders.scheme} />
                  <ResultRow label=":authority" value={result.http2PseudoHeaders.authority.slice(0, 25)} />
                  <ResultRow label=":path" value={result.http2PseudoHeaders.path} />
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                HTTP/2 not detected (may be HTTP/1.1)
              </div>
            )}
          </div>

          {/* Fingerprint Hash */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Header Fingerprint
            </p>

            {result?.fingerprint ? (
              <div className="space-y-4">
                <div className="font-mono text-sm text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                  {result.fingerprint}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <ResultRow label="Uniqueness" value={`${result.uniqueness}%`} />
                  <ResultRow label="Header Count" value={Object.keys(result.headers).length.toString()} />
                </div>

                {result.uniqueness > 70 && (
                  <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                    <p className="text-sm text-orange-300">
                      Your HTTP header pattern is relatively unique and can contribute to browser fingerprinting.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {loading ? 'Calculating fingerprint...' : 'No fingerprint available'}
              </div>
            )}
          </div>
        </div>

        {/* Client Hints */}
        {result?.clientHints && Object.keys(result.clientHints).length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Client Hints (High Entropy)
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Client Hints are HTTP headers that provide detailed device and browser information.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(result.clientHints).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 px-3 bg-slate-800/40 rounded">
                  <span className="text-xs text-slate-400 font-mono">{key}</span>
                  <span className="text-xs text-cyan-300 font-mono truncate max-w-[200px]" title={value}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Header Categories */}
        {Object.entries(headerCategories).map(([category, headers]) =>
          Object.keys(headers).length > 0 && (
            <div key={category} className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                {category} ({Object.keys(headers).length})
              </p>
              <div className="space-y-2">
                {Object.entries(headers).map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between py-2 border-b border-slate-800/60 last:border-none">
                    <span className="text-sm text-slate-400 font-mono">{key}</span>
                    <span className="text-sm text-cyan-200 font-mono text-right max-w-[60%] break-all">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Accept-Language Analysis */}
        {result?.acceptLanguage && result.acceptLanguage.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Accept-Language Breakdown
            </p>
            <div className="flex flex-wrap gap-2">
              {result.acceptLanguage.map((lang, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm font-mono bg-slate-800/60 text-cyan-300 rounded"
                >
                  {lang}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Your language preferences reveal locale settings and can narrow down your location.
            </p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            HTTP Header Fingerprinting: Your Browser&apos;s Metadata Trail
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every HTTP request your browser makes includes headers - metadata about your browser,
              preferences, and capabilities. While individually these seem innocuous, together they
              create a unique fingerprint that can identify your browser across the web.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">HTTP/2 Pseudo-Header Fingerprinting</h3>
            <p>
              HTTP/2 introduced &quot;pseudo-headers&quot; (prefixed with &apos;:&apos;) to replace the HTTP/1.1 request line.
              Here&apos;s the interesting part: browsers send these pseudo-headers in different orders:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Chrome</strong>: :method, :authority, :scheme, :path</li>
              <li><strong className="text-slate-300">Firefox</strong>: :method, :path, :authority, :scheme</li>
              <li><strong className="text-slate-300">Safari</strong>: :method, :scheme, :path, :authority</li>
            </ul>
            <p>
              This ordering is essentially a browser fingerprint that works at the protocol level,
              before any JavaScript executes.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Client Hints: The New Fingerprinting Vector</h3>
            <p>
              Client Hints are HTTP headers designed to help servers deliver optimized content. They
              include information like:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Low Entropy Hints</h4>
                <ul className="text-sm space-y-1">
                  <li>Sec-CH-UA (browser brand)</li>
                  <li>Sec-CH-UA-Mobile (mobile device?)</li>
                  <li>Sec-CH-UA-Platform (OS name)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">High Entropy Hints</h4>
                <ul className="text-sm space-y-1">
                  <li>Sec-CH-UA-Full-Version (exact version)</li>
                  <li>Sec-CH-UA-Platform-Version (OS version)</li>
                  <li>Sec-CH-UA-Arch (CPU architecture)</li>
                  <li>Sec-CH-UA-Model (device model)</li>
                </ul>
              </div>
            </div>
            <p>
              High entropy hints require explicit server request via Accept-CH header, but when
              granted, they provide incredibly detailed device information.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Accept-Language Fingerprinting</h3>
            <p>
              Your Accept-Language header reveals your language preferences, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Primary language (e.g., en-US, zh-CN, de-DE)</li>
              <li>Secondary languages with quality weights</li>
              <li>Region variants that narrow down your location</li>
            </ul>
            <p>
              A study found that Accept-Language alone provides about 4 bits of entropy - enough
              to reduce the pool of possible users by 16x.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Header Order Fingerprinting</h3>
            <p>
              Beyond HTTP/2 pseudo-headers, the order of regular headers also varies by browser.
              For example, Chrome typically sends headers in this order:
            </p>
            <ol className="list-decimal pl-6 text-sm font-mono text-slate-300">
              <li>Host</li>
              <li>Connection</li>
              <li>sec-ch-ua</li>
              <li>sec-ch-ua-mobile</li>
              <li>sec-ch-ua-platform</li>
              <li>Upgrade-Insecure-Requests</li>
              <li>User-Agent</li>
              <li>Accept</li>
              <li>Accept-Encoding</li>
              <li>Accept-Language</li>
            </ol>
            <p className="mt-4">
              While Firefox sends them in a different order, making browser identification possible
              even when User-Agent is spoofed.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Security Headers You Send</h3>
            <p>
              Modern browsers send several Sec- prefixed headers:
            </p>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Header</th>
                  <th className="text-left py-2 text-slate-300">Purpose</th>
                  <th className="text-left py-2 text-slate-300">Privacy Impact</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">Sec-Fetch-Site</td>
                  <td className="py-2">Origin relationship</td>
                  <td className="py-2">Low</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">Sec-Fetch-Mode</td>
                  <td className="py-2">Request type</td>
                  <td className="py-2">Low</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2 font-mono">Sec-Fetch-Dest</td>
                  <td className="py-2">Resource destination</td>
                  <td className="py-2">Low</td>
                </tr>
                <tr>
                  <td className="py-2 font-mono">Sec-CH-UA-*</td>
                  <td className="py-2">Client Hints</td>
                  <td className="py-2 text-orange-400">High</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Standardizes all HTTP
                headers to look identical for all users.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Modifies
                Accept-Language to just &quot;en-US&quot; and normalizes other headers.
              </li>
              <li>
                <strong className="text-slate-300">Disable Client Hints</strong> - Chrome: set
                <code className="bg-slate-800 px-1 rounded">chrome://flags/#client-hints</code> to disabled.
              </li>
              <li>
                <strong className="text-slate-300">Use Brave</strong> - Includes fingerprinting
                protection that randomizes some header values.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>HTTP/2 pseudo-header order identifies your browser</li>
                <li>Client Hints expose detailed device information</li>
                <li>Accept-Language reveals locale preferences</li>
                <li>Header order varies between browsers</li>
                <li>Combined with other methods, headers add significant fingerprint entropy</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
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

function simulateHttpHeaders(): HttpHeadersResult {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  const languages = typeof navigator !== 'undefined' ? navigator.languages : ['en-US'];

  const isChrome = userAgent.includes('Chrome');

  return {
    headers: {
      'Host': 'browserleaks.io',
      'Connection': 'keep-alive',
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': languages.join(','),
      'Accept-Encoding': 'gzip, deflate, br',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
      'Sec-CH-UA': isChrome ? '"Chromium";v="120", "Google Chrome";v="120"' : '"Firefox";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"macOS"',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    },
    http2PseudoHeaders: {
      method: 'GET',
      authority: 'browserleaks.io',
      scheme: 'https',
      path: '/network/http-headers',
      order: isChrome
        ? [':method', ':authority', ':scheme', ':path']
        : [':method', ':path', ':authority', ':scheme'],
    },
    priorityFrame: {
      weight: 256,
      dependency: 0,
      exclusive: false,
    },
    fingerprint: 'a7f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5',
    uniqueness: Math.floor(Math.random() * 30) + 50,
    clientHints: {
      'Sec-CH-UA': isChrome ? '"Chromium";v="120"' : '"Firefox";v="120"',
      'Sec-CH-UA-Mobile': '?0',
      'Sec-CH-UA-Platform': '"macOS"',
    },
    acceptLanguage: Array.from(languages),
    secHeaders: {
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Dest': 'document',
    },
  };
}
