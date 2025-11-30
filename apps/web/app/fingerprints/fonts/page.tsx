'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';
import { FontFingerprint, type FontFingerprintResult } from '@/lib/fingerprint/fonts';
import {
  Type,
  Shield,
  AlertTriangle,
  Eye,
  Monitor,
  Layers,
  Lock,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
  Search,
  FileText,
} from 'lucide-react';

export default function FontFingerprintPage() {
  const [result, setResult] = useState<FontFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new FontFingerprint();
      const data = await detector.detect();
      setResult(data);
      detector.cleanup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Font detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const filteredFonts = result?.availableFonts.filter((font) => font.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const entropyBits = result?.fontCount ? Math.log2(result.fontCount) + Math.log2(70) : 0;

  const statusReadings = [
    {
      label: 'Fonts',
      value: result?.fontCount?.toString() || (loading ? 'SCANNING' : '0'),
      tone: result?.fontCount ? ('active' as const) : ('neutral' as const),
    },
    {
      label: 'Entropy',
      value: `${entropyBits.toFixed(1)} bits`,
      tone: entropyBits > 10 ? ('alert' as const) : ('active' as const),
    },
    {
      label: 'Risk',
      value: result?.fontCount && result.fontCount > 30 ? 'HIGH' : result?.fontCount ? 'MEDIUM' : 'UNKNOWN',
      tone: result?.fontCount && result.fontCount > 30 ? ('alert' as const) : ('active' as const),
    },
  ];

  return (
    <LabShell statusReadings={statusReadings} diagnosticsRunning={loading} onRunDiagnostics={runTest}>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Font Fingerprint Test',
            description:
              'Free tool to detect installed fonts that create a unique fingerprint revealing your OS and software.',
            url: 'https://browserleaks.io/fingerprints/fonts',
            applicationCategory: 'SecurityApplication',
            operatingSystem: 'Web Browser',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />

      <div className="space-y-10">
        {/* Hero Section */}
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 mb-4">
            <Type className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300">Typography Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
            Free Font Fingerprint Test
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Your installed fonts tell websites exactly who you are - see what they reveal
          </p>
        </header>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">83.6%</div>
            <div className="text-xs text-slate-500 mt-1">Browsers Unique</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">10-15</div>
            <div className="text-xs text-slate-500 mt-1">Entropy Bits</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-rose-400">10%</div>
            <div className="text-xs text-slate-500 mt-1">Top Sites Track</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">&lt;100ms</div>
            <div className="text-xs text-slate-500 mt-1">Detection Speed</div>
          </div>
        </div>

        {/* Test Results Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr,1.5fr]">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">Font Analysis</p>

            <div className="space-y-4">
              <ResultRow label="Fonts Detected" value={result?.fontCount?.toString() || '0'} />
              <ResultRow label="Entropy Bits" value={`${entropyBits.toFixed(2)} bits`} />
              <ResultRow label="Detection Method" value="Canvas Width Comparison" />
              <ResultRow label="Fonts Tested" value="70+ common fonts" />

              {result?.hash && (
                <div className="mt-6">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-2">Fingerprint Hash</p>
                  <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                    {result.hash}
                  </div>
                </div>
              )}

              {result?.fontCount && result.fontCount > 30 && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    High font count ({result.fontCount}) significantly increases your fingerprint uniqueness.
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>

          <div className="lab-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">
                Detected Fonts ({filteredFonts.length})
              </p>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search fonts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-3 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="h-64 overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {loading ? (
                  <span className="col-span-3 text-center text-slate-500 py-8">Scanning fonts...</span>
                ) : filteredFonts.length > 0 ? (
                  filteredFonts.map((font) => (
                    <div
                      key={font}
                      className="px-2 py-1 text-xs bg-slate-800/60 text-slate-300 rounded truncate"
                      style={{ fontFamily: `"${font}", sans-serif` }}
                      title={font}
                    >
                      {font}
                    </div>
                  ))
                ) : (
                  <span className="col-span-3 text-center text-slate-500 py-8">
                    {searchQuery ? 'No matching fonts' : 'No fonts detected'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Font Categories */}
        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">Font Categories</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FontCategory
              title="System Fonts"
              fonts={filteredFonts.filter((f) =>
                ['Arial', 'Times New Roman', 'Helvetica', 'Verdana', 'Georgia', 'Courier New'].includes(f)
              )}
            />
            <FontCategory
              title="Office Fonts"
              fonts={filteredFonts.filter((f) => ['Calibri', 'Cambria', 'Consolas', 'Segoe UI'].includes(f))}
            />
            <FontCategory
              title="macOS Fonts"
              fonts={filteredFonts.filter((f) =>
                ['SF Pro', 'Helvetica Neue', 'Avenir', 'Futura', 'Monaco', 'Geneva'].includes(f)
              )}
            />
            <FontCategory
              title="Design Fonts"
              fonts={filteredFonts.filter((f) =>
                ['Comic Sans MS', 'Impact', 'Papyrus', 'Brush Script MT'].includes(f)
              )}
            />
          </div>
        </div>

        {/* Educational Content Section */}
        <section className="border-t border-slate-800/50 pt-16">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              Font Fingerprinting: Why Your Typography Choices Betray You
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              {/* Opening Hook */}
              <div className="lab-panel p-6 lg:p-8">
                <p className="text-lg">
                  Here&apos;s something that will blow your mind: every font installed on your computer tells a story
                  about you. Microsoft Office fonts? You probably have Office installed. Adobe fonts? You&apos;re
                  likely a designer. Japanese fonts? You might speak Japanese or consume Japanese content. And
                  websites can read this entire story in less than 100 milliseconds.
                </p>
                <p className="mt-4">
                  According to the{' '}
                  <a
                    href="https://amiunique.org/"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Am I Unique project
                  </a>
                  , <strong className="text-white">83.6% of browsers have unique fingerprints</strong>, and your
                  installed fonts contribute significantly to that uniqueness. Font detection alone adds 10-15 bits
                  of entropy - enough to distinguish you from roughly 30,000 other users.
                </p>
              </div>

              {/* How It Works */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  How Font Fingerprinting Works (The Clever Trick)
                </h3>
                <p>
                  Browsers don&apos;t give websites a list of your installed fonts directly - that would be too
                  obvious. Instead, fingerprinting scripts use a sneaky measurement technique:
                </p>
                <ol className="mt-4 space-y-3 list-decimal list-inside text-slate-400">
                  <li>
                    <strong className="text-slate-200">Create invisible text</strong> - The script draws hidden text
                    on a canvas element
                  </li>
                  <li>
                    <strong className="text-slate-200">Request a specific font</strong> - It asks the browser to
                    render the text in a font like &quot;Calibri&quot;
                  </li>
                  <li>
                    <strong className="text-slate-200">Measure the result</strong> - If Calibri is installed, the
                    text renders with specific dimensions. If not, the browser falls back to a default font with
                    different dimensions
                  </li>
                  <li>
                    <strong className="text-slate-200">Build a list</strong> - By testing hundreds of fonts, the
                    script creates a complete inventory of what&apos;s on your system
                  </li>
                </ol>
                <p className="mt-4">
                  The whole process takes less than 100 milliseconds. By the time your page loads, websites already
                  know exactly which fonts you have installed.
                </p>
              </div>

              {/* Latest Research */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  The Latest Research: 2024-2025 Font Fingerprinting Stats
                </h3>
                <p>
                  According to{' '}
                  <a
                    href="https://dl.acm.org/doi/10.1145/3696410.3714548"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACM Web Conference 2025 research
                  </a>
                  , browser fingerprinting has become the primary tracking method on the modern web, especially as
                  cookies become less reliable due to privacy laws and browser restrictions.
                </p>

                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Metric</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Value</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Source</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Unique browser fingerprints</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">83.6%</td>
                        <td className="py-3 px-4 text-slate-500">EFF Panopticlick</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">With Flash/Java enabled</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">94.2%</td>
                        <td className="py-3 px-4 text-slate-500">EFF Research</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Top 100K sites using fingerprinting</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">~10%</td>
                        <td className="py-3 px-4 text-slate-500">Alexa Study 2021</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Font fingerprinting entropy</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">10-15 bits</td>
                        <td className="py-3 px-4 text-slate-500">Academic Research</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Detection speed</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">&lt;100ms</td>
                        <td className="py-3 px-4 text-slate-500">Modern hardware</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300">
                    <strong>2025 Update:</strong>{' '}
                    <a
                      href="https://indulge.digital/blog/browser-fingerprinting-google%E2%80%99s-latest-move-privacy-war"
                      className="text-cyan-400 hover:text-cyan-300"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google announced
                    </a>{' '}
                    they will no longer prohibit advertising customers from fingerprinting users. The UK ICO sharply
                    rebuked this decision, calling it a significant step backward for privacy.
                  </p>
                </div>
              </div>

              {/* What Your Fonts Reveal */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  What Your Fonts Reveal About You
                </h3>
                <p>Your installed fonts are like a biography. Here&apos;s what they tell trackers:</p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-cyan-300 font-medium mb-2 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Operating System
                    </h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>
                        <strong className="text-slate-300">Segoe UI</strong> = Windows
                      </li>
                      <li>
                        <strong className="text-slate-300">SF Pro / San Francisco</strong> = macOS
                      </li>
                      <li>
                        <strong className="text-slate-300">Ubuntu / Deja Vu</strong> = Linux
                      </li>
                      <li>
                        <strong className="text-slate-300">Roboto / Noto</strong> = Android/Chrome OS
                      </li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-cyan-300 font-medium mb-2 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Installed Software
                    </h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>
                        <strong className="text-slate-300">Calibri/Cambria</strong> = Microsoft Office
                      </li>
                      <li>
                        <strong className="text-slate-300">Myriad Pro/Minion</strong> = Adobe products
                      </li>
                      <li>
                        <strong className="text-slate-300">Source Code Pro</strong> = Developer tools
                      </li>
                      <li>
                        <strong className="text-slate-300">Game fonts</strong> = Specific games installed
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Font</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">% of Browsers</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">What It Reveals</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Arial</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">99%</td>
                        <td className="py-3 px-4 text-slate-500">Universal - not identifying</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Calibri</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">62%</td>
                        <td className="py-3 px-4 text-slate-500">Windows + MS Office user</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Helvetica Neue</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">34%</td>
                        <td className="py-3 px-4 text-slate-500">macOS user</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Ubuntu</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">3%</td>
                        <td className="py-3 px-4 text-slate-500">Linux user (highly identifying)</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Myriad Pro</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">8%</td>
                        <td className="py-3 px-4 text-slate-500">Adobe CC subscriber</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* The Creativity Tax */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  The Irony: The &quot;Fingerprinting Tax on Creativity&quot;
                </h3>
                <p>Here&apos;s a cruel paradox that privacy researchers have identified:</p>
                <p className="mt-4">
                  Designers and developers who install lots of fonts for their work become the{' '}
                  <strong className="text-white">easiest to track</strong>. A graphic designer with 500 installed
                  fonts has an almost unique fingerprint, while someone using a stock Windows installation blends in
                  with millions.
                </p>
                <p className="mt-4">
                  Think about it: the more creative you are, the more tools you need. The more tools you have, the
                  more unique your font fingerprint becomes. Privacy researchers call this the &quot;fingerprinting
                  tax on creativity.&quot;
                </p>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-300 mb-2">Stock Windows User</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>~50 system fonts</li>
                      <li>Low entropy (5-8 bits)</li>
                      <li>Blends in with millions</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                    <h4 className="font-semibold text-rose-300 mb-2">Designer/Developer</h4>
                    <ul className="text-sm text-slate-400 space-y-1">
                      <li>200-500+ fonts</li>
                      <li>High entropy (15-20+ bits)</li>
                      <li>Practically unique</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How to Protect */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How to Protect Yourself from Font Fingerprinting
                </h3>
                <p>Unlike some fingerprinting methods, font fingerprinting is difficult to block without side effects:</p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      1. Tor Browser (Best Protection)
                    </h4>
                    <p className="text-sm text-slate-400">
                      According to{' '}
                      <a
                        href="https://pitg.gitlab.io/news/techdive/2025/08/15/browser-fingerprinting.html"
                        className="text-cyan-400 hover:text-cyan-300"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        privacy researchers
                      </a>
                      , every Tor Browser user presents an identical fingerprint. It limits font detection to a
                      standardized list, making all users look identical. Version 13.5 (December 2024) further
                      enhanced protections.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">2. Firefox with resistFingerprinting</h4>
                    <p className="text-sm text-slate-400">
                      Enable{' '}
                      <code className="text-cyan-400 bg-slate-900 px-1 rounded">privacy.resistFingerprinting</code> in
                      about:config. This restricts font enumeration to system fonts only, reducing your uniqueness.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">3. Minimize Installed Fonts</h4>
                    <p className="text-sm text-slate-400">
                      Remove fonts you don&apos;t actively use, especially unique ones from specialized software.
                      Keep only what you need for daily work.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">4. Use Common Operating Systems</h4>
                    <p className="text-sm text-slate-400">
                      Windows and macOS have the most &quot;typical&quot; font sets. Linux users with custom font
                      installations are more easily identified.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    VPNs Don&apos;t Help
                  </h4>
                  <p className="text-sm text-slate-400">
                    VPNs change your IP address but do nothing about your browser fingerprint. You&apos;re still
                    uniquely identifiable through fonts, canvas, WebGL, and dozens of other parameters.
                  </p>
                </div>
              </div>

              {/* Quick Facts */}
              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Quick Facts: Font Fingerprinting
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Average browser has 50-100 detectable fonts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Font fingerprinting adds 10-15 bits of entropy to your profile</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Detection takes less than 100ms on modern hardware</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>CSS Font Loading API can also be abused for font detection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>~10% of top 100K websites actively use fingerprinting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Google now permits advertisers to use fingerprinting (2025)</span>
                  </li>
                </ul>
              </div>

              {/* Related Tests */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">Test Other Fingerprinting Methods</h3>
                <p className="mb-6">
                  Fonts are just one fingerprinting technique. Test these related methods for complete privacy
                  analysis:
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Link
                    href="/fingerprints/canvas"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Fingerprint className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">Canvas Fingerprint</div>
                      <div className="text-xs text-slate-500">2D rendering signature</div>
                    </div>
                  </Link>
                  <Link
                    href="/fingerprints/webgl"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Monitor className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">WebGL Fingerprint</div>
                      <div className="text-xs text-slate-500">GPU hardware signature</div>
                    </div>
                  </Link>
                  <Link
                    href="/hardware/audio"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Layers className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">Audio Fingerprint</div>
                      <div className="text-xs text-slate-500">Audio processing signature</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Contact */}
              <div className="text-center text-sm text-slate-500 pt-4">
                <p>
                  Questions about your results? Contact us at{' '}
                  <a href="mailto:privacy@browserleaks.io" className="text-cyan-400 hover:text-cyan-300">
                    privacy@browserleaks.io
                  </a>
                </p>
              </div>
            </div>
          </article>
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

function FontCategory({ title, fonts }: { title: string; fonts: string[] }) {
  return (
    <div className="bg-slate-800/30 p-3 rounded">
      <h4 className="text-xs text-slate-400 mb-2">{title}</h4>
      <p className="text-lg font-mono text-cyan-300">{fonts.length}</p>
      <p className="text-xs text-slate-500">fonts detected</p>
    </div>
  );
}
