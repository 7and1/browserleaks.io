'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { LabShell } from '@/components/layout/LabShell';
import { CanvasFingerprint } from '@/lib/fingerprint/canvas';

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

  // Auto-run on mount
  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = [
    {
      label: 'Status',
      value: result?.isSupported ? 'DETECTED' : loading ? 'SCANNING' : 'IDLE',
      tone: result?.isSupported ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Hash',
      value: result?.hash?.slice(0, 12) || '---',
      tone: result?.hash ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: result?.isSupported ? 'TRACKABLE' : 'UNKNOWN',
      tone: result?.isSupported ? 'alert' as const : 'neutral' as const,
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">Canvas Fingerprint</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect your browser&apos;s unique canvas rendering signature that can be used to track you.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Canvas Specimen */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Canvas Specimen
            </p>

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

          {/* Results */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Analysis Results
            </p>

            <div className="space-y-4">
              <ResultRow label="Canvas Support" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Dimensions" value={result ? `${result.width}x${result.height}` : '---'} />
              <ResultRow label="Text Rendering" value={result?.features.textRendering || '---'} />
              <ResultRow label="Emoji Rendering" value={result?.features.emojiRendering || '---'} />
              <ResultRow label="Gradient Support" value={result?.features.gradientRendering || '---'} />

              {result?.isSupported && (
                <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    ⚠️ Your canvas fingerprint is unique and can be used to track you across websites.
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

        {/* Educational Content */}
        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Canvas Fingerprinting: The Silent Tracker That Knows Your Browser
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Look, here&apos;s something that might blow your mind: websites can identify your specific browser
              without ever setting a cookie. No login required. No tracking pixel needed. Just a simple
              drawing operation that reveals your digital DNA. Welcome to canvas fingerprinting.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Canvas Fingerprinting Actually Works</h3>
            <p>
              Think of it like this: imagine asking a million people to draw the letter &quot;A&quot; with the exact same
              instructions. Even though everyone follows identical steps, no two drawings would be pixel-perfect
              matches. Why? Different hands, different pens, different surfaces.
            </p>
            <p>
              Your browser is the same deal. When a website asks your browser to draw text or shapes on an
              invisible canvas, your specific combination of GPU, graphics drivers, font rendering engine,
              operating system, and installed fonts creates microscopic differences in how those pixels get placed.
            </p>
            <p>
              These differences are invisible to your eyes but computers can measure them with scary precision.
              The website converts this drawing into a hash - a unique string of characters - and boom,
              they&apos;ve got your fingerprint.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Numbers Don&apos;t Lie: How Unique Are You?</h3>
            <p>
              According to research from Princeton and KU Leuven universities, canvas fingerprinting can uniquely
              identify browsers with remarkable accuracy:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">91.4%</strong> of desktop browsers produce unique canvas fingerprints</li>
              <li><strong className="text-slate-300">52%</strong> of mobile browsers are uniquely identifiable</li>
              <li>Combined with other browser attributes, uniqueness approaches <strong className="text-slate-300">99%+</strong></li>
            </ul>
            <p>
              A 2020 study by Mozilla found that the top 10,000 websites include canvas fingerprinting scripts
              from at least one tracking company. That&apos;s not fringe behavior - it&apos;s industry standard.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why This Matters for Your Privacy</h3>
            <p>
              Here&apos;s the thing that makes canvas fingerprinting particularly sneaky: it&apos;s stateless.
              Unlike cookies, there&apos;s nothing stored on your device that you can delete. Clear your
              browsing data? Fingerprint still works. Use incognito mode? Fingerprint still works.
              Switch browsers? Okay, that changes things - but most people don&apos;t.
            </p>
            <p>
              This creates what privacy researchers call &quot;supercookies&quot; - tracking mechanisms that
              persist across sessions and can even be used to re-identify you after you&apos;ve deleted
              traditional cookies. Advertisers love this because it makes cross-site tracking reliable.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Makes Your Canvas Fingerprint Unique?</h3>
            <p>
              Multiple factors combine to create your unique canvas signature:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Hardware Factors</h4>
                <ul className="text-sm space-y-1">
                  <li>• GPU manufacturer and model</li>
                  <li>• Graphics driver version</li>
                  <li>• Screen resolution and color depth</li>
                  <li>• Anti-aliasing implementation</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Software Factors</h4>
                <ul className="text-sm space-y-1">
                  <li>• Operating system and version</li>
                  <li>• Browser engine (Chromium, Gecko, WebKit)</li>
                  <li>• Installed fonts</li>
                  <li>• System language settings</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">How to Protect Yourself</h3>
            <p>
              Complete protection is tricky because blocking canvas entirely breaks many legitimate websites.
              Here are practical options ranked by effectiveness:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - The gold standard. Tor returns
                identical canvas results for all users, making fingerprinting useless. Trade-off: it&apos;s slower.
              </li>
              <li>
                <strong className="text-slate-300">Firefox with resistFingerprinting</strong> - Enable
                <code className="bg-slate-800 px-1 rounded">privacy.resistFingerprinting</code> in about:config.
                This adds noise to canvas reads, making your fingerprint less unique.
              </li>
              <li>
                <strong className="text-slate-300">Browser Extensions</strong> - CanvasBlocker or Canvas Defender
                can randomize your canvas fingerprint per site or session.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Includes built-in fingerprinting
                protection that randomizes canvas values.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Bigger Picture</h3>
            <p>
              Canvas fingerprinting is just one piece of the browser fingerprinting puzzle. Trackers combine
              it with WebGL fingerprinting, audio context fingerprinting, font enumeration, and dozens of
              other signals to create comprehensive profiles.
            </p>
            <p>
              The privacy implications are real: a 2019 study found that 74% of the Alexa top 10,000 sites
              use at least one fingerprinting technique. Major players like Google, Facebook, and data brokers
              have built sophisticated fingerprinting systems that work across their vast ad networks.
            </p>
            <p>
              Understanding canvas fingerprinting is the first step to taking control of your digital privacy.
              Run the test above to see your own fingerprint, then explore the protection options that work
              best for your needs.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Quick Facts: Canvas Fingerprinting</h4>
              <ul className="text-sm space-y-2">
                <li>• First documented by researchers in 2012</li>
                <li>• Used by 5% of the top 100,000 websites (2020 data)</li>
                <li>• Cannot be cleared like cookies or local storage</li>
                <li>• Works in private/incognito browsing mode</li>
                <li>• Accuracy increases when combined with other fingerprinting methods</li>
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
