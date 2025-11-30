'use client';

import { useState, useCallback, useEffect } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { AudioFingerprint, type AudioFingerprintResult } from '@/lib/fingerprint/audio';

export default function AudioFingerprintPage() {
  const [result, setResult] = useState<AudioFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new AudioFingerprint();
      const data = await detector.detect();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  const statusReadings = [
    {
      label: 'Audio API',
      value: result?.isSupported ? 'ENABLED' : loading ? 'SCANNING' : 'UNKNOWN',
      tone: result?.isSupported ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Sample Rate',
      value: result?.sampleRate ? `${result.sampleRate}Hz` : '---',
      tone: result?.sampleRate ? 'active' as const : 'neutral' as const,
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
          <h1 className="mt-2 text-4xl font-light text-slate-100">Audio Fingerprint</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect your browser&apos;s unique audio processing signature using the Web Audio API.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Audio Context Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Audio Context
            </p>

            <div className="space-y-4">
              <ResultRow label="Audio Support" value={result?.isSupported ? 'Yes' : 'No'} />
              <ResultRow label="Sample Rate" value={result?.sampleRate ? `${result.sampleRate} Hz` : '---'} />
              <ResultRow label="Channel Count" value={result?.channelCount?.toString() || '---'} />
              <ResultRow label="Context State" value={result?.audioContext?.state || '---'} />
              <ResultRow
                label="Base Latency"
                value={result?.audioContext?.baseLatency ? `${(result.audioContext.baseLatency * 1000).toFixed(2)}ms` : '---'}
              />
              <ResultRow
                label="Output Latency"
                value={result?.audioContext?.outputLatency ? `${(result.audioContext.outputLatency * 1000).toFixed(2)}ms` : '---'}
              />
            </div>
          </div>

          {/* Fingerprint Hash */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Audio Fingerprint Hash
            </p>

            {result?.hash ? (
              <div className="space-y-4">
                <div className="font-mono text-lg text-cyan-300 break-all bg-slate-950/50 p-4 rounded">
                  {result.hash}
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    ⚠️ Your audio fingerprint is derived from how your hardware processes audio signals.
                    This can uniquely identify your device across different websites.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {loading ? 'Generating audio fingerprint...' : 'Click scan to generate fingerprint'}
              </div>
            )}
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
            Audio Fingerprinting: The Sound of Surveillance
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              You can&apos;t hear it. You can&apos;t see it. But right now, websites can use your browser&apos;s
              audio processing to identify you. Audio fingerprinting turns your sound card into a
              tracking device - and it works even if your speakers are off.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Audio Fingerprinting Works</h3>
            <p>
              The Web Audio API was designed for legitimate purposes - music apps, games, audio editors.
              But it turns out that asking a browser to process audio creates a unique signature.
              Here&apos;s the trick:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>A website creates an AudioContext (an audio processing environment)</li>
              <li>It generates a simple audio signal using an oscillator</li>
              <li>The signal passes through audio processing nodes (compressor, analyser)</li>
              <li>The output is sampled and converted to a numeric hash</li>
              <li>That hash becomes your &quot;audio fingerprint&quot;</li>
            </ol>
            <p>
              The whole process takes milliseconds and produces no audible sound. You&apos;d never
              know it happened unless you were specifically looking for it.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Why Audio Processing Is Unique</h3>
            <p>
              When you process audio digitally, dozens of factors influence the exact output:
            </p>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Hardware Variables</h4>
                <ul className="text-sm space-y-1">
                  <li>• Audio chip manufacturer</li>
                  <li>• DAC (Digital-to-Analog Converter) quality</li>
                  <li>• Sample rate capabilities</li>
                  <li>• Bit depth support</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Software Variables</h4>
                <ul className="text-sm space-y-1">
                  <li>• Operating system audio stack</li>
                  <li>• Browser audio implementation</li>
                  <li>• Audio driver version</li>
                  <li>• Sample processing algorithms</li>
                </ul>
              </div>
            </div>
            <p>
              The result? Two MacBooks with identical specs can produce different audio fingerprints
              if they have different driver versions. A Windows laptop and a Linux laptop with the
              same audio chip will definitely differ.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Research Behind It</h3>
            <p>
              Audio fingerprinting was first documented by researchers at Princeton University in their
              2016 paper &quot;The Web Never Forgets.&quot; Key findings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Audio fingerprinting found on <strong className="text-slate-300">0.67%</strong> of top 1 million sites</li>
              <li><strong className="text-slate-300">58.3%</strong> of browsers produce unique audio fingerprints</li>
              <li>When combined with canvas fingerprinting, uniqueness exceeds <strong className="text-slate-300">90%</strong></li>
              <li>The fingerprint remains stable across browser restarts and cache clears</li>
            </ul>
            <p>
              A follow-up 2020 study found audio fingerprinting had spread to 4.5% of the top 10,000
              sites - a nearly 7x increase in prevalence.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">AudioContext: The Technical Details</h3>
            <p>
              The Web Audio API exposes several properties that contribute to your fingerprint:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Sample Rate</strong> - Usually 44100Hz or 48000Hz, but can vary</li>
              <li><strong className="text-slate-300">Channel Count</strong> - Number of audio channels (usually 2)</li>
              <li><strong className="text-slate-300">Base Latency</strong> - Processing delay in milliseconds</li>
              <li><strong className="text-slate-300">Output Latency</strong> - Time before sound reaches speakers</li>
              <li><strong className="text-slate-300">Destination Node</strong> - Output device characteristics</li>
            </ul>
            <p>
              But the real fingerprint comes from the actual audio processing. When an oscillator
              generates a signal and it passes through a compressor or dynamics node, the exact
              output values depend on your specific hardware/software combination.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Who Uses Audio Fingerprinting?</h3>
            <p>
              Audio fingerprinting is deployed by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Advertising networks</strong> - For cross-site tracking</li>
              <li><strong className="text-slate-300">Fraud detection services</strong> - To identify suspicious users</li>
              <li><strong className="text-slate-300">Analytics companies</strong> - For &quot;cookieless&quot; tracking</li>
              <li><strong className="text-slate-300">Bot detection</strong> - Headless browsers often lack proper audio APIs</li>
            </ul>
            <p>
              Notable fingerprinting libraries like FingerprintJS (now Fingerprint.com) include
              audio fingerprinting as part of their identification toolkit.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Protection Options</h3>
            <p>
              Defending against audio fingerprinting presents unique challenges:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Returns standardized audio
                responses. Most effective but may break audio-dependent sites.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Adds noise
                to AudioContext output. Enable in about:config.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Farbles (randomizes) audio
                API responses by default.
              </li>
              <li>
                <strong className="text-slate-300">Block Web Audio API</strong> - Extensions like
                AudioContext Fingerprint Defender can block or spoof the API.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">The Bigger Picture</h3>
            <p>
              Audio fingerprinting represents a broader trend in browser tracking: exploiting
              legitimate APIs for surveillance purposes. The Web Audio API was created for creative
              applications, not tracking. But any API that reveals hardware characteristics can
              potentially be weaponized.
            </p>
            <p>
              Browser vendors are gradually adding protections. Firefox&apos;s Enhanced Tracking
              Protection now includes audio fingerprinting defenses. Safari&apos;s Intelligent
              Tracking Prevention considers audio signals. But it&apos;s an ongoing arms race.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Audio Fingerprint Facts</h4>
              <ul className="text-sm space-y-2">
                <li>• Works silently without producing audible sound</li>
                <li>• Stable across sessions - clearing cookies doesn&apos;t change it</li>
                <li>• Contributes ~10-15 bits of entropy to your overall fingerprint</li>
                <li>• Prevalence has increased 7x between 2016 and 2020</li>
                <li>• Relatively new tracking technique still gaining adoption</li>
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
