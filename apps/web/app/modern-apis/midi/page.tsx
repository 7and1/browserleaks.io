'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface MIDIPortInfo {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
  state: string;
  connection: string;
}

export default function WebMIDIPage() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [inputs, setInputs] = useState<MIDIPortInfo[]>([]);
  const [outputs, setOutputs] = useState<MIDIPortInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSupport = useCallback(() => {
    if (typeof navigator === 'undefined') {
      setIsSupported(false);
      return false;
    }
    const supported = 'requestMIDIAccess' in navigator;
    setIsSupported(supported);
    return supported;
  }, []);

  const requestMIDI = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!('requestMIDIAccess' in navigator)) {
        setError('Web MIDI API not supported');
        setIsSupported(false);
        return;
      }

      const nav = navigator as Navigator & {
        requestMIDIAccess: (options?: { sysex?: boolean }) => Promise<MIDIAccess>;
      };

      const midiAccess = await nav.requestMIDIAccess({ sysex: false });

      const inputDevices: MIDIPortInfo[] = [];
      const outputDevices: MIDIPortInfo[] = [];

      midiAccess.inputs.forEach((port) => {
        inputDevices.push({
          id: port.id,
          name: port.name || 'Unknown',
          manufacturer: port.manufacturer || 'Unknown',
          type: 'input',
          state: port.state,
          connection: port.connection,
        });
      });

      midiAccess.outputs.forEach((port) => {
        outputDevices.push({
          id: port.id,
          name: port.name || 'Unknown',
          manufacturer: port.manufacturer || 'Unknown',
          type: 'output',
          state: port.state,
          connection: port.connection,
        });
      });

      setInputs(inputDevices);
      setOutputs(outputDevices);
      setIsSupported(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'SecurityError') {
          setError('MIDI access denied by user or browser');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to access MIDI devices');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supported = checkSupport();
    if (supported) {
      requestMIDI();
    }
  }, [checkSupport, requestMIDI]);

  const totalDevices = inputs.length + outputs.length;

  const statusReadings = useMemo(() => [
    {
      label: 'API',
      value: isSupported === null ? 'CHECKING' : isSupported ? 'AVAILABLE' : 'BLOCKED',
      tone: isSupported ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Devices',
      value: totalDevices.toString(),
      tone: totalDevices > 0 ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: isSupported ? (totalDevices > 0 ? 'EXPOSED' : 'LOW') : 'SAFE',
      tone: totalDevices > 0 ? 'alert' as const : 'active' as const,
    },
  ], [isSupported, totalDevices]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={requestMIDI}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">API Exploits</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Web MIDI API Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect Web MIDI API access that can enumerate MIDI devices and reveal your music equipment.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              API Status
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded">
                <p className="text-xs text-slate-500 mb-2">Web MIDI Support</p>
                <p className={`text-2xl font-mono ${isSupported ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {isSupported === null ? 'Checking...' : isSupported ? 'AVAILABLE' : 'NOT SUPPORTED'}
                </p>
              </div>

              {isSupported && (
                <button
                  onClick={requestMIDI}
                  disabled={loading}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded transition-colors"
                >
                  {loading ? 'Scanning...' : 'Refresh MIDI Devices'}
                </button>
              )}

              {isSupported && totalDevices > 0 && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    {totalDevices} MIDI device(s) detected. Your music equipment is exposed to this website.
                  </p>
                </div>
              )}

              {isSupported && totalDevices === 0 && (
                <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                  <p className="text-sm text-cyan-300">
                    No MIDI devices detected. Either none are connected or access was denied.
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

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Privacy Impact
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">What MIDI Exposes</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>Device names (keyboards, controllers)</li>
                  <li>Manufacturer information</li>
                  <li>Unique device IDs</li>
                  <li>Connection status</li>
                  <li>Input/output capabilities</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Fingerprinting Value</h4>
                <p className="text-sm text-slate-400">
                  MIDI devices are relatively rare, making their presence highly distinctive.
                  A user with a specific MIDI controller becomes significantly more identifiable.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MIDI Devices List */}
        {(inputs.length > 0 || outputs.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                MIDI Inputs ({inputs.length})
              </p>
              {inputs.length > 0 ? (
                <div className="space-y-3">
                  {inputs.map((port, i) => (
                    <DeviceCard key={i} port={port} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No input devices</p>
              )}
            </div>

            <div className="lab-panel p-6">
              <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
                MIDI Outputs ({outputs.length})
              </p>
              {outputs.length > 0 ? (
                <div className="space-y-3">
                  {outputs.map((port, i) => (
                    <DeviceCard key={i} port={port} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No output devices</p>
              )}
            </div>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Web MIDI: Your Music Equipment as a Fingerprint
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Web MIDI allows websites to interact with musical instruments and controllers.
              While useful for music applications, it also exposes unique hardware information
              that can be used for fingerprinting.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Web MIDI Works</h3>
            <p>
              The Web MIDI API provides access to MIDI (Musical Instrument Digital Interface) devices
              connected to your computer. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>MIDI keyboards and controllers</li>
              <li>Electronic drum pads</li>
              <li>Synthesizers with USB MIDI</li>
              <li>DJ equipment</li>
              <li>DAW control surfaces</li>
              <li>Virtual MIDI devices (software)</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Why MIDI is a Strong Fingerprint</h3>
            <p>
              MIDI devices are uncommon - most users don&apos;t have any. This makes their presence
              highly distinctive:
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <ul className="text-sm space-y-2">
                <li>Only ~2-5% of users have MIDI devices</li>
                <li>Specific device models are even rarer</li>
                <li>Combinations of devices are nearly unique</li>
                <li>Device IDs persist across sessions</li>
              </ul>
            </div>
            <p>
              If a website detects you have a &quot;Novation Launchpad MK3&quot; and &quot;Arturia KeyStep 37&quot;,
              you&apos;re probably the only user in millions with that exact combination.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Browser Support</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">Support</th>
                  <th className="text-left py-2 text-slate-300">Permission Required</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Yes (user prompt)</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Edge</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Yes (user prompt)</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Yes (behind flag)</td>
                </tr>
                <tr>
                  <td className="py-2">Safari</td>
                  <td className="py-2 text-red-400">Not Supported</td>
                  <td className="py-2">-</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Methods</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Deny MIDI access</strong> - When prompted,
                deny access unless you specifically need it.
              </li>
              <li>
                <strong className="text-slate-300">Use Safari</strong> - Web MIDI is not implemented.
              </li>
              <li>
                <strong className="text-slate-300">Disconnect devices</strong> - Unplug MIDI devices
                when not actively using them.
              </li>
              <li>
                <strong className="text-slate-300">Review permissions</strong> - Check which sites
                have MIDI access in browser settings.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>MIDI devices are rare, making them highly identifying</li>
                <li>Device names and IDs are exposed to websites</li>
                <li>Safari doesn&apos;t support Web MIDI</li>
                <li>Permission is required but often granted automatically by musicians</li>
                <li>Disconnect MIDI devices when not needed</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function DeviceCard({ port }: { port: MIDIPortInfo }) {
  return (
    <div className="p-3 bg-slate-800/40 rounded">
      <p className="text-sm text-cyan-300 font-medium">{port.name}</p>
      <p className="text-xs text-slate-500">{port.manufacturer}</p>
      <div className="mt-2 flex gap-2">
        <span className={`px-2 py-0.5 text-xs rounded ${
          port.state === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-slate-600/50 text-slate-400'
        }`}>
          {port.state}
        </span>
        <span className="px-2 py-0.5 text-xs bg-slate-600/50 text-slate-400 rounded">
          {port.type}
        </span>
      </div>
    </div>
  );
}

interface MIDIAccess {
  inputs: Map<string, MIDIPort>;
  outputs: Map<string, MIDIPort>;
}

interface MIDIPort {
  id: string;
  name?: string;
  manufacturer?: string;
  state: string;
  connection: string;
}
