'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { LabShell } from '@/components/layout/LabShell';
import { WebGLFingerprint, type WebGLFingerprintResult } from '@/lib/fingerprint/webgl';
import {
  Monitor,
  Cpu,
  Shield,
  AlertTriangle,
  Eye,
  Layers,
  Lock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Clock,
  Fingerprint,
} from 'lucide-react';

export default function WebGLFingerprintPage() {
  const [result, setResult] = useState<WebGLFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new WebGLFingerprint();
      const data = await detector.detect();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WebGL detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = [
    {
      label: 'Vendor',
      value: result?.vendor?.slice(0, 15) || (loading ? 'SCANNING' : 'IDLE'),
      tone: result?.isSupported ? ('active' as const) : ('neutral' as const),
    },
    {
      label: 'Renderer',
      value: result?.renderer?.slice(0, 20) || '---',
      tone: result?.renderer ? ('active' as const) : ('neutral' as const),
    },
    {
      label: 'Extensions',
      value: result?.extensions?.length?.toString() || '0',
      tone: result?.extensions?.length ? ('alert' as const) : ('neutral' as const),
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
            name: 'WebGL Fingerprint Test',
            description:
              "Free tool to test your browser's WebGL fingerprint revealing GPU details that uniquely identify your device.",
            url: 'https://browserleaks.io/fingerprints/webgl',
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
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 mb-4">
            <Cpu className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">GPU Hardware Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100">
            Free WebGL Fingerprint Test
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Your graphics card is a unique identifier - discover what it reveals about you
          </p>
        </header>

        {/* Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">98%</div>
            <div className="text-xs text-slate-500 mt-1">Accuracy Rate</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">150ms</div>
            <div className="text-xs text-slate-500 mt-1">Detection Speed</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-rose-400">67%</div>
            <div className="text-xs text-slate-500 mt-1">Tracking Boost</div>
          </div>
          <div className="lab-panel p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">2500+</div>
            <div className="text-xs text-slate-500 mt-1">Devices Tested</div>
          </div>
        </div>

        {/* Test Results Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">GPU Information</p>

            <div className="space-y-4">
              <ResultRow label="WebGL Support" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Vendor" value={result?.vendor || '---'} />
              <ResultRow label="Renderer" value={result?.renderer || '---'} />
              <ResultRow label="WebGL Version" value={result?.version || '---'} />
              <ResultRow label="GLSL Version" value={result?.shadingLanguageVersion || '---'} />

              {result?.hash && (
                <div className="mt-6">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-2">Fingerprint Hash</p>
                  <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                    {result.hash}
                  </div>
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
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">WebGL Parameters</p>

            <div className="space-y-4">
              {result?.parameters &&
                Object.entries(result.parameters).map(([key, value]) => (
                  <ResultRow
                    key={key}
                    label={formatParamName(key)}
                    value={Array.isArray(value) ? value.join(' x ') : String(value ?? '---')}
                  />
                ))}
            </div>

            {result?.isSupported && (
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                <p className="text-sm text-orange-300">
                  Your GPU details expose unique hardware characteristics that can identify your device.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Extensions Grid */}
        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Supported Extensions ({result?.extensions?.length || 0})
          </p>
          <div className="flex flex-wrap gap-2">
            {result?.extensions?.map((ext) => (
              <span key={ext} className="px-2 py-1 text-xs font-mono bg-slate-800/60 text-slate-300 rounded">
                {ext}
              </span>
            ))}
            {!result?.extensions?.length && <span className="text-sm text-slate-500">No extensions detected</span>}
          </div>
        </div>

        {/* Educational Content Section */}
        <section className="border-t border-slate-800/50 pt-16">
          <article className="prose prose-invert prose-lg max-w-none">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-8 text-center">
              WebGL Fingerprinting: Your GPU Is Telling Secrets About You
            </h2>

            <div className="space-y-8 text-slate-300 leading-relaxed">
              {/* Opening Hook */}
              <div className="lab-panel p-6 lg:p-8">
                <p className="text-lg">
                  Here&apos;s something most people don&apos;t realize: your graphics card has a unique signature, kind
                  of like a fingerprint. And websites can read this signature instantly, without your permission, to
                  identify you across the entire internet. Welcome to WebGL fingerprinting - one of the most powerful
                  and least understood tracking techniques in use today.
                </p>
                <p className="mt-4">
                  According to{' '}
                  <a
                    href="https://www.bleepingcomputer.com/news/security/researchers-use-gpu-fingerprinting-to-track-users-online/"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    research from Ben-Gurion University
                  </a>
                  , GPU fingerprinting can identify devices with <strong className="text-white">98% accuracy</strong>{' '}
                  in just 150 milliseconds - faster than you can blink. That&apos;s not a typo. Your graphics card
                  gives you away in 0.15 seconds.
                </p>
              </div>

              {/* What Is WebGL */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  What Is WebGL Fingerprinting? (Simple Explanation)
                </h3>
                <p>
                  WebGL (Web Graphics Library) is the technology that lets websites show 3D graphics in your browser.
                  It&apos;s what powers browser games, interactive maps, and cool visual effects. The problem? To
                  render those graphics, WebGL needs to talk directly to your GPU (graphics card).
                </p>
                <p className="mt-4">
                  And when websites talk to your GPU, they can extract a ton of information about your specific
                  hardware:
                </p>
                <ul className="mt-4 space-y-2 list-disc list-inside text-slate-400">
                  <li>
                    <strong className="text-slate-200">GPU vendor</strong> - NVIDIA, AMD, Intel, or Apple
                  </li>
                  <li>
                    <strong className="text-slate-200">GPU model</strong> - RTX 4090, RX 7900 XT, M3 Pro, etc.
                  </li>
                  <li>
                    <strong className="text-slate-200">Driver version</strong> - The exact software version running
                    your GPU
                  </li>
                  <li>
                    <strong className="text-slate-200">Capabilities</strong> - Max texture size, extensions, shader
                    precision
                  </li>
                  <li>
                    <strong className="text-slate-200">Rendering quirks</strong> - Tiny timing differences unique to
                    your exact chip
                  </li>
                </ul>
                <p className="mt-4">
                  This combination is often unique to YOUR specific device. Not just your type of device - YOUR exact
                  computer.
                </p>
              </div>

              {/* DrawnApart Research */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  The DrawnApart Breakthrough: 2500 GPUs Tested
                </h3>
                <p>
                  In groundbreaking{' '}
                  <a
                    href="https://www.tomshardware.com/news/researchers-gpus-can-be-used-for-digital-fingerprinting-and-web-tracking"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    research from Israeli universities
                  </a>
                  , scientists created a technique called &quot;DrawnApart&quot; that takes GPU fingerprinting to a
                  whole new level. They tested 2,500 devices and found something remarkable:
                </p>

                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Metric</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Value</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Significance</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Classification Accuracy</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">98%</td>
                        <td className="py-3 px-4 text-slate-500">Near-perfect identification</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Detection Speed</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">150ms</td>
                        <td className="py-3 px-4 text-slate-500">Faster than human perception</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Tracking Duration Boost</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">67%</td>
                        <td className="py-3 px-4 text-slate-500">vs. other fingerprint methods</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Data Collection Points</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">176</td>
                        <td className="py-3 px-4 text-slate-500">Measurements per fingerprint</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Devices Tested</td>
                        <td className="py-3 px-4 font-mono text-cyan-400">2,500+</td>
                        <td className="py-3 px-4 text-slate-500">Large-scale validation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4">
                  The technique works by measuring tiny timing differences in how your GPU processes graphics
                  operations. Even GPUs of the exact same model have subtle manufacturing variations that create unique
                  signatures.
                </p>
              </div>

              {/* The Unmasked Trick */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  The UNMASKED_RENDERER_WEBGL Trick
                </h3>
                <p>Here&apos;s something sneaky that most people don&apos;t know about:</p>
                <p className="mt-4">
                  Some browsers try to protect you by returning generic GPU names like &quot;WebKit WebGL&quot; instead
                  of your actual hardware. Smart, right? But there&apos;s a backdoor called{' '}
                  <code className="text-cyan-400 bg-slate-900 px-1 rounded">WEBGL_debug_renderer_info</code>.
                </p>
                <p className="mt-4">
                  This WebGL extension was designed for debugging - helping developers figure out why their 3D graphics
                  weren&apos;t working. But trackers discovered it&apos;s perfect for fingerprinting. It returns the
                  &quot;unmasked&quot; vendor and renderer strings - your REAL GPU info.
                </p>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300">
                    <strong>Real example:</strong> Instead of seeing &quot;WebKit WebGL&quot;, a tracker using
                    WEBGL_debug_renderer_info sees &quot;ANGLE (NVIDIA GeForce RTX 4090 Direct3D11 vs_5_0 ps_5_0,
                    D3D11)&quot; - uniquely identifying your exact graphics card and driver version.
                  </p>
                </div>
              </div>

              {/* WebGL vs Canvas */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  WebGL vs Canvas Fingerprinting: What&apos;s the Difference?
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Feature</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Canvas</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">WebGL</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-300">
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Graphics Type</td>
                        <td className="py-3 px-4">2D</td>
                        <td className="py-3 px-4 text-cyan-400">3D (more hardware access)</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Uniqueness</td>
                        <td className="py-3 px-4">~60%</td>
                        <td className="py-3 px-4 text-cyan-400">~96%</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Hardware Info</td>
                        <td className="py-3 px-4">Indirect (via rendering)</td>
                        <td className="py-3 px-4 text-cyan-400">Direct (vendor/model)</td>
                      </tr>
                      <tr className="border-b border-slate-800">
                        <td className="py-3 px-4">Stability</td>
                        <td className="py-3 px-4">Good</td>
                        <td className="py-3 px-4 text-cyan-400">Excellent</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Detection Difficulty</td>
                        <td className="py-3 px-4">Medium</td>
                        <td className="py-3 px-4 text-rose-400">Low (harder to detect)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4">
                  WebGL fingerprinting is actually more concerning than canvas fingerprinting because it provides
                  direct hardware information rather than just rendering differences. Your GPU model string alone is
                  often enough to significantly narrow down your identity.
                </p>
              </div>

              {/* WebGPU Warning */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Warning: WebGPU Is Coming (And It&apos;s Worse)
                </h3>
                <p>
                  If you think WebGL fingerprinting is bad, wait until WebGPU becomes widespread. WebGPU is the
                  next-generation graphics API that&apos;s being rolled out in modern browsers. It provides even more
                  direct access to your GPU hardware.
                </p>
                <p className="mt-4">
                  According to{' '}
                  <a
                    href="https://www.notebookcheck.net/Researchers-demonstrate-GPU-tracking-method-that-could-impact-online-privacy.597047.0.html"
                    className="text-cyan-400 hover:text-cyan-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    privacy researchers
                  </a>
                  , WebGPU&apos;s compute shaders enable the same 98% classification accuracy that took 8 seconds via
                  WebGL - but in just 150 milliseconds. The tracking is getting faster, not slower.
                </p>
                <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-300">
                    <strong>The Khronos Group</strong> (developers of WebGL) has formed a technical study group to
                    discuss potential solutions with browser vendors. But for now, there&apos;s no standard protection
                    against GPU fingerprinting.
                  </p>
                </div>
              </div>

              {/* How to Protect */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  How to Protect Yourself from WebGL Fingerprinting
                </h3>
                <p>
                  Complete protection is difficult because many websites legitimately need WebGL for 3D graphics. Here
                  are your options, ranked by effectiveness:
                </p>

                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <h4 className="font-semibold text-emerald-300 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      1. Tor Browser (Best Protection)
                    </h4>
                    <p className="text-sm text-slate-400">
                      Returns standardized WebGL values for all users. Everyone looks identical. Trade-off: slower
                      browsing and some 3D content may not work.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">2. Firefox with resistFingerprinting</h4>
                    <p className="text-sm text-slate-400">
                      Enable <code className="text-cyan-400 bg-slate-900 px-1 rounded">privacy.resistFingerprinting</code>{' '}
                      in about:config. Spoofs or blocks WebGL renderer strings. May break some WebGL content.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">3. Disable WebGL Entirely</h4>
                    <p className="text-sm text-slate-400">
                      In Firefox: Set <code className="text-cyan-400 bg-slate-900 px-1 rounded">webgl.disabled</code> to
                      true. Nuclear option - breaks many modern websites including Google Maps 3D, browser games, and
                      interactive visualizations.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-semibold text-slate-200 mb-2">4. Browser Extensions</h4>
                    <p className="text-sm text-slate-400">
                      Extensions like WebGL Fingerprint Defender can randomize or spoof WebGL values. However,
                      sophisticated trackers can sometimes detect spoofed values.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real World Usage */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Who&apos;s Using WebGL Fingerprinting?
                </h3>
                <p>
                  WebGL fingerprinting isn&apos;t theoretical - it&apos;s being used right now by major companies:
                </p>

                <ul className="mt-4 space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Ad Tech Platforms</strong> - Track you across websites to
                      serve personalized ads
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Fraud Detection Services</strong> - Identify bots and detect
                      fraudulent transactions
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Anti-Piracy Systems</strong> - Track users across sessions to
                      prevent sharing
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-200">Banking Sites</strong> - Device authentication for security
                    </span>
                  </li>
                </ul>

                <p className="mt-4">
                  A 2020 study found WebGL fingerprinting scripts on over 8% of the top 10,000 websites. The technique
                  is popular because it&apos;s completely passive - users have absolutely no idea it&apos;s happening.
                </p>
              </div>

              {/* Quick Facts */}
              <div className="lab-panel p-6 lg:p-8 bg-gradient-to-br from-cyan-500/5 to-violet-500/5">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Quick Facts: WebGL Fingerprinting
                </h3>
                <ul className="space-y-3 text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>96% of browsers have unique WebGL renderer strings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>98% accuracy using DrawnApart GPU timing analysis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>150ms detection speed - faster than you can blink</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>67% boost to tracking duration vs other methods</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>Used on 8%+ of top 10,000 websites</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span>WebGPU successor makes tracking even more precise</span>
                  </li>
                </ul>
              </div>

              {/* Related Tests */}
              <div className="lab-panel p-6 lg:p-8">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">Test Other Fingerprinting Methods</h3>
                <p className="mb-6">
                  WebGL is just one piece of the fingerprinting puzzle. Test these related techniques:
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
                    href="/hardware/gpu"
                    className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors"
                  >
                    <Cpu className="h-5 w-5 text-cyan-400" />
                    <div>
                      <div className="font-medium text-slate-200">GPU Details</div>
                      <div className="text-xs text-slate-500">Full hardware info</div>
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
      <span className="font-mono text-sm text-cyan-200 truncate max-w-[200px]" title={value}>
        {value}
      </span>
    </div>
  );
}

function formatParamName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/max/i, 'Max');
}
