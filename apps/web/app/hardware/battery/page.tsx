'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface BatteryStatus {
  isSupported: boolean;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  levelPercent: string;
}

interface BatteryHistory {
  timestamp: number;
  level: number;
  charging: boolean;
}

export default function BatteryAPIPage() {
  const [battery, setBattery] = useState<BatteryStatus | null>(null);
  const [history, setHistory] = useState<BatteryHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const detectBattery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof navigator === 'undefined') {
        setBattery({ isSupported: false, charging: false, chargingTime: 0, dischargingTime: 0, level: 0, levelPercent: 'N/A' });
        return;
      }

      const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };

      if (!nav.getBattery) {
        setBattery({ isSupported: false, charging: false, chargingTime: 0, dischargingTime: 0, level: 0, levelPercent: 'N/A' });
        return;
      }

      const batteryManager = await nav.getBattery();

      const updateBattery = () => {
        const status: BatteryStatus = {
          isSupported: true,
          charging: batteryManager.charging,
          chargingTime: batteryManager.chargingTime,
          dischargingTime: batteryManager.dischargingTime,
          level: batteryManager.level,
          levelPercent: `${Math.round(batteryManager.level * 100)}%`,
        };
        setBattery(status);

        // Add to history
        setHistory(prev => {
          const newEntry = {
            timestamp: Date.now(),
            level: batteryManager.level,
            charging: batteryManager.charging,
          };
          return [...prev.slice(-29), newEntry];
        });
      };

      updateBattery();

      // Set up event listeners
      batteryManager.addEventListener('chargingchange', updateBattery);
      batteryManager.addEventListener('levelchange', updateBattery);
      batteryManager.addEventListener('chargingtimechange', updateBattery);
      batteryManager.addEventListener('dischargingtimechange', updateBattery);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Battery API not available');
      setBattery({ isSupported: false, charging: false, chargingTime: 0, dischargingTime: 0, level: 0, levelPercent: 'N/A' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    detectBattery();
  }, [detectBattery]);

  const statusReadings = useMemo(() => [
    {
      label: 'Level',
      value: battery?.levelPercent || (loading ? 'SCANNING' : 'N/A'),
      tone: battery?.isSupported ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'Status',
      value: battery?.charging ? 'CHARGING' : battery?.isSupported ? 'DISCHARGING' : 'N/A',
      tone: battery?.charging ? 'active' as const : 'alert' as const,
    },
    {
      label: 'API',
      value: battery?.isSupported ? 'EXPOSED' : 'BLOCKED',
      tone: battery?.isSupported ? 'alert' as const : 'active' as const,
    },
  ], [battery, loading]);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds === 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={loading}
      onRunDiagnostics={detectBattery}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Sensor Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Battery API Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect Battery Status API access that can expose your device&apos;s power state for tracking.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Battery Status */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Current Battery Status
            </p>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-500">
                Querying Battery API...
              </div>
            ) : battery?.isSupported ? (
              <div className="space-y-6">
                {/* Battery Visual */}
                <div className="relative w-full h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      battery.charging ? 'bg-gradient-to-r from-cyan-600 to-cyan-400' :
                      battery.level > 0.2 ? 'bg-gradient-to-r from-green-600 to-green-400' :
                      'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${battery.level * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white drop-shadow-lg">
                      {battery.levelPercent}
                    </span>
                  </div>
                  {/* Battery cap */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 bg-slate-600 rounded-r-sm -mr-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ResultRow label="Charging" value={battery.charging ? 'Yes' : 'No'} />
                  <ResultRow label="Level" value={battery.levelPercent} />
                  <ResultRow label="Time to Full" value={formatTime(battery.chargingTime)} />
                  <ResultRow label="Time Remaining" value={formatTime(battery.dischargingTime)} />
                </div>

                <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Battery API is accessible. Your battery level and charging status can be used for fingerprinting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center">
                <span className="text-cyan-400 text-lg">Battery API Not Available</span>
                <span className="text-sm text-slate-500 mt-2">
                  Your browser blocks or doesn&apos;t support the Battery Status API
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}
          </div>

          {/* Privacy Impact */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Privacy Impact
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">What This API Exposes</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Exact battery percentage (0-100%)</li>
                  <li>• Whether device is plugged in</li>
                  <li>• Time until fully charged</li>
                  <li>• Time until battery depletes</li>
                  <li>• Real-time change events</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-orange-300 font-medium mb-2">Fingerprinting Potential</h4>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>• Battery capacity reveals device model</li>
                  <li>• Discharge rate indicates usage patterns</li>
                  <li>• Charging behavior shows daily routines</li>
                  <li>• Combined with other data: highly unique</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-800/50 rounded">
                <h4 className="text-slate-300 font-medium mb-2">Browser Support</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-red-400">Chrome: Removed</span>
                  <span className="text-red-400">Firefox: Removed</span>
                  <span className="text-red-400">Safari: Never added</span>
                  <span className="text-yellow-400">Chromium-based: Varies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battery History Chart */}
        {history.length > 0 && (
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Battery Level History
            </p>
            <div className="h-32 flex items-end gap-1">
              {history.map((entry, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all ${
                    entry.charging ? 'bg-cyan-500' : 'bg-slate-600'
                  }`}
                  style={{ height: `${entry.level * 100}%` }}
                  title={`${Math.round(entry.level * 100)}% - ${entry.charging ? 'Charging' : 'Discharging'}`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Real-time battery level tracking (last {history.length} readings)
            </p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Battery API: The Tracking Vector That Got Deprecated
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              The Battery Status API is a cautionary tale in web privacy. Designed to help websites
              optimize for low-battery situations, it became one of the most controversial tracking
              mechanisms ever implemented in browsers. Here&apos;s the full story.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Original Intent</h3>
            <p>
              The W3C Battery Status API (2012) seemed like a good idea: let websites detect when
              users have low battery so they could reduce animations, lower video quality, or save
              data more frequently. The problem? The specification allowed way too much precision.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">The Privacy Disaster</h3>
            <p>
              Researchers discovered that battery information creates surprisingly unique fingerprints:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">High precision levels</strong> - The API reported
                battery level as a double (like 0.7234), giving thousands of possible values.
              </li>
              <li>
                <strong className="text-slate-300">Discharge time</strong> - Time-to-empty was reported
                in seconds, varying by battery capacity and current drain.
              </li>
              <li>
                <strong className="text-slate-300">Unique combinations</strong> - A 2015 study found
                that battery level + discharge time created nearly unique identifiers.
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">The Research That Changed Everything</h3>
            <p>
              In 2015, researchers from Princeton, KU Leuven, and INRIA published findings showing:
            </p>
            <div className="bg-slate-800/50 p-4 rounded my-4">
              <ul className="text-sm space-y-2">
                <li>• Battery level (0.00-1.00) + discharge time = 14 million possible values</li>
                <li>• Users could be re-identified across websites within 30 seconds</li>
                <li>• VPNs and private browsing modes offered no protection</li>
                <li>• The API worked without any user permission</li>
              </ul>
            </div>
            <p>
              This research directly led to major browsers removing or restricting the API.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">Browser Responses</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">Action</th>
                  <th className="text-left py-2 text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox</td>
                  <td className="py-2">Removed completely</td>
                  <td className="py-2">2017 (v52)</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari</td>
                  <td className="py-2">Never implemented</td>
                  <td className="py-2">-</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome</td>
                  <td className="py-2">Deprecated (HTTP only)</td>
                  <td className="py-2">2021</td>
                </tr>
                <tr>
                  <td className="py-2">Tor Browser</td>
                  <td className="py-2">Always disabled</td>
                  <td className="py-2">-</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Real-World Exploitation</h3>
            <p>
              Before deprecation, researchers found the Battery API being used by:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Ad tech companies for cross-site tracking</li>
              <li>Price discrimination scripts (showing higher prices to low-battery users)</li>
              <li>Analytics platforms building device profiles</li>
              <li>Fingerprinting services combining battery with other signals</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Lessons for Web Privacy</h3>
            <p>
              The Battery API controversy taught important lessons:
            </p>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Precision matters</strong> - Even seemingly
                innocent data becomes fingerprinting material at high precision.
              </li>
              <li>
                <strong className="text-slate-300">No permission = abuse</strong> - APIs without
                permission requirements will be exploited.
              </li>
              <li>
                <strong className="text-slate-300">Research drives change</strong> - Academic
                research directly influenced browser vendors.
              </li>
              <li>
                <strong className="text-slate-300">Deprecation is possible</strong> - Privacy
                concerns can override &quot;useful&quot; features.
              </li>
            </ol>

            <h3 className="text-xl text-slate-200 mt-8">Current Status</h3>
            <p>
              Today, most major browsers have removed or heavily restricted the Battery Status API.
              However, some Chromium-based browsers and WebViews may still expose it. This test
              helps you verify whether your browser is protected.
            </p>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Battery API was removed from major browsers due to privacy concerns</li>
                <li>High-precision battery data created unique fingerprints</li>
                <li>No permission was required - silent tracking was possible</li>
                <li>The API&apos;s deprecation shows privacy research can drive change</li>
                <li>Some browsers/WebViews may still expose this data</li>
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

interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
}
