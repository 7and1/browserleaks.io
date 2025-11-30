'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface USBDeviceInfo {
  vendorId: number;
  productId: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
}

export default function WebUSBPage() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<USBDeviceInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkSupport = useCallback(() => {
    if (typeof navigator === 'undefined') {
      setIsSupported(false);
      return;
    }
    setIsSupported('usb' in navigator);
  }, []);

  const getDevices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!('usb' in navigator)) {
        setError('WebUSB API not supported');
        setIsSupported(false);
        return;
      }

      const nav = navigator as Navigator & {
        usb: {
          getDevices: () => Promise<USBDevice[]>;
          requestDevice: (options: { filters: Array<{ vendorId?: number }> }) => Promise<USBDevice>;
        };
      };

      // Get already authorized devices
      const authorizedDevices = await nav.usb.getDevices();
      const deviceInfos: USBDeviceInfo[] = authorizedDevices.map(device => ({
        vendorId: device.vendorId,
        productId: device.productId,
        deviceClass: device.deviceClass,
        deviceSubclass: device.deviceSubclass,
        deviceProtocol: device.deviceProtocol,
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
      }));

      setDevices(deviceInfos);
      setIsSupported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access USB devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestDevice = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nav = navigator as Navigator & {
        usb: {
          requestDevice: (options: { filters: Array<{ vendorId?: number }> }) => Promise<USBDevice>;
        };
      };

      // Request any USB device
      const device = await nav.usb.requestDevice({ filters: [] });

      const deviceInfo: USBDeviceInfo = {
        vendorId: device.vendorId,
        productId: device.productId,
        deviceClass: device.deviceClass,
        deviceSubclass: device.deviceSubclass,
        deviceProtocol: device.deviceProtocol,
        productName: device.productName,
        manufacturerName: device.manufacturerName,
        serialNumber: device.serialNumber,
      };

      setDevices(prev => {
        const exists = prev.some(d =>
          d.vendorId === deviceInfo.vendorId && d.productId === deviceInfo.productId
        );
        if (!exists) {
          return [...prev, deviceInfo];
        }
        return prev;
      });
    } catch (err) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setError('User cancelled device selection');
      } else if (err instanceof Error) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSupport();
    if (typeof navigator !== 'undefined' && 'usb' in navigator) {
      getDevices();
    }
  }, [checkSupport, getDevices]);

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

  const formatHex = (num: number) => `0x${num.toString(16).padStart(4, '0').toUpperCase()}`;

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={getDevices}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">API Exploits</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Web USB API Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect WebUSB API access that can enumerate connected USB devices and expose hardware information.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              API Status
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded">
                <p className="text-xs text-slate-500 mb-2">WebUSB Support</p>
                <p className={`text-2xl font-mono ${isSupported ? 'text-orange-400' : 'text-cyan-400'}`}>
                  {isSupported === null ? 'Checking...' : isSupported ? 'AVAILABLE' : 'NOT SUPPORTED'}
                </p>
              </div>

              {isSupported && (
                <button
                  onClick={requestDevice}
                  disabled={loading}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 text-white rounded transition-colors"
                >
                  {loading ? 'Scanning...' : 'Request USB Device Access'}
                </button>
              )}

              {isSupported && (
                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    WebUSB API is available. Websites can request access to USB devices.
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
              Authorized Devices ({devices.length})
            </p>

            {devices.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {devices.map((device, i) => (
                  <div key={i} className="p-3 bg-slate-800/40 rounded">
                    <p className="text-sm text-cyan-300 font-medium">
                      {device.productName || 'Unknown Product'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {device.manufacturerName || 'Unknown Manufacturer'}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <span className="text-slate-400">Vendor: <span className="text-cyan-200 font-mono">{formatHex(device.vendorId)}</span></span>
                      <span className="text-slate-400">Product: <span className="text-cyan-200 font-mono">{formatHex(device.productId)}</span></span>
                    </div>
                    {device.serialNumber && (
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        Serial: {device.serialNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-500">
                {isSupported ? 'No authorized devices. Click to request access.' : 'WebUSB not available'}
              </div>
            )}
          </div>
        </div>

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            WebUSB: Direct Access to Your Hardware
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              WebUSB enables websites to communicate directly with USB devices - everything from
              Arduino boards to specialized hardware. While powerful for legitimate applications,
              this API creates unique privacy and security considerations.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What WebUSB Exposes</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-slate-300">Vendor ID</strong> - Identifies the device manufacturer</li>
              <li><strong className="text-slate-300">Product ID</strong> - Identifies the specific product</li>
              <li><strong className="text-slate-300">Serial Number</strong> - Unique device identifier (if available)</li>
              <li><strong className="text-slate-300">Product Name</strong> - Human-readable device name</li>
              <li><strong className="text-slate-300">Manufacturer Name</strong> - Company that made the device</li>
              <li><strong className="text-slate-300">Device Class</strong> - Type of USB device</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Privacy Concerns</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Fingerprinting Risks</h4>
                <ul className="text-sm space-y-1">
                  <li>Connected device enumeration</li>
                  <li>Hardware configuration profiling</li>
                  <li>Serial numbers as unique IDs</li>
                  <li>Device class combinations</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Security Risks</h4>
                <ul className="text-sm space-y-1">
                  <li>Malicious device firmware updates</li>
                  <li>Data extraction from devices</li>
                  <li>Device manipulation</li>
                  <li>Cross-origin device access</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Browser Support</h3>
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
                  <td className="py-2">Full implementation</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Edge</td>
                  <td className="py-2 text-orange-400">Supported</td>
                  <td className="py-2">Chromium-based</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari</td>
                  <td className="py-2 text-red-400">Not Supported</td>
                  <td className="py-2">Security concerns</td>
                </tr>
                <tr>
                  <td className="py-2">Firefox</td>
                  <td className="py-2 text-red-400">Not Supported</td>
                  <td className="py-2">Security concerns</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use Firefox or Safari</strong> - These browsers
                don&apos;t implement WebUSB.
              </li>
              <li>
                <strong className="text-slate-300">Deny permissions</strong> - Never grant USB access
                to untrusted websites.
              </li>
              <li>
                <strong className="text-slate-300">Review device access</strong> - Check which sites
                have USB permissions in browser settings.
              </li>
              <li>
                <strong className="text-slate-300">Disconnect devices</strong> - Unplug USB devices
                when not in use.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>WebUSB provides detailed hardware information</li>
                <li>Serial numbers can uniquely identify devices</li>
                <li>Firefox and Safari block this API</li>
                <li>Permission required but persists after granted</li>
                <li>Connected devices reveal hardware configuration</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

interface USBDevice {
  vendorId: number;
  productId: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  productName?: string;
  manufacturerName?: string;
  serialNumber?: string;
}
