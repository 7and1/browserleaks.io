'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface BrowserInfo {
  userAgent: string;
  platform: string;
  vendor: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
  maxTouchPoints: number;
  pdfViewerEnabled: boolean;
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
    orientation: string;
  };
  storage: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
  };
  features: {
    webGL: boolean;
    webGL2: boolean;
    webRTC: boolean;
    serviceWorker: boolean;
    webAssembly: boolean;
    bluetooth: boolean;
    usb: boolean;
    midi: boolean;
  };
}

function detectBrowserInfo(): BrowserInfo {
  const nav = navigator;
  const scr = screen;

  const testStorage = (type: 'localStorage' | 'sessionStorage'): boolean => {
    try {
      const storage = window[type];
      const key = '__test__';
      storage.setItem(key, key);
      storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  };

  const testFeature = (check: () => boolean): boolean => {
    try {
      return check();
    } catch {
      return false;
    }
  };

  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    vendor: nav.vendor,
    language: nav.language,
    languages: Array.from(nav.languages || []),
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    hardwareConcurrency: nav.hardwareConcurrency || 0,
    deviceMemory: (nav as Navigator & { deviceMemory?: number }).deviceMemory,
    maxTouchPoints: nav.maxTouchPoints || 0,
    pdfViewerEnabled: (nav as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled ?? false,
    screen: {
      width: scr.width,
      height: scr.height,
      colorDepth: scr.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: scr.orientation?.type || 'unknown',
    },
    storage: {
      localStorage: testStorage('localStorage'),
      sessionStorage: testStorage('sessionStorage'),
      indexedDB: testFeature(() => !!window.indexedDB),
    },
    features: {
      webGL: testFeature(() => !!document.createElement('canvas').getContext('webgl')),
      webGL2: testFeature(() => !!document.createElement('canvas').getContext('webgl2')),
      webRTC: testFeature(() => !!(window.RTCPeerConnection || (window as Window & { webkitRTCPeerConnection?: unknown }).webkitRTCPeerConnection)),
      serviceWorker: testFeature(() => 'serviceWorker' in navigator),
      webAssembly: testFeature(() => typeof WebAssembly === 'object'),
      bluetooth: testFeature(() => 'bluetooth' in navigator),
      usb: testFeature(() => 'usb' in navigator),
      midi: testFeature(() => 'requestMIDIAccess' in navigator),
    },
  };
}

export default function BrowserFingerprintPage() {
  const [result, setResult] = useState<BrowserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const data = detectBrowserInfo();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Browser detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const enabledFeatures = result?.features
    ? Object.values(result.features).filter(Boolean).length
    : 0;

  const statusReadings = [
    {
      label: 'Platform',
      value: result?.platform || loading ? 'DETECTING' : '---',
      tone: result?.platform ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'CPU Cores',
      value: result?.hardwareConcurrency?.toString() || '---',
      tone: result?.hardwareConcurrency ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Features',
      value: `${enabledFeatures}/8`,
      tone: enabledFeatures > 5 ? 'alert' as const : 'active' as const,
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">Browser Fingerprint</h1>
          <p className="mt-2 text-sm text-slate-400">
            Comprehensive analysis of your browser&apos;s identifying characteristics.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Navigator */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Navigator Properties
            </p>
            <div className="space-y-3">
              <ResultRow label="Platform" value={result?.platform || '---'} />
              <ResultRow label="Vendor" value={result?.vendor || '---'} />
              <ResultRow label="Language" value={result?.language || '---'} />
              <ResultRow label="Languages" value={result?.languages?.length?.toString() || '0'} />
              <ResultRow label="Cookies" value={result?.cookieEnabled ? 'Enabled' : 'Disabled'} />
              <ResultRow label="Do Not Track" value={result?.doNotTrack || 'Not set'} />
              <ResultRow label="Touch Points" value={result?.maxTouchPoints?.toString() || '0'} />
              <ResultRow label="PDF Viewer" value={result?.pdfViewerEnabled ? 'Yes' : 'No'} />
            </div>
          </div>

          {/* Hardware */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Hardware Info
            </p>
            <div className="space-y-3">
              <ResultRow label="CPU Cores" value={result?.hardwareConcurrency?.toString() || '---'} />
              <ResultRow label="Device Memory" value={result?.deviceMemory ? `${result.deviceMemory} GB` : 'Hidden'} />
              <ResultRow label="Screen" value={result?.screen ? `${result.screen.width}x${result.screen.height}` : '---'} />
              <ResultRow label="Color Depth" value={result?.screen?.colorDepth ? `${result.screen.colorDepth}-bit` : '---'} />
              <ResultRow label="Pixel Ratio" value={result?.screen?.pixelRatio?.toString() || '---'} />
              <ResultRow label="Orientation" value={result?.screen?.orientation || '---'} />
            </div>
          </div>

          {/* Features */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Browser Features
            </p>
            <div className="space-y-3">
              <FeatureRow label="WebGL" enabled={result?.features.webGL} />
              <FeatureRow label="WebGL 2" enabled={result?.features.webGL2} />
              <FeatureRow label="WebRTC" enabled={result?.features.webRTC} />
              <FeatureRow label="Service Worker" enabled={result?.features.serviceWorker} />
              <FeatureRow label="WebAssembly" enabled={result?.features.webAssembly} />
              <FeatureRow label="Bluetooth API" enabled={result?.features.bluetooth} />
              <FeatureRow label="USB API" enabled={result?.features.usb} />
              <FeatureRow label="MIDI API" enabled={result?.features.midi} />
            </div>
          </div>
        </div>

        {/* User Agent */}
        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            User Agent String
          </p>
          <p className="font-mono text-sm text-cyan-200 break-all bg-slate-950/50 p-4 rounded">
            {result?.userAgent || 'Loading...'}
          </p>
        </div>

        {/* Storage */}
        <div className="lab-panel p-6">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
            Storage APIs
          </p>
          <div className="flex gap-6">
            <StorageIndicator label="localStorage" enabled={result?.storage.localStorage} />
            <StorageIndicator label="sessionStorage" enabled={result?.storage.sessionStorage} />
            <StorageIndicator label="IndexedDB" enabled={result?.storage.indexedDB} />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Educational Content */}
        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Browser Fingerprinting: The Complete Picture of Digital Identity
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every browser leaves traces - your screen size, installed plugins, preferred
              language, even how your CPU handles math operations. Individually, these seem
              harmless. Combined? They create a digital fingerprint that&apos;s more unique than
              you might imagine.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Anatomy of a Browser Fingerprint</h3>
            <p>
              A comprehensive browser fingerprint collects 40+ different signals:
            </p>
            <div className="grid md:grid-cols-3 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Navigator Object</h4>
                <ul className="text-sm space-y-1">
                  <li>• User Agent string</li>
                  <li>• Platform (OS)</li>
                  <li>• Language preferences</li>
                  <li>• Cookie enabled status</li>
                  <li>• Do Not Track setting</li>
                  <li>• Hardware concurrency</li>
                  <li>• Device memory</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Screen Properties</h4>
                <ul className="text-sm space-y-1">
                  <li>• Resolution (width x height)</li>
                  <li>• Color depth</li>
                  <li>• Pixel ratio (Retina)</li>
                  <li>• Available screen size</li>
                  <li>• Screen orientation</li>
                  <li>• Touch capabilities</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Browser APIs</h4>
                <ul className="text-sm space-y-1">
                  <li>• WebGL support</li>
                  <li>• Canvas rendering</li>
                  <li>• Audio processing</li>
                  <li>• Storage APIs</li>
                  <li>• Bluetooth/USB APIs</li>
                  <li>• Service Workers</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">How Unique Are You Really?</h3>
            <p>
              The Electronic Frontier Foundation&apos;s Panopticlick project studied millions of
              fingerprints and found startling results:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">83.6%</strong> of browsers have a unique fingerprint</li>
              <li><strong className="text-slate-300">94.2%</strong> are unique when Flash/Java plugins are considered</li>
              <li>Average fingerprint contains <strong className="text-slate-300">18.1 bits of entropy</strong></li>
              <li>That&apos;s enough to identify <strong className="text-slate-300">1 in 286,777 browsers</strong></li>
            </ul>
            <p>
              A 2020 follow-up study by researchers at KU Leuven found even higher uniqueness
              rates as browsers have become more feature-rich and diverse.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Entropy Breakdown</h3>
            <p>
              Not all fingerprint signals are equally valuable. Here&apos;s the approximate
              entropy contribution of each component:
            </p>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Signal</th>
                  <th className="text-right py-2 text-slate-300">Entropy (bits)</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800"><td className="py-2">User Agent</td><td className="text-right">10.0</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">Canvas fingerprint</td><td className="text-right">8.3</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">WebGL renderer</td><td className="text-right">7.2</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">Installed fonts</td><td className="text-right">6.1</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">Screen resolution</td><td className="text-right">4.8</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">Timezone</td><td className="text-right">3.0</td></tr>
                <tr className="border-b border-slate-800"><td className="py-2">Language</td><td className="text-right">2.8</td></tr>
                <tr><td className="py-2">Other signals</td><td className="text-right">5-10</td></tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Why Cookies Aren&apos;t Enough Anymore</h3>
            <p>
              The advertising industry developed fingerprinting specifically because cookies
              have weaknesses:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Cookies can be deleted</strong> - users clear them regularly</li>
              <li><strong className="text-slate-300">Private browsing blocks cookies</strong> - incognito mode is popular</li>
              <li><strong className="text-slate-300">Third-party cookies being phased out</strong> - Chrome, Safari, Firefox all restricting</li>
              <li><strong className="text-slate-300">GDPR consent requirements</strong> - many users reject tracking cookies</li>
            </ul>
            <p>
              Fingerprinting bypasses all of these. There&apos;s nothing to delete, nothing stored
              on your device, and no consent prompt required (though this may change with
              evolving regulations).
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Who Uses Browser Fingerprinting?</h3>
            <p>
              Fingerprinting has both legitimate and concerning uses:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-green-500/10 p-4 rounded border border-green-500/30">
                <h4 className="text-green-300 font-medium mb-2">Legitimate Uses</h4>
                <ul className="text-sm space-y-1">
                  <li>• Fraud detection (banking)</li>
                  <li>• Bot detection (security)</li>
                  <li>• Account security (detecting hijacking)</li>
                  <li>• Analytics (no PII collection)</li>
                </ul>
              </div>
              <div className="bg-red-500/10 p-4 rounded border border-red-500/30">
                <h4 className="text-red-300 font-medium mb-2">Privacy Concerns</h4>
                <ul className="text-sm space-y-1">
                  <li>• Cross-site tracking (advertising)</li>
                  <li>• Circumventing user consent</li>
                  <li>• Building shadow profiles</li>
                  <li>• Price discrimination</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The Arms Race: Detection vs Protection</h3>
            <p>
              Browser fingerprinting has sparked an ongoing battle:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">2010</strong> - Panopticlick demonstrates fingerprint uniqueness</li>
              <li><strong className="text-slate-300">2012</strong> - Canvas fingerprinting discovered in the wild</li>
              <li><strong className="text-slate-300">2016</strong> - Firefox adds fingerprinting protection</li>
              <li><strong className="text-slate-300">2019</strong> - Safari implements Intelligent Tracking Prevention</li>
              <li><strong className="text-slate-300">2020</strong> - Brave introduces farbling (randomization)</li>
              <li><strong className="text-slate-300">2023</strong> - Chrome announces Privacy Sandbox as alternative</li>
            </ul>
            <p>
              The industry is moving toward privacy-preserving alternatives, but fingerprinting
              remains widely deployed today.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - Standardizes all
                fingerprint values to match millions of other Tor users.
              </li>
              <li>
                <strong className="text-slate-300">Firefox with strict settings</strong> - Enable
                Enhanced Tracking Protection and resistFingerprinting.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Built-in fingerprint
                randomization that changes per-session.
              </li>
              <li>
                <strong className="text-slate-300">Minimize browser plugins</strong> - Each
                extension adds to your fingerprint uniqueness.
              </li>
              <li>
                <strong className="text-slate-300">Use common configurations</strong> - Stick to
                popular screen sizes, default fonts, standard settings.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Browser Fingerprinting Facts</h4>
              <ul className="text-sm space-y-2">
                <li>• 83%+ of browsers are uniquely identifiable via fingerprint</li>
                <li>• Fingerprinting works in private/incognito mode</li>
                <li>• No data is stored on your device - nothing to delete</li>
                <li>• Used by 10%+ of the top 10,000 websites</li>
                <li>• Major tech companies are developing alternatives</li>
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
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-none">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="font-mono text-xs text-cyan-200 truncate max-w-[150px]" title={value}>{value}</span>
    </div>
  );
}

function FeatureRow({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-none">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs font-mono ${enabled ? 'text-green-400' : 'text-slate-600'}`}>
        {enabled ? '✓ Enabled' : '✗ Disabled'}
      </span>
    </div>
  );
}

function StorageIndicator({ label, enabled }: { label: string; enabled?: boolean }) {
  return (
    <div className={`px-4 py-2 rounded border ${enabled ? 'border-green-500/30 bg-green-500/10' : 'border-slate-700 bg-slate-800/30'}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm font-mono ${enabled ? 'text-green-400' : 'text-slate-500'}`}>
        {enabled ? 'Available' : 'Blocked'}
      </p>
    </div>
  );
}
