'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { FontFingerprint, type FontFingerprintResult } from '@/lib/fingerprint/fonts';

export default function FontDetectionPage() {
  const [result, setResult] = useState<FontFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const riskLevel = result ? (
    result.fontCount > 50 ? 'HIGH' : result.fontCount > 30 ? 'MEDIUM' : 'LOW'
  ) : 'UNKNOWN';

  const statusReadings = [
    {
      label: 'Fonts Found',
      value: result?.fontCount?.toString() || loading ? 'SCANNING' : '0',
      tone: result?.fontCount && result.fontCount > 30 ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Risk Level',
      value: riskLevel,
      tone: riskLevel === 'HIGH' ? 'alert' as const : riskLevel === 'MEDIUM' ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Hash',
      value: result?.hash?.slice(0, 8) || '---',
      tone: result?.hash ? 'active' as const : 'neutral' as const,
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">Font Detection</h1>
          <p className="mt-2 text-sm text-slate-400">
            Discover which fonts are installed on your system - a powerful tracking vector.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Stats */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Detection Results
            </p>

            <div className="space-y-6">
              <div className="text-center py-4">
                <p className="text-5xl font-light text-cyan-300">{result?.fontCount || 0}</p>
                <p className="text-sm text-slate-500 mt-2">Fonts Detected</p>
              </div>

              <ResultRow label="Detection Method" value="Width Comparison" />
              <ResultRow label="Fonts Tested" value="200+" />
              <ResultRow label="Uniqueness Risk" value={riskLevel} />
            </div>

            {result?.fontCount && result.fontCount > 30 && (
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                <p className="text-sm text-orange-300">
                  ⚠️ You have {result.fontCount} unique fonts, making your browser highly trackable.
                </p>
              </div>
            )}
          </div>

          {/* Font List */}
          <div className="lab-panel p-6 lg:col-span-2">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Detected Fonts
            </p>

            {result?.availableFonts && result.availableFonts.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {result.availableFonts.map((font, i) => (
                    <div
                      key={i}
                      className="text-sm font-mono text-slate-300 py-2 px-3 bg-slate-800/40 rounded hover:bg-slate-800/60 transition-colors"
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                {loading ? 'Detecting fonts...' : 'Click scan to detect fonts'}
              </div>
            )}
          </div>
        </div>

        {/* Hash */}
        {result?.hash && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Font Fingerprint Hash
            </p>
            <div className="font-mono text-cyan-300 break-all bg-slate-950/50 p-4 rounded">
              {result.hash}
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Educational Content */}
        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Font Fingerprinting: Your Typography Tells Your Story
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every time you install Microsoft Office, Adobe Creative Suite, or even a quirky
              free font you liked - you&apos;re making yourself more trackable. Font fingerprinting
              exploits the fact that no two computers have exactly the same set of fonts installed.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Font Detection Works</h3>
            <p>
              Websites can&apos;t directly query your installed fonts list (that would be too easy to
              detect and block). Instead, they use a clever side-channel attack:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create a hidden text element with a specific test string</li>
              <li>First render it with a known fallback font (like monospace)</li>
              <li>Measure the element&apos;s width and height</li>
              <li>Then set the font-family to a test font + fallback</li>
              <li>Measure again - if dimensions changed, the font is installed</li>
            </ol>
            <p>
              This process repeats for 200-500 common fonts. Each font that&apos;s detected or
              not detected becomes a bit in your fingerprint. The whole scan takes under a second.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Numbers: Font Diversity</h3>
            <p>
              Font fingerprinting is effective because of massive font diversity:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Windows 11 ships with approximately <strong className="text-slate-300">180 fonts</strong></li>
              <li>macOS Sonoma includes about <strong className="text-slate-300">250 fonts</strong></li>
              <li>Linux distributions vary from <strong className="text-slate-300">20 to 150 fonts</strong></li>
              <li>Adobe CC users may have <strong className="text-slate-300">400+ additional fonts</strong></li>
              <li>Microsoft Office adds another <strong className="text-slate-300">60-80 fonts</strong></li>
            </ul>
            <p>
              According to the Electronic Frontier Foundation&apos;s Panopticlick study, font
              fingerprinting alone provides approximately <strong className="text-slate-300">13.9 bits of entropy</strong> -
              enough to uniquely identify 1 in 15,000 browsers.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Fonts Reveal About You</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Operating System</h4>
                <ul className="text-sm space-y-1">
                  <li>• San Francisco → macOS/iOS</li>
                  <li>• Segoe UI → Windows</li>
                  <li>• Roboto → Android/Chrome OS</li>
                  <li>• DejaVu → Linux</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Installed Software</h4>
                <ul className="text-sm space-y-1">
                  <li>• Minion Pro → Adobe products</li>
                  <li>• Calibri → Microsoft Office</li>
                  <li>• Source Code Pro → Developer tools</li>
                  <li>• Helvetica Neue → macOS/design apps</li>
                </ul>
              </div>
            </div>
            <p>
              A designer with Adobe CC and Microsoft Office has a radically different font
              profile than a Linux developer who only uses open-source fonts. Trackers can
              infer your profession, interests, and even economic status from your fonts.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Font Enumeration Techniques</h3>
            <p>
              Beyond the basic width-measurement technique, trackers use several methods:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Canvas font rendering</strong> - Draw text
                with different fonts and compare pixel-level differences
              </li>
              <li>
                <strong className="text-slate-300">CSS font-face probing</strong> - Use @font-face
                rules to detect if local fonts load
              </li>
              <li>
                <strong className="text-slate-300">Flash/Silverlight enumeration</strong> - Legacy
                plugins could directly list fonts (now mostly obsolete)
              </li>
              <li>
                <strong className="text-slate-300">JavaScript Font API</strong> - Modern browsers
                expose document.fonts (with some restrictions)
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Prevalence in the Wild</h3>
            <p>
              Font fingerprinting is widespread. Research shows:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">12.7%</strong> of the top 10,000 websites use font fingerprinting</li>
              <li>Major fingerprinting libraries (FingerprintJS, ClientJS) all include it</li>
              <li>Analytics providers like Heap and Mixpanel collect font data</li>
              <li>Fraud detection services rely heavily on font signals</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <p>
              Font fingerprinting is particularly hard to defend against:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Limits fonts to a
                standard set, making all users look similar. Trade-off: text may look worse.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Reports
                only system fonts, hiding your custom installations.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Randomizes font
                enumeration results per session.
              </li>
              <li>
                <strong className="text-slate-300">Remove custom fonts</strong> - Stick to
                system defaults only. Impractical for designers.
              </li>
              <li>
                <strong className="text-slate-300">Font Fingerprint Defender extension</strong> -
                Blocks font enumeration scripts.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Catch-22</h3>
            <p>
              Here&apos;s the privacy paradox with fonts: if you aggressively block font
              enumeration, you become one of the rare users doing so - which itself is
              identifying. The most effective defense is using a browser where many users
              share the same font-blocking behavior (like Tor).
            </p>
            <p>
              For most people, the practical advice is to be aware that your font selection
              contributes to your fingerprint, and consider it when making privacy decisions
              about browser choice and system configuration.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Font Fingerprinting Facts</h4>
              <ul className="text-sm space-y-2">
                <li>• Average computer has 100-400 installed fonts</li>
                <li>• Each installed application can add unique fonts</li>
                <li>• Provides ~14 bits of identifying entropy</li>
                <li>• Used by 12%+ of top websites</li>
                <li>• One of the most stable fingerprint signals (fonts rarely change)</li>
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
