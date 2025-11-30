'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface GPUInfo {
  vendor: string;
  renderer: string;
  version: string;
  shadingLanguageVersion: string;
  maxTextureSize: number;
  maxViewportDims: number[];
  maxRenderBufferSize: number;
  maxVertexAttribs: number;
  maxVertexUniformVectors: number;
  maxFragmentUniformVectors: number;
  maxVaryingVectors: number;
  aliasedLineWidthRange: number[];
  aliasedPointSizeRange: number[];
  maxTextureImageUnits: number;
  maxCombinedTextureImageUnits: number;
  extensions: string[];
}

interface BenchmarkResult {
  triangleScore: number;
  pixelScore: number;
  shaderScore: number;
  overallScore: number;
  fps: number;
  frameTime: number;
}

export default function GPUBenchmarkPage() {
  const [gpuInfo, setGPUInfo] = useState<GPUInfo | null>(null);
  const [benchmark, setBenchmark] = useState<BenchmarkResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const detectGPU = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;

      if (!gl) {
        setError('WebGL not supported');
        setGPUInfo(null);
        return;
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

      const info: GPUInfo = {
        vendor: debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          : gl.getParameter(gl.VENDOR),
        renderer: debugInfo
          ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          : gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVertexUniformVectors: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
        maxFragmentUniformVectors: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
        aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
        maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
        maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
        extensions: gl.getSupportedExtensions() || [],
      };

      setGPUInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GPU detection failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const runBenchmark = useCallback(async () => {
    if (!canvasRef.current) return;

    setBenchmarking(true);
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');

    if (!gl) {
      setError('WebGL not available for benchmark');
      setBenchmarking(false);
      return;
    }

    try {
      // Simple benchmark: measure frame time for basic operations
      const iterations = 100;
      let totalTime = 0;

      // Triangle rendering benchmark
      const triangleStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        gl.clearColor(Math.random(), Math.random(), Math.random(), 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
      const triangleTime = performance.now() - triangleStart;

      // Pixel fill benchmark
      const pixelStart = performance.now();
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      for (let i = 0; i < 10; i++) {
        gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      }
      const pixelTime = performance.now() - pixelStart;

      totalTime = triangleTime + pixelTime;

      const result: BenchmarkResult = {
        triangleScore: Math.round(10000 / triangleTime),
        pixelScore: Math.round(1000 / pixelTime),
        shaderScore: Math.round(gpuInfo?.maxFragmentUniformVectors || 0),
        overallScore: Math.round(50000 / totalTime),
        fps: Math.round(1000 / (totalTime / iterations)),
        frameTime: totalTime / iterations,
      };

      setBenchmark(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Benchmark failed');
    } finally {
      setBenchmarking(false);
    }
  }, [gpuInfo]);

  useEffect(() => {
    detectGPU();
  }, [detectGPU]);

  const statusReadings = useMemo(() => [
    {
      label: 'GPU',
      value: gpuInfo?.renderer?.slice(0, 15) || (loading ? 'SCANNING' : 'N/A'),
      tone: gpuInfo ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Score',
      value: benchmark?.overallScore?.toString() || '---',
      tone: benchmark ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: gpuInfo ? 'EXPOSED' : 'HIDDEN',
      tone: gpuInfo ? 'alert' as const : 'active' as const,
    },
  ], [gpuInfo, benchmark, loading]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading || benchmarking}
      onRunDiagnostics={detectGPU}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Sensor Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">GPU Benchmark & Detection</h1>
          <p className="mt-2 text-sm text-slate-400">
            Analyze your GPU hardware through WebGL to reveal device-specific rendering capabilities.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* GPU Info */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              GPU Information
            </p>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Detecting GPU...
              </div>
            ) : gpuInfo ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-1">Vendor</p>
                  <p className="text-lg text-cyan-300 font-mono truncate" title={gpuInfo.vendor}>
                    {gpuInfo.vendor}
                  </p>
                </div>

                <div className="p-4 bg-slate-800/50 rounded">
                  <p className="text-xs text-slate-500 mb-1">Renderer</p>
                  <p className="text-lg text-cyan-300 font-mono truncate" title={gpuInfo.renderer}>
                    {gpuInfo.renderer}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ResultRow label="WebGL Version" value={gpuInfo.version.split(' ')[0]} />
                  <ResultRow label="GLSL Version" value={gpuInfo.shadingLanguageVersion.split(' ')[0]} />
                </div>

                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Your GPU details are exposed and can uniquely identify your device.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500">
                GPU detection failed
              </div>
            )}
          </div>

          {/* Benchmark Canvas & Results */}
          <div className="lab-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">
                Performance Benchmark
              </p>
              <button
                onClick={runBenchmark}
                disabled={benchmarking || !gpuInfo}
                className="px-4 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded transition-colors"
              >
                {benchmarking ? 'Running...' : 'Run Benchmark'}
              </button>
            </div>

            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="w-full h-32 bg-slate-900 rounded border border-slate-700"
            />

            {benchmark ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <ScoreCard label="Overall Score" value={benchmark.overallScore} />
                <ScoreCard label="Triangle Score" value={benchmark.triangleScore} />
                <ScoreCard label="Pixel Score" value={benchmark.pixelScore} />
                <ScoreCard label="Est. FPS" value={benchmark.fps} />
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-4 text-center">
                Click &quot;Run Benchmark&quot; to test GPU performance
              </p>
            )}
          </div>
        </div>

        {/* GPU Parameters */}
        {gpuInfo && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              GPU Parameters (Fingerprinting Vectors)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ParamCard label="Max Texture Size" value={gpuInfo.maxTextureSize.toLocaleString()} />
              <ParamCard label="Max Viewport" value={`${gpuInfo.maxViewportDims[0]} x ${gpuInfo.maxViewportDims[1]}`} />
              <ParamCard label="Max Renderbuffer" value={gpuInfo.maxRenderBufferSize.toLocaleString()} />
              <ParamCard label="Vertex Attribs" value={gpuInfo.maxVertexAttribs.toString()} />
              <ParamCard label="Vertex Uniforms" value={gpuInfo.maxVertexUniformVectors.toString()} />
              <ParamCard label="Fragment Uniforms" value={gpuInfo.maxFragmentUniformVectors.toString()} />
              <ParamCard label="Varying Vectors" value={gpuInfo.maxVaryingVectors.toString()} />
              <ParamCard label="Texture Units" value={gpuInfo.maxTextureImageUnits.toString()} />
            </div>
          </div>
        )}

        {/* Extensions */}
        {gpuInfo?.extensions && gpuInfo.extensions.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Supported WebGL Extensions ({gpuInfo.extensions.length})
            </p>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {gpuInfo.extensions.map((ext, i) => (
                <span
                  key={i}
                  className="px-2 py-1 text-xs font-mono bg-slate-800/60 text-slate-300 rounded"
                >
                  {ext}
                </span>
              ))}
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
            GPU Fingerprinting: Your Graphics Card Tells All
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Your GPU is essentially a name tag for your computer. Through WebGL, websites can
              determine your exact graphics hardware, driver version, and capabilities - creating
              one of the most stable and unique fingerprinting vectors available.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Gets Exposed</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Direct Information</h4>
                <ul className="text-sm space-y-1">
                  <li>GPU vendor (NVIDIA, AMD, Intel, Apple)</li>
                  <li>GPU model (GTX 4090, M2 Pro, etc.)</li>
                  <li>Driver version string</li>
                  <li>WebGL version support</li>
                  <li>GLSL version</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Capability Fingerprint</h4>
                <ul className="text-sm space-y-1">
                  <li>Maximum texture dimensions</li>
                  <li>Shader precision formats</li>
                  <li>Supported extensions list</li>
                  <li>Rendering parameter limits</li>
                  <li>Anti-aliasing capabilities</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">The Renderer String Problem</h3>
            <p>
              The most revealing piece of data is the &quot;unmasked renderer&quot; string. Using the
              WEBGL_debug_renderer_info extension, websites can get strings like:
            </p>
            <div className="bg-slate-900 p-4 rounded font-mono text-sm my-4">
              <p className="text-cyan-300">NVIDIA GeForce RTX 4090/PCIe/SSE2</p>
              <p className="text-orange-300">Apple M2 Pro</p>
              <p className="text-purple-300">Intel(R) UHD Graphics 630</p>
            </div>
            <p>
              These strings often identify your exact hardware, which combined with other data
              can uniquely identify your device among millions.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Performance-Based Fingerprinting</h3>
            <p>
              Beyond direct hardware queries, GPU performance characteristics create fingerprints:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Rendering speed variations</strong> - Different GPUs
                complete the same rendering tasks at different speeds.
              </li>
              <li>
                <strong className="text-slate-300">Timing attacks</strong> - Precise measurement of
                shader execution time reveals hardware differences.
              </li>
              <li>
                <strong className="text-slate-300">Memory behavior</strong> - How the GPU handles
                texture memory varies by model.
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Why GPU Fingerprinting is Effective</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Characteristic</th>
                  <th className="text-left py-2 text-slate-300">Fingerprint Utility</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Stability</td>
                  <td className="py-2 text-cyan-400">Excellent - Hardware rarely changes</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Uniqueness</td>
                  <td className="py-2 text-cyan-400">High - Many GPU configurations exist</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Cross-browser</td>
                  <td className="py-2 text-cyan-400">Yes - Same GPU = same fingerprint</td>
                </tr>
                <tr>
                  <td className="py-2">Spoofing difficulty</td>
                  <td className="py-2 text-cyan-400">Very hard - Tied to real hardware</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Methods</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Tor Browser</strong> - Returns standardized WebGL
                values, hiding real GPU info.
              </li>
              <li>
                <strong className="text-slate-300">Firefox resistFingerprinting</strong> - Spoofs
                some WebGL parameters.
              </li>
              <li>
                <strong className="text-slate-300">Disable WebGL</strong> - Nuclear option via
                <code className="bg-slate-800 px-1 rounded">webgl.disabled</code> in Firefox.
              </li>
              <li>
                <strong className="text-slate-300">Browser extensions</strong> - WebGL Fingerprint
                Defender can randomize values.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>GPU fingerprinting reveals exact hardware details</li>
                <li>The renderer string often uniquely identifies your device</li>
                <li>Parameters and extensions add additional entropy</li>
                <li>Performance timing can fingerprint even without direct queries</li>
                <li>Tor Browser provides the most effective protection</li>
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

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-slate-800/50 rounded text-center">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-xl font-mono text-cyan-300">{value.toLocaleString()}</p>
    </div>
  );
}

function ParamCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-800/40 rounded">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-mono text-cyan-300">{value}</p>
    </div>
  );
}
