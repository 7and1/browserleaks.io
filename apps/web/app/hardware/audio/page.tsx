'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { LabShell } from '@/components/layout/LabShell';
import { AudioFingerprint, type AudioFingerprintResult } from '@/lib/fingerprint/audio';

export default function AudioFingerprintPage() {
  const [result, setResult] = useState<AudioFingerprintResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const runTest = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const detector = new AudioFingerprint();
      const data = await detector.detect();
      setResult(data);

      // Generate waveform visualization data
      if (data.isSupported) {
        const waveform = generateWaveformData();
        setWaveformData(waveform);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audio fingerprint detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runTest();
  }, [runTest]);

  // Draw waveform
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Waveform
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const sliceWidth = width / waveformData.length;
    let x = 0;

    for (let i = 0; i < waveformData.length; i++) {
      const v = waveformData[i];
      const y = (v * height) / 2 + height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();

    // Glow effect
    ctx.shadowColor = '#22d3ee';
    ctx.shadowBlur = 10;
    ctx.stroke();
  }, [waveformData]);

  const statusReadings = useMemo(() => [
    {
      label: 'Status',
      value: result?.isSupported ? 'DETECTED' : loading ? 'SCANNING' : 'N/A',
      tone: result?.isSupported ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Sample Rate',
      value: result?.sampleRate ? `${result.sampleRate}Hz` : '---',
      tone: result?.sampleRate ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Channels',
      value: result?.channelCount?.toString() || '---',
      tone: result?.channelCount ? 'active' as const : 'neutral' as const,
    },
  ], [result, loading]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={runTest}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Sensor Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Audio Fingerprint Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze AudioContext fingerprinting that reveals unique audio processing characteristics of your device.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Audio Visualization */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Audio Fingerprint Waveform
            </p>

            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              className="w-full h-40 rounded border border-slate-700"
            />

            {result?.hash && (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Fingerprint Hash</p>
                <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950/50 p-3 rounded">
                  {result.hash}
                </div>
              </div>
            )}
          </div>

          {/* Audio Context Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              AudioContext Properties
            </p>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-slate-500">
                Analyzing audio stack...
              </div>
            ) : result?.isSupported ? (
              <div className="space-y-4">
                <ResultRow label="Sample Rate" value={`${result.sampleRate} Hz`} />
                <ResultRow label="Max Channels" value={result.channelCount.toString()} />
                <ResultRow label="Base Latency" value={result.audioContext.baseLatency?.toFixed(6) || 'N/A'} />
                <ResultRow label="Output Latency" value={result.audioContext.outputLatency?.toFixed(6) || 'N/A'} />
                <ResultRow label="Context State" value={result.audioContext.state} />

                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Your audio fingerprint is unique and can identify your browser across sessions.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center">
                <span className="text-cyan-400">AudioContext Not Available</span>
                <span className="text-sm text-slate-500 mt-2">
                  Your browser may block or not support the Web Audio API
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DynamicsCompressor Fingerprint */}
        {result?.dynamicsCompressorFingerprint && result.dynamicsCompressorFingerprint !== 'unsupported' && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              DynamicsCompressor Fingerprint
            </p>

            <p className="text-sm text-slate-400 mb-4">
              The DynamicsCompressor node&apos;s default values vary across browsers and platforms, creating a fingerprint.
            </p>

            <div className="font-mono text-sm text-cyan-300 bg-slate-950/50 p-4 rounded">
              {result.dynamicsCompressorFingerprint.split('|').map((value, i) => {
                const labels = ['threshold', 'knee', 'ratio', 'attack', 'release'];
                return (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-800 last:border-none">
                    <span className="text-slate-400">{labels[i]}:</span>
                    <span>{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="lab-panel p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Audio Fingerprinting: Your Sound Card Is Unique
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Every device processes audio slightly differently. By measuring how your browser handles
              audio signals, websites can create a fingerprint that&apos;s remarkably stable and unique.
              This technique works without playing any audible sound.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Audio Fingerprinting Works</h3>
            <p>
              The technique uses the Web Audio API to generate and process an audio signal:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Create an oscillator with a specific frequency</li>
              <li>Route it through audio processing nodes (compressor, gain, etc.)</li>
              <li>Capture the processed output waveform</li>
              <li>Generate a hash from the output values</li>
            </ol>
            <p>
              The same input produces different outputs on different devices because of variations
              in audio drivers, hardware, and browser implementations.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Sources of Variation</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Hardware Factors</h4>
                <ul className="text-sm space-y-1">
                  <li>Sound card model and chipset</li>
                  <li>Audio DAC characteristics</li>
                  <li>Sample rate capabilities</li>
                  <li>Bit depth support</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Software Factors</h4>
                <ul className="text-sm space-y-1">
                  <li>Audio driver version</li>
                  <li>Browser audio implementation</li>
                  <li>OS audio stack (ALSA, CoreAudio, WASAPI)</li>
                  <li>FFT implementation differences</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The DynamicsCompressor Trick</h3>
            <p>
              One particularly effective fingerprinting method uses the DynamicsCompressor audio node.
              When created with default parameters, different browsers/platforms report slightly
              different values for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">threshold</strong> - Level at which compression starts</li>
              <li><strong className="text-slate-300">knee</strong> - Range above threshold for soft compression</li>
              <li><strong className="text-slate-300">ratio</strong> - Input/output ratio above threshold</li>
              <li><strong className="text-slate-300">attack</strong> - Time to apply full compression</li>
              <li><strong className="text-slate-300">release</strong> - Time to release compression</li>
            </ul>
            <p>
              These minor variations in default values create a reliable fingerprint.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Research Findings</h3>
            <p>
              Studies on audio fingerprinting have shown:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">High stability</strong> - Audio fingerprints rarely
                change unless hardware or drivers are modified.
              </li>
              <li>
                <strong className="text-slate-300">Moderate uniqueness</strong> - About 5-6 bits of entropy,
                distinguishing roughly 32-64 device classes.
              </li>
              <li>
                <strong className="text-slate-300">Cross-browser correlation</strong> - Similar hardware
                produces similar fingerprints across browsers.
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Comparison with Other Methods</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Method</th>
                  <th className="text-left py-2 text-slate-300">Entropy</th>
                  <th className="text-left py-2 text-slate-300">Stability</th>
                  <th className="text-left py-2 text-slate-300">Detectability</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Audio</td>
                  <td className="py-2">5-6 bits</td>
                  <td className="py-2 text-cyan-400">Excellent</td>
                  <td className="py-2">Low</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Canvas</td>
                  <td className="py-2">10-15 bits</td>
                  <td className="py-2 text-cyan-400">Good</td>
                  <td className="py-2">Medium</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">WebGL</td>
                  <td className="py-2">15-20 bits</td>
                  <td className="py-2 text-cyan-400">Excellent</td>
                  <td className="py-2">Low</td>
                </tr>
                <tr>
                  <td className="py-2">Fonts</td>
                  <td className="py-2">10-15 bits</td>
                  <td className="py-2 text-orange-400">Moderate</td>
                  <td className="py-2">Medium</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Real-World Usage</h3>
            <p>
              Audio fingerprinting is used by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ad tech companies for cross-site tracking</li>
              <li>Anti-fraud services to identify devices</li>
              <li>Bot detection systems</li>
              <li>Commercial fingerprinting libraries like FingerprintJS</li>
            </ul>
            <p>
              A 2016 study found audio fingerprinting scripts on over 67% of the top 10,000 websites.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Protection Methods</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Adds noise to audio output,
                making fingerprints less unique.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Modifies
                AudioContext behavior to reduce fingerprint entropy.
              </li>
              <li>
                <strong className="text-slate-300">Brave Browser</strong> - Randomizes audio fingerprint
                values.
              </li>
              <li>
                <strong className="text-slate-300">Disable Web Audio</strong> - Not recommended as it
                breaks many legitimate sites.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Audio fingerprinting works without playing audible sound</li>
                <li>Hardware and driver variations create unique signatures</li>
                <li>Provides moderate entropy but excellent stability</li>
                <li>DynamicsCompressor defaults are particularly revealing</li>
                <li>Tor Browser and resistFingerprinting provide protection</li>
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

function generateWaveformData(): number[] {
  const length = 200;
  const data: number[] = [];

  for (let i = 0; i < length; i++) {
    // Generate a complex waveform that mimics audio fingerprint output
    const t = i / length;
    const sine1 = Math.sin(t * Math.PI * 4);
    const sine2 = Math.sin(t * Math.PI * 8) * 0.5;
    const sine3 = Math.sin(t * Math.PI * 16) * 0.25;
    const noise = (Math.random() - 0.5) * 0.1;

    data.push((sine1 + sine2 + sine3 + noise) * 0.4);
  }

  return data;
}
