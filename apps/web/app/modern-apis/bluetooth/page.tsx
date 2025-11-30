'use client';

import { useState, useCallback, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface BluetoothDevice {
  id: string;
  name: string;
  gatt?: {
    connected: boolean;
  };
}

export default function BluetoothAPIPage() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSupport = useCallback(() => {
    if (typeof navigator === 'undefined') {
      setIsSupported(false);
      return;
    }
    setIsSupported('bluetooth' in navigator);
  }, []);

  const scanDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!('bluetooth' in navigator)) {
        setError('Web Bluetooth API not supported');
        setIsSupported(false);
        return;
      }

      const nav = navigator as Navigator & {
        bluetooth: {
          requestDevice: (options: {
            acceptAllDevices?: boolean;
            filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
            optionalServices?: string[];
          }) => Promise<BluetoothDevice>;
          getDevices?: () => Promise<BluetoothDevice[]>;
        };
      };

      // Try to get already paired devices first (if available)
      if (nav.bluetooth.getDevices) {
        try {
          const pairedDevices = await nav.bluetooth.getDevices();
          setDevices(pairedDevices);
        } catch {
          // getDevices may not be available in all contexts
        }
      }

      // Request a device to show the prompt
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information'],
      });

      setDevices(prev => {
        const exists = prev.some(d => d.id === device.id);
        if (!exists) {
          return [...prev, device];
        }
        return prev;
      });

      setIsSupported(true);
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setError('User cancelled device selection');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to scan Bluetooth devices');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useState(() => {
    checkSupport();
  });

  const statusReadings = useMemo(() => [
    {
      label: 'API',
      value: isSupported === null ? 'CHECKING' : isSupported ? 'AVAILABLE' : 'BLOCKED',
      tone: isSupported ? 'alert' as const : 'active' as const,
    },
    {
      label: 'Devices',
      value: devices.length.toString(),
      tone: devices.length > 0 ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Risk',
      value: isSupported ? 'EXPOSED' : 'SAFE',
      tone: isSupported ? 'alert' as const : 'active' as const,
    },
  ], [isSupported, devices]);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={scanDevices}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">API Exploits</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Web Bluetooth API Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Test Web Bluetooth API access that can expose nearby Bluetooth devices for tracking.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              API Status
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded">
                <p className="text-xs text-slate-500 mb-2">Web Bluetooth Support</p>
                <p className={`text-2xl font-mono ${isSupported ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {isSupported === null ? 'Checking...' : isSupported ? 'AVAILABLE' : 'NOT SUPPORTED'}
                </p>
              </div>

              {isSupported && (
                <button
                  onClick={scanDevices}
                  disabled={loading}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded transition-colors"
                >
                  {loading ? 'Scanning...' : 'Scan for Devices'}
                </button>
              )}

              {isSupported && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Web Bluetooth API is available. Websites can request access to nearby Bluetooth devices.
                  </p>
                </div>
              )}

              {!isSupported && isSupported !== null && (
                <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded">
                  <p className="text-sm text-cyan-300">
                    Web Bluetooth API is blocked or not supported in your browser.
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
              Detected Devices ({devices.length})
            </p>

            {devices.length > 0 ? (
              <div className="space-y-3">
                {devices.map((device, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 rounded">
                    <p className="text-sm text-cyan-300 font-mono">{device.name || 'Unknown Device'}</p>
                    <p className="text-xs text-slate-500 mt-1">ID: {device.id?.slice(0, 20)}...</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                {isSupported ? 'Click "Scan for Devices" to search' : 'Bluetooth API not available'}
              </div>
            )}
          </div>
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Web Bluetooth: When Websites Can See Your Devices
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Web Bluetooth allows websites to communicate directly with Bluetooth devices. While this
              enables innovative web applications, it also creates significant privacy concerns. Let&apos;s
              explore how this API works and what it exposes.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">How Web Bluetooth Works</h3>
            <p>
              The Web Bluetooth API lets web pages:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request access to nearby Bluetooth Low Energy (BLE) devices</li>
              <li>Connect to discovered devices</li>
              <li>Read and write device characteristics</li>
              <li>Subscribe to device notifications</li>
            </ul>
            <p>
              When a website calls <code className="bg-slate-800 px-1 rounded">navigator.bluetooth.requestDevice()</code>,
              the browser shows a device picker. Once the user selects a device, the website gains access
              to communicate with it.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Privacy Implications</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Direct Risks</h4>
                <ul className="text-sm space-y-1">
                  <li>Device names reveal personal info</li>
                  <li>Device IDs are stable identifiers</li>
                  <li>Nearby devices expose location</li>
                  <li>Health devices leak medical data</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Tracking Potential</h4>
                <ul className="text-sm space-y-1">
                  <li>Device presence fingerprinting</li>
                  <li>Cross-site device correlation</li>
                  <li>Physical location tracking</li>
                  <li>Behavioral pattern analysis</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Browser Support & Restrictions</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">Support</th>
                  <th className="text-left py-2 text-slate-300">Notes</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Requires HTTPS, user gesture</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Edge</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Same as Chrome</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari</td>
                  <td className="py-2 text-red-400">Not Supported</td>
                  <td className="py-2">Privacy concerns cited</td>
                </tr>
                <tr>
                  <td className="py-2">Firefox</td>
                  <td className="py-2 text-red-400">Not Supported</td>
                  <td className="py-2">Privacy concerns cited</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Security Measures</h3>
            <p>
              The Web Bluetooth specification includes some protections:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">HTTPS required</strong> - Only works on secure origins</li>
              <li><strong className="text-slate-300">User gesture required</strong> - Must be triggered by user action</li>
              <li><strong className="text-slate-300">Device picker</strong> - User must explicitly select devices</li>
              <li><strong className="text-slate-300">Permission persistence</strong> - Sites can remember devices (with permission)</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use Safari or Firefox</strong> - These browsers don&apos;t
                support Web Bluetooth due to privacy concerns.
              </li>
              <li>
                <strong className="text-slate-300">Disable Bluetooth</strong> - When not in use, disable
                system Bluetooth entirely.
              </li>
              <li>
                <strong className="text-slate-300">Use incognito mode</strong> - Prevents permission
                persistence (but API still works).
              </li>
              <li>
                <strong className="text-slate-300">Browser permissions</strong> - Deny Bluetooth access
                when prompted by unknown sites.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Web Bluetooth exposes nearby device information</li>
                <li>Device names and IDs can be used for tracking</li>
                <li>Firefox and Safari block this API for privacy</li>
                <li>Always review permissions before granting access</li>
                <li>Turn off Bluetooth when not needed</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}
