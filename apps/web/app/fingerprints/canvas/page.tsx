'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';
import { CanvasFingerprint } from '@/lib/fingerprint/canvas';
import {
  Fingerprint,
  Shield,
  AlertTriangle,
  Eye,
  Monitor,
  Cpu,
  Palette,
  Lock,
  CheckCircle2,
  ArrowRight,
  Layers,
  Zap,
} from 'lucide-react';

interface CanvasResult {
  hash: string;
  dataURL: string;
  width: number;
  height: number;
  isSupported: boolean;
  features: {
    textRendering: string;
    emojiRendering: string;
    gradientRendering: string;
  };
}

export default function CanvasFingerprintPage() {
  const [result, setResult] = useState<CanvasResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new CanvasFingerprint();
      const data = await detector.detect();
      setResult(data);
      detector.cleanup();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Canvas detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = [
    {
      label: 'Status',
      value: result?.isSupported ? 'DETECTED' : loading ? 'SCANNING' : 'IDLE',
      tone: result?.isSupported ? ('active' as const) : ('neutral' as const),
    },
    {
      label: 'Hash',
      value: result?.hash?.slice(0, 12) || '---',
      tone: result?.hash ? ('active' as const) : ('neutral' as const),
    },
    {
      label: 'Risk',
      value: result?.isSupported ? 'TRACKABLE' : 'UNKNOWN',
      tone: result?.isSupported ? ('alert' as const) : ('neutral' as const),
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
            name: 'Canvas Fingerprint Test',
            description:
              "Free tool to test your browser's unique canvas fingerprint that can be used to track you across websites.",
            url: 'https://browserleaks.io/fingerprints/canvas',
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
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 mb-4">
            <Fingerprint className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Browser Fingerprinting Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
            Free Canvas Fingerprint Test
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            See the invisible tracking signature your browser leaves on every website you visit
          </p>
        </header>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">83.6%</div>
            <div className="text-xs text-slate-500 mt-1">Browsers Unique</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">99%+</div>
            <div className="text-xs text-slate-500 mt-1">Combined Accuracy</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-rose-400">10K+</div>
            <div className="text-xs text-slate-500 mt-1">Sites Using This</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">Zero</div>
            <div className="text-xs text-slate-500 mt-1">Cookies Needed</div>
          </div>
        </div>

        {/* Test Results Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">Canvas Specimen</p>

            {result?.dataURL ? (
              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded p-4">
                  <Image
                    src={result.dataURL}
                    alt="Canvas fingerprint specimen"
                    width={result.width}
                    height={result.height}
                    className="w-full max-w-md mx-auto"
                    unoptimized
                  />
                </div>
                <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                  {result.hash}
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {loading ? 'Generating specimen...' : 'Click scan to generate specimen'}
              </div>
            )}
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">Analysis Results</p>

            <div className="space-y-4">
              <ResultRow label="Canvas Support" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Dimensions" value={result ? `${result.width}x${result.height}` : '---'} />
              <ResultRow label="Text Rendering" value={result?.features.textRendering || '---'} />
              <ResultRow label="Emoji Rendering" value={result?.features.emojiRendering || '---'} />
              <ResultRow label="Gradient Support" value={result?.features.gradientRendering || '---'} />

              {result?.isSupported && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Your canvas fingerprint is unique and can be used to track you across websites.
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
        </div>

        {/* Educational Content Section */}
        <section className="border-t border-slate-800/50 pt-16">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              Canvas Fingerprinting: The Invisible Tracker That Knows Your Browser
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              {/* Opening Hook */}
              <div className="lab-panel p-6 lg:p-8">
                <p className="text-lg">
                  Here&apos;s something wild that most people don&apos;t know: websites can identify your specific
                  browser without storing a single cookie on your device. No login required. No tracking pixel needed.
                  Just a simple drawing operation that reveals your digital DNA. This is canvas fingerprinting, and if
                  you&apos;re reading this in a normal browser, you&apos;re already being tracked by it.
                </p>
                <p className="mt-4">
                  According to research from the{' '}
                  <a
                    href="https://www.eff.org/"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Electronic Frontier Foundation
                  </a>
                  , <strong className="text-white">83.6% of browsers have unique fingerprints</strong>. When you
                  combine canvas with other fingerprinting methods, that number jumps to over 99%. You think you&apos;re
                  anonymous online? Your browser is screaming your identity to every website you visit.
                </p>
              </div>

              {/* How It Works */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  How Canvas Fingerprinting Actually Works (Simple Explanation)
                </h3>
                <p>
                  Think of it like handwriting analysis. If I asked a million people to write &quot;Hello World&quot;
                  with the exact same pen, on the exact same paper, following identical instructions - no two samples
                  would be pixel-perfect matches. Everyone&apos;s hand is slightly different.
                </p>
                <p className="mt-4">
                  Your browser is the same deal. When a website asks your browser to draw text or shapes on an
                  invisible &quot;canvas&quot; (a hidden drawing area), your specific combination of hardware and
                  software creates microscopic differences in how those pixels get rendered:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li>
                    <strong className="text-slate-200">Your GPU</strong> - Different graphics cards render pixels
                    slightly differently
                  </li>
                  <li>
                    <strong className="text-slate-200">Graphics drivers</strong> - Version differences create rendering
                    variations
                  </li>
                  <li>
                    <strong className="text-slate-200">Font rendering engine</strong> - macOS, Windows, and Linux handle
                    fonts differently
                  </li>
                  <li>
                    <strong className="text-slate-200">Anti-aliasing settings</strong> - How your system smooths edges
                  </li>
                  <li>
                    <strong className="text-slate-200">Screen resolution and color depth</strong> - Your display
                    characteristics
                  </li>
                </ul>
                <p className="mt-4">
                  These differences are invisible to your eyes - we&apos;re talking about single-pixel variations. But
                  computers can measure them precisely. The website converts this drawing into a &quot;hash&quot; (a
                  unique string of characters), and boom - they&apos;ve got your fingerprint.
                </p>
              </div>

              {/* Latest Research Data */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  The Latest Research: 2025 Data on Canvas Fingerprinting
                </h3>
                <p>
                  The numbers are getting worse, not better. According to the latest{' '}
                  <a
                    href="https://dl.acm.org/doi/10.1145/3696410.3714713"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ACM Web Conference 2025 research
                  </a>
                  , researchers tested every major defense against canvas fingerprinting and found that{' '}
                  <strong className="text-white">
                    &quot;no fully deployable defense against canvas fingerprinting attacks exists currently.&quot;
                  </strong>
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
                        <td className="py-3 px-4">Canvas alone identification rate</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">~60%</td>
                        <td className="py-3 px-4 text-slate-500">Academic Research</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Combined with WebGL accuracy</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">99%+</td>
                        <td className="py-3 px-4 text-slate-500">Princeton/KU Leuven</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Top 100K sites using fingerprinting</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">5,542 (5.5%)</td>
                        <td className="py-3 px-4 text-slate-500">Web Census 2020</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Desktop browser uniqueness</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">91.4%</td>
                        <td className="py-3 px-4 text-slate-500">Princeton Research</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Mobile browser uniqueness</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">52%</td>
                        <td className="py-3 px-4 text-slate-500">Princeton Research</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  A 2025 study using &quot;FPTrace&quot; found that{' '}
                  <a
                    href="https://dl.acm.org/doi/10.1145/3696410.3714548"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    fingerprinting can bypass GDPR and CCPA opt-outs
                  </a>
                  , enabling tracking even when you&apos;ve explicitly said &quot;don&apos;t track me.&quot;
                </p>
              </div>

              {/* Why This Is Different from Cookies */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Why Canvas Fingerprinting Is Scarier Than Cookies
                </h3>
                <p>Here&apos;s what makes canvas fingerprinting particularly nasty compared to traditional cookies:</p>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-rose-400 font-medium mb-2">Cookies (Old Way)</h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>Stored on your device</li>
                      <li>You can delete them anytime</li>
                      <li>Incognito mode blocks them</li>
                      <li>Browsers show cookie warnings</li>
                      <li>Easily blocked by extensions</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-amber-400 font-medium mb-2">Canvas Fingerprinting (New Way)</h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>Nothing stored on your device</li>
                      <li>Nothing to delete</li>
                      <li>Works in incognito mode</li>
                      <li>Completely invisible</li>
                      <li>Hard to block without breaking sites</li>
                    </ul>
                  </div>
                </div>

                <p className="mt-4">
                  Privacy researchers call this a &quot;supercookie&quot; - a tracking mechanism that persists across
                  sessions and can even be used to re-identify you after you&apos;ve deleted traditional cookies. Clear
                  your browsing data? Fingerprint still works. Use private browsing? Fingerprint still works. The only
                  thing that changes it is using a completely different device or browser.
                </p>
              </div>

              {/* Technical Deep Dive */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  What Creates Your Unique Fingerprint?
                </h3>
                <p>
                  Your canvas fingerprint is created by a combination of hardware and software factors. Here&apos;s
                  what makes yours unique:
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-cyan-300 font-medium mb-2 flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      Hardware Factors
                    </h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>GPU manufacturer (NVIDIA, AMD, Intel)</li>
                      <li>GPU model and generation</li>
                      <li>Graphics driver version</li>
                      <li>Screen resolution and scaling</li>
                      <li>Color depth and profile</li>
                      <li>Anti-aliasing implementation</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded">
                    <h4 className="text-cyan-300 font-medium mb-2 flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Software Factors
                    </h4>
                    <ul className="text-sm space-y-1 text-slate-400">
                      <li>Operating system (Windows/macOS/Linux)</li>
                      <li>OS version and updates</li>
                      <li>Browser engine (Chromium, Gecko, WebKit)</li>
                      <li>Installed system fonts</li>
                      <li>Language and locale settings</li>
                      <li>Subpixel rendering preferences</li>
                    </ul>
                  </div>
                </div>

                <p>
                  Interestingly,{' '}
                  <a
                    href="https://multilogin.com/blog/the-great-myth-of-canvas-fingerprinting/"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    research from 2024
                  </a>{' '}
                  found that many popular device configurations actually produce identical fingerprints. For example,
                  all MacBook Pros from 2020-2024 with default Safari settings share the same canvas fingerprint, and 23
                  different laptops with Intel integrated graphics produced identical outputs. So while fingerprinting
                  is powerful, it&apos;s not perfect.
                </p>
              </div>

              {/* How to Protect Yourself */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How to Protect Yourself from Canvas Fingerprinting
                </h3>
                <p>
                  Complete protection is tricky because blocking canvas entirely breaks many legitimate websites
                  (including games, photo editors, and drawing apps). Here are practical options ranked by
                  effectiveness:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      1. Use Tor Browser (Best Protection)
                    </h4>
                    <p className="text-sm text-slate-400">
                      The gold standard. Tor returns identical canvas results for all users worldwide, making
                      fingerprinting completely useless. Everyone looks the same. Trade-off: it&apos;s slower and some
                      sites block it.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">2. Firefox with resistFingerprinting</h4>
                    <p className="text-sm text-slate-400">
                      Go to <code className="text-cyan-400 bg-slate-900 px-1 rounded">about:config</code> and enable{' '}
                      <code className="text-cyan-400 bg-slate-900 px-1 rounded">privacy.resistFingerprinting</code>.
                      This adds noise to canvas reads and rounds various values to reduce uniqueness.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">3. Brave Browser</h4>
                    <p className="text-sm text-slate-400">
                      Brave includes built-in fingerprinting protection that randomizes canvas values per session. Just
                      enable &quot;Aggressive&quot; fingerprinting protection in Shields settings.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">4. Browser Extensions</h4>
                    <p className="text-sm text-slate-400">
                      Extensions like CanvasBlocker (Firefox) or Canvas Fingerprint Defender (Chrome) can randomize
                      your fingerprint per site or session. However, the 2025 ACM research showed that attackers can
                      often detect and defeat these defenses.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Important Reality Check
                  </h4>
                  <p className="text-sm text-slate-400">
                    The 2025 ACM Web Conference research analyzed 18 browser extensions and 5 major browsers (Chrome,
                    Firefox, Brave, Tor, Safari) and found that researchers could successfully attack all
                    randomization-based defenses. Only Tor Browser provided meaningful protection. The arms race
                    continues.
                  </p>
                </div>
              </div>

              {/* The Bigger Picture */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  The Bigger Picture: Why This Matters
                </h3>
                <p>
                  Canvas fingerprinting is just one piece of a larger puzzle. Modern trackers combine multiple
                  techniques to create comprehensive profiles:
                </p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">WebGL Fingerprinting</strong> - Uses 3D graphics rendering for
                      even more hardware-specific signatures
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Audio Fingerprinting</strong> - Analyzes how your device
                      processes sound
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Font Enumeration</strong> - Catalogs every font installed on
                      your system
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Navigator Properties</strong> - Browser version, language,
                      plugins, and more
                    </span>
                  </li>
                </ul>

                <p className="mt-4">
                  The{' '}
                  <a
                    href="https://www.esat.kuleuven.be/cosic/news/the-web-never-forgets-persistent-tracking-mechanisms-in-the-wild/"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &quot;DrawnApart&quot; technique from COSIC research
                  </a>{' '}
                  showed that by fingerprinting minute differences in GPU hardware, trackers can boost fingerprint
                  tracking duration by 67%. The technology keeps getting more sophisticated.
                </p>
              </div>

              {/* Quick Facts Box */}
              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Quick Facts: Canvas Fingerprinting
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>First documented by researchers in 2012</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Used by 5.5% of the top 100,000 websites (5,542 sites)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Cannot be cleared like cookies or local storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Works in private/incognito browsing mode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Can bypass GDPR/CCPA consent mechanisms (2025 research)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>No fully deployable defense exists yet (ACM 2025)</span>
                  </li>
                </ul>
              </div>

              {/* Related Tests */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">Test Other Fingerprinting Techniques</h3>
                <p className="mb-6">
                  Canvas is just one fingerprinting method. For complete privacy analysis, test these as well:
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Link
                    href="/fingerprints/webgl"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Monitor className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">WebGL Fingerprint</div>
                      <div className="text-xs text-slate-500">3D graphics signature</div>
                    </div>
                  </Link>
                  <Link
                    href="/fingerprints/fonts"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Layers className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">Font Detection</div>
                      <div className="text-xs text-slate-500">Installed fonts list</div>
                    </div>
                  </Link>
                  <Link
                    href="/tests/ip-leak"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Shield className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">IP Leak Test</div>
                      <div className="text-xs text-slate-500">VPN leak detection</div>
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
