'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { ClientRectsFingerprint, type ClientRectsFingerprintResult } from '@/lib/fingerprint/clientRects';

export default function ClientRectsFingerprintPage() {
  const [result, setResult] = useState<ClientRectsFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new ClientRectsFingerprint();
      const data = await detector.detect();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Client rects detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-orange-400';
      default: return 'text-cyan-400';
    }
  };

  const statusReadings = [
    {
      label: 'Elements',
      value: result?.measurements?.length?.toString() || (loading ? 'SCANNING' : '0'),
      tone: result?.measurements?.length ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Uniqueness',
      value: result?.uniquenessScore ? `${result.uniquenessScore.toFixed(0)}%` : '---',
      tone: result?.uniquenessScore && result.uniquenessScore > 50 ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Risk',
      value: result?.riskLevel?.toUpperCase() || 'UNKNOWN',
      tone: result?.riskLevel === 'high' ? 'alert' as const : 'active' as const,
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
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Identity Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Client Rects Fingerprint Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Measure DOM element dimensions that vary based on your browser, fonts, and rendering engine.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Analysis Summary
            </p>

            <div className="space-y-4">
              <ResultRow label="Detection Supported" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Elements Measured" value={result?.measurements?.length?.toString() || '0'} />
              <ResultRow
                label="Uniqueness Score"
                value={result?.uniquenessScore ? `${result.uniquenessScore.toFixed(1)}%` : '---'}
              />
              <ResultRow
                label="Risk Level"
                value={result?.riskLevel?.toUpperCase() || '---'}
                valueClassName={getRiskColor(result?.riskLevel || '')}
              />

              {result?.hash && (
                <div className="mt-6">
                  <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-2">
                    Fingerprint Hash
                  </p>
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
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              How It Works
            </p>

            <div className="space-y-4 text-sm text-slate-400">
              <p>
                This test creates hidden DOM elements and measures their exact dimensions using
                <code className="bg-slate-800 px-1 mx-1 rounded">getBoundingClientRect()</code>.
              </p>
              <p>
                Even with identical HTML and CSS, different browsers render elements with slightly
                different pixel dimensions due to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Font rendering algorithms</li>
                <li>Sub-pixel positioning</li>
                <li>Default form element styles</li>
                <li>Browser zoom level handling</li>
                <li>Display scaling (DPI)</li>
              </ul>
              <p>
                These tiny variations create a measurable fingerprint.
              </p>
            </div>
          </div>
        </div>

        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Element Measurements
          </p>

          {loading ? (
            <div className="text-center text-slate-500 py-8">Measuring elements...</div>
          ) : result?.measurements?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="py-2 text-slate-400 font-medium">Element</th>
                    <th className="py-2 text-slate-400 font-medium">Width</th>
                    <th className="py-2 text-slate-400 font-medium">Height</th>
                    <th className="py-2 text-slate-400 font-medium">X</th>
                    <th className="py-2 text-slate-400 font-medium">Y</th>
                  </tr>
                </thead>
                <tbody>
                  {result.measurements.map((m, i) => (
                    <tr key={i} className="border-b border-slate-800/60">
                      <td className="py-2 text-slate-300 font-mono">{m.elementType}</td>
                      <td className="py-2 text-cyan-300 font-mono">{m.width.toFixed(4)}</td>
                      <td className="py-2 text-cyan-300 font-mono">{m.height.toFixed(4)}</td>
                      <td className="py-2 text-slate-400 font-mono">{m.x.toFixed(2)}</td>
                      <td className="py-2 text-slate-400 font-mono">{m.y.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">No measurements available</div>
          )}
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Client Rects Fingerprinting: The Pixel-Perfect Tracker
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Your browser renders web pages down to sub-pixel precision. But here&apos;s the thing: &quot;sub-pixel
              precision&quot; varies between browsers, operating systems, and even display configurations. Websites
              can measure these microscopic differences to fingerprint you.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Are Client Rects?</h3>
            <p>
              Every HTML element has a &quot;bounding box&quot; - the rectangular area it occupies on screen. The
              <code className="bg-slate-800 px-1 rounded">getBoundingClientRect()</code> method returns this
              box&apos;s exact position and dimensions: width, height, top, left, right, bottom.
            </p>
            <p>
              For inline elements that wrap across multiple lines, <code className="bg-slate-800 px-1 rounded">getClientRects()</code>
              returns an array of rectangles - one for each line. These measurements are reported with
              floating-point precision (like 147.359375 pixels), not round numbers.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why Do Measurements Vary?</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Text Rendering</h4>
                <ul className="text-sm space-y-1">
                  <li>Font hinting algorithms differ</li>
                  <li>Subpixel antialiasing (ClearType, etc.)</li>
                  <li>Font fallback chains vary</li>
                  <li>Text shaping engines (HarfBuzz, DirectWrite)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Browser Differences</h4>
                <ul className="text-sm space-y-1">
                  <li>Default form element styles</li>
                  <li>Padding/margin calculations</li>
                  <li>Border rendering</li>
                  <li>Zoom level rounding</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The Technical Details</h3>
            <p>
              Here&apos;s what makes client rects fingerprinting particularly effective:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Sub-pixel precision</strong> - Modern browsers report
                measurements as doubles, not integers. A difference of 0.00001 pixels is detectable.
              </li>
              <li>
                <strong className="text-slate-300">No user interaction needed</strong> - Unlike some fingerprinting
                methods, client rects can be measured silently on page load.
              </li>
              <li>
                <strong className="text-slate-300">Stable across sessions</strong> - Unless you change browsers,
                fonts, or display settings, measurements remain consistent.
              </li>
              <li>
                <strong className="text-slate-300">Hard to spoof</strong> - Randomizing measurements would break
                legitimate layout calculations that many sites depend on.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Real-World Research</h3>
            <p>
              Studies on client rects fingerprinting have found:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                A 2016 Princeton study found client rects added <strong className="text-slate-300">3.5 bits of entropy</strong> to
                browser fingerprints.
              </li>
              <li>
                Emoji rendering shows the highest variation - different emoji fonts produce wildly different sizes.
              </li>
              <li>
                Form elements (<code className="bg-slate-800 px-1 rounded">&lt;input&gt;</code>,
                <code className="bg-slate-800 px-1 rounded">&lt;select&gt;</code>) vary most between browsers.
              </li>
              <li>
                The technique is used by commercial fingerprinting services including FingerprintJS.
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Comparison with Canvas Fingerprinting</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Aspect</th>
                  <th className="text-left py-2 text-slate-300">Client Rects</th>
                  <th className="text-left py-2 text-slate-300">Canvas</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Entropy</td>
                  <td className="py-2">3-5 bits</td>
                  <td className="py-2">10-15 bits</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Detection ease</td>
                  <td className="py-2">Very hard</td>
                  <td className="py-2">Moderate</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Protection available</td>
                  <td className="py-2">Limited</td>
                  <td className="py-2">Good</td>
                </tr>
                <tr>
                  <td className="py-2">Performance impact</td>
                  <td className="py-2">Minimal</td>
                  <td className="py-2">Low</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Rounds measurements to integers,
                reducing fingerprint uniqueness but potentially breaking some layouts.
              </li>
              <li>
                <strong className="text-slate-300">Firefox letterboxing</strong> - Adds slight margin variations
                to window size, which affects element positioning.
              </li>
              <li>
                <strong className="text-slate-300">resistFingerprinting</strong> - Firefox&apos;s fingerprinting
                protection includes some client rect defenses.
              </li>
              <li>
                <strong className="text-slate-300">Standardize fonts</strong> - Using only common system fonts
                reduces text rendering variations.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Bigger Picture</h3>
            <p>
              Client rects fingerprinting isn&apos;t the most powerful tracking technique on its own. But combined
              with canvas, WebGL, audio, and font fingerprinting, it adds another dimension to your unique
              browser identity.
            </p>
            <p>
              What makes it concerning is how difficult it is to detect and prevent. Legitimate websites
              use getBoundingClientRect() constantly for layout calculations, tooltips, animations, and more.
              Blocking it would break the web. And because measurements are so precise, even small randomization
              can cause visible layout issues.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Client rects expose sub-pixel rendering differences</li>
                <li>Form elements and emoji show the most variation</li>
                <li>Adds 3-5 bits of entropy to fingerprints</li>
                <li>Nearly impossible to block without breaking websites</li>
                <li>Tor Browser rounds measurements to reduce uniqueness</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function ResultRow({
  label,
  value,
  valueClassName = 'text-cyan-200'
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-none">
      <span className="text-sm text-slate-400">{label}</span>
      <span className={`font-mono text-sm ${valueClassName}`}>{value}</span>
    </div>
  );
}
