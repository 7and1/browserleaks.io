'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { WebGLFingerprint, type WebGLFingerprintResult } from '@/lib/fingerprint/webgl';

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
      label: 'WebGL',
      value: result?.isSupported ? 'ENABLED' : loading ? 'SCANNING' : 'UNKNOWN',
      tone: result?.isSupported ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Vendor',
      value: result?.vendor?.slice(0, 15) || '---',
      tone: result?.vendor ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Extensions',
      value: result?.extensions?.length?.toString() || '0',
      tone: 'neutral' as const,
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">WebGL Fingerprint</h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze your GPU and WebGL configuration that reveals your hardware identity.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* GPU Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              GPU Information
            </p>

            <div className="space-y-4">
              <ResultRow label="WebGL Support" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Vendor" value={result?.vendor || '---'} />
              <ResultRow label="Renderer" value={result?.renderer || '---'} />
              <ResultRow label="Version" value={result?.version || '---'} />
              <ResultRow label="Hash" value={result?.hash?.slice(0, 16) || '---'} />
            </div>

            {result?.isSupported && (
              <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                <p className="text-sm text-orange-300">
                  ⚠️ Your GPU configuration creates a unique fingerprint that can identify your device.
                </p>
              </div>
            )}
          </div>

          {/* Extensions */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              WebGL Extensions ({result?.extensions?.length || 0})
            </p>

            {result?.extensions && result.extensions.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {result.extensions.map((ext, i) => (
                  <div key={i} className="text-xs font-mono text-slate-400 py-1 border-b border-slate-800/40 last:border-none">
                    {ext}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">
                {loading ? 'Loading extensions...' : 'No extensions detected'}
              </div>
            )}
          </div>
        </div>

        {/* Parameters */}
        {result?.parameters && Object.keys(result.parameters).length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              WebGL Parameters
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(result.parameters).slice(0, 15).map(([key, value]) => (
                <div key={key} className="flex justify-between text-xs py-1 border-b border-slate-800/40">
                  <span className="text-slate-500">{key}</span>
                  <span className="font-mono text-cyan-300">{String(value)}</span>
                </div>
              ))}
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
            WebGL Fingerprinting: Your GPU Is Telling On You
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Your graphics card is one of the most identifying pieces of hardware in your computer.
              And websites can query it directly without asking permission. That&apos;s WebGL fingerprinting
              in a nutshell - turning your GPU into a tracking beacon.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Technical Deep Dive</h3>
            <p>
              WebGL (Web Graphics Library) is a JavaScript API that renders 3D graphics in your browser.
              Think of it as OpenGL for the web. It powers everything from Google Maps 3D view to
              browser-based games to those fancy product configurators on e-commerce sites.
            </p>
            <p>
              Here&apos;s the thing: to render graphics properly, WebGL needs to know exactly what your
              GPU can do. Websites can query this information through two key strings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">WEBGL_debug_renderer_info</strong> - Reveals your exact GPU model</li>
              <li><strong className="text-slate-300">Unmasked vendor/renderer</strong> - Shows manufacturer and specific chip</li>
            </ul>
            <p>
              For example, instead of seeing &quot;Google Inc.&quot; (the browser vendor), trackers see
              &quot;NVIDIA GeForce RTX 3080&quot; - your actual hardware.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why GPU Fingerprinting Is So Effective</h3>
            <p>
              The GPU market is surprisingly diverse. According to Steam&apos;s hardware survey data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Over <strong className="text-slate-300">400 different GPU models</strong> are actively in use</li>
              <li>The most common GPU (integrated Intel graphics) has only <strong className="text-slate-300">~15% market share</strong></li>
              <li>Dedicated GPUs (NVIDIA/AMD) fragment into hundreds of specific variants</li>
            </ul>
            <p>
              When you combine GPU info with driver version, WebGL version, and supported extensions,
              the combinations explode into millions of possibilities. Research from Princeton&apos;s
              WebTAP project found that WebGL parameters alone can uniquely identify
              <strong className="text-slate-300"> 94.8%</strong> of devices in their dataset.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Information Gets Leaked?</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Direct Hardware Info</h4>
                <ul className="text-sm space-y-1">
                  <li>• GPU manufacturer (NVIDIA, AMD, Intel, Apple)</li>
                  <li>• Specific GPU model and variant</li>
                  <li>• Driver version</li>
                  <li>• VRAM size (sometimes)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Capability Parameters</h4>
                <ul className="text-sm space-y-1">
                  <li>• Maximum texture size</li>
                  <li>• Supported shader precision</li>
                  <li>• Antialiasing capabilities</li>
                  <li>• Extension support list</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">WebGL Extensions: The Hidden Fingerprint</h3>
            <p>
              Beyond the basic GPU info, WebGL extensions create another layer of fingerprinting.
              Each GPU/driver combination supports a different set of extensions - there are over
              100 possible WebGL extensions, and the specific combination your browser reports is
              highly identifying.
            </p>
            <p>
              A desktop with an NVIDIA RTX card might support 45 extensions. A MacBook Pro with
              Apple Silicon might support 38 different ones. An Android phone might have 52.
              The exact set becomes part of your fingerprint.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Real-World Tracking Usage</h3>
            <p>
              WebGL fingerprinting isn&apos;t theoretical - it&apos;s actively used. A study by researchers
              at KU Leuven found WebGL fingerprinting on:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">3.1%</strong> of the top 10,000 websites</li>
              <li>Major ad networks including Google, Facebook, and Amazon</li>
              <li>Fraud detection services (which arguably have legitimate uses)</li>
              <li>Analytics platforms that promise &quot;cookie-less tracking&quot;</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <p>
              Protecting against WebGL fingerprinting is tricky because many legitimate websites
              need WebGL to function. Here are your options:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Returns standardized WebGL
                values for all users. The gold standard but breaks many 3D websites.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Reports
                generic GPU info instead of real hardware. Enable via about:config.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Includes fingerprinting
                protection that can spoof or block WebGL queries.
              </li>
              <li>
                <strong className="text-slate-300">WebGL Fingerprint Defender extension</strong> -
                Randomizes reported values (may break some sites).
              </li>
              <li>
                <strong className="text-slate-300">Disable WebGL entirely</strong> - Nuclear option.
                Set webgl.disabled to true in Firefox. Breaks many modern websites.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Trade-Off Reality</h3>
            <p>
              Here&apos;s the uncomfortable truth: blocking or spoofing WebGL fingerprinting often
              makes you MORE unique, not less. If 99% of users have WebGL enabled with real
              values, the 1% blocking it stand out like a sore thumb.
            </p>
            <p>
              The most effective protection is using a browser that many privacy-conscious users
              choose (like Tor or Brave), so your &quot;protected&quot; fingerprint blends in with
              thousands of others making the same choice.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>• WebGL exposes your exact GPU model and driver version</li>
                <li>• Extension lists add another layer of uniqueness</li>
                <li>• Combined with other signals, WebGL enables 94%+ device identification</li>
                <li>• Protection exists but may make you more unique or break websites</li>
                <li>• Best defense: use privacy-focused browsers with large user bases</li>
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
      <span className="font-mono text-sm text-cyan-200 truncate max-w-[200px]" title={value}>{value}</span>
    </div>
  );
}
