'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { LabShell } from '@/components/layout/LabShell';

interface MotionData {
  acceleration: { x: number | null; y: number | null; z: number | null };
  accelerationIncludingGravity: { x: number | null; y: number | null; z: number | null };
  rotationRate: { alpha: number | null; beta: number | null; gamma: number | null };
  interval: number;
}

interface OrientationData {
  alpha: number | null; // Z-axis rotation (0-360)
  beta: number | null;  // X-axis rotation (-180 to 180)
  gamma: number | null; // Y-axis rotation (-90 to 90)
  absolute: boolean;
}

export default function MotionSensorPage() {
  const [motion, setMotion] = useState<MotionData | null>(null);
  const [orientation, setOrientation] = useState<OrientationData | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  const checkSupport = useCallback(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    const hasMotion = 'DeviceMotionEvent' in window;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    setIsSupported(hasMotion || hasOrientation);

    // Check if permission is needed (iOS 13+)
    const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (DeviceMotionEventWithPermission.requestPermission) {
      setNeedsPermission(true);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const DeviceMotionEventWithPermission = DeviceMotionEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      const DeviceOrientationEventWithPermission = DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (DeviceMotionEventWithPermission.requestPermission) {
        const motionPermission = await DeviceMotionEventWithPermission.requestPermission();
        if (motionPermission === 'granted') {
          setPermissionGranted(true);
        }
      }

      if (DeviceOrientationEventWithPermission.requestPermission) {
        await DeviceOrientationEventWithPermission.requestPermission();
      }
    } catch {
      setError('Permission denied for motion sensors');
    }
  };

  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    setMotion({
      acceleration: {
        x: event.acceleration?.x ?? null,
        y: event.acceleration?.y ?? null,
        z: event.acceleration?.z ?? null,
      },
      accelerationIncludingGravity: {
        x: event.accelerationIncludingGravity?.x ?? null,
        y: event.accelerationIncludingGravity?.y ?? null,
        z: event.accelerationIncludingGravity?.z ?? null,
      },
      rotationRate: {
        alpha: event.rotationRate?.alpha ?? null,
        beta: event.rotationRate?.beta ?? null,
        gamma: event.rotationRate?.gamma ?? null,
      },
      interval: event.interval,
    });
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
      absolute: event.absolute,
    });

    // Update 3D cube rotation
    if (cubeRef.current && event.beta !== null && event.gamma !== null) {
      cubeRef.current.style.transform = `rotateX(${event.beta}deg) rotateY(${event.gamma}deg) rotateZ(${event.alpha || 0}deg)`;
    }
  }, []);

  useEffect(() => {
    checkSupport();
  }, [checkSupport]);

  useEffect(() => {
    if (!isSupported) return;
    if (needsPermission && !permissionGranted) return;

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isSupported, needsPermission, permissionGranted, handleMotion, handleOrientation]);

  const statusReadings = useMemo(() => [
    {
      label: 'Motion',
      value: motion ? 'ACTIVE' : isSupported ? 'IDLE' : 'N/A',
      tone: motion ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'Orientation',
      value: orientation ? 'TRACKING' : isSupported ? 'IDLE' : 'N/A',
      tone: orientation ? 'alert' as const : 'neutral' as const,
    },
    {
      label: 'API',
      value: isSupported ? 'EXPOSED' : 'BLOCKED',
      tone: isSupported ? 'alert' as const : 'active' as const,
    },
  ], [motion, orientation, isSupported]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatNumber = (n: number | null) => n !== null ? n.toFixed(4) : '---';

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={false}
      onRunDiagnostics={needsPermission ? requestPermission : checkSupport}
    >
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Sensor Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Motion Sensors Test</h1>
          <p className="mt-2 text-sm text-slate-400">
            Detect accelerometer and gyroscope data that can fingerprint your device movement patterns.
          </p>
        </header>

        {needsPermission && !permissionGranted && (
          <div className="lab-panel p-6 text-center">
            <p className="text-slate-400 mb-4">
              Motion sensor access requires your permission on this device.
            </p>
            <button
              onClick={requestPermission}
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              Grant Motion Sensor Access
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 3D Visualization */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              3D Orientation Visualizer
            </p>

            <div className="h-64 flex items-center justify-center perspective-500">
              <div
                ref={cubeRef}
                className="w-32 h-32 relative transform-style-3d transition-transform duration-100"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Cube faces */}
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">FRONT</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'rotateY(180deg) translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">BACK</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'rotateY(-90deg) translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">LEFT</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'rotateY(90deg) translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">RIGHT</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'rotateX(90deg) translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">TOP</span>
                </div>
                <div className="absolute inset-0 bg-cyan-500/30 border-2 border-cyan-400" style={{ transform: 'rotateX(-90deg) translateZ(64px)' }}>
                  <span className="absolute inset-0 flex items-center justify-center text-cyan-300 font-bold">BOTTOM</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              {orientation ? 'Rotate your device to see the cube move' : 'Waiting for orientation data...'}
            </p>
          </div>

          {/* Device Orientation */}
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Device Orientation
            </p>

            {orientation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <OrientationAxis label="Alpha (Z)" value={orientation.alpha} color="cyan" />
                  <OrientationAxis label="Beta (X)" value={orientation.beta} color="orange" />
                  <OrientationAxis label="Gamma (Y)" value={orientation.gamma} color="purple" />
                </div>

                <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded">
                  <p className="text-sm text-orange-300">
                    Your device orientation is being tracked in real-time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {isSupported === false ? 'Orientation API not supported' : 'Waiting for data...'}
              </div>
            )}
          </div>
        </div>

        {/* Acceleration Data */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Acceleration (without gravity)
            </p>

            {motion?.acceleration ? (
              <div className="space-y-3">
                <AxisDisplay label="X" value={motion.acceleration.x} />
                <AxisDisplay label="Y" value={motion.acceleration.y} />
                <AxisDisplay label="Z" value={motion.acceleration.z} />
                <p className="text-xs text-slate-500 mt-4">
                  Update interval: {motion.interval.toFixed(2)}ms
                </p>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {isSupported === false ? 'Motion API not supported' : 'No acceleration data'}
              </div>
            )}
          </div>

          <div className="lab-panel p-6">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500 mb-4">
              Rotation Rate (deg/s)
            </p>

            {motion?.rotationRate ? (
              <div className="space-y-3">
                <AxisDisplay label="Alpha" value={motion.rotationRate.alpha} />
                <AxisDisplay label="Beta" value={motion.rotationRate.beta} />
                <AxisDisplay label="Gamma" value={motion.rotationRate.gamma} />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-500">
                {isSupported === false ? 'Motion API not supported' : 'No rotation data'}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="lab-panel p-4 bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <section className="lab-panel p-8">
          <h2 className="text-2xl font-light text-slate-100 mb-6">
            Motion Sensors: Your Device&apos;s Secret Biometric
          </h2>

          <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-6">
            <p className="text-lg text-slate-300">
              Your phone&apos;s accelerometer and gyroscope don&apos;t just detect motion - they can identify
              you. Research shows these sensors create unique &quot;motion fingerprints&quot; based on how you
              hold and interact with your device.
            </p>

            <h3 className="text-xl text-slate-200 mt-8">What Motion Sensors Detect</h3>
            <div className="grid md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Accelerometer</h4>
                <ul className="text-sm space-y-1">
                  <li>Linear acceleration on X, Y, Z axes</li>
                  <li>Gravity direction and magnitude</li>
                  <li>Device tilt and orientation</li>
                  <li>Shake and tap gestures</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 p-4 rounded">
                <h4 className="text-cyan-300 font-medium mb-2">Gyroscope</h4>
                <ul className="text-sm space-y-1">
                  <li>Angular velocity (rotation speed)</li>
                  <li>Device rotation on all axes</li>
                  <li>Orientation changes</li>
                  <li>Stabilization data</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl text-slate-200 mt-8">Fingerprinting Research</h3>
            <p>
              Multiple studies have demonstrated motion sensor fingerprinting:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-slate-300">Sensor calibration errors</strong> - Each sensor has
                unique manufacturing imperfections that create identifiable noise patterns.
              </li>
              <li>
                <strong className="text-slate-300">Gait analysis</strong> - How you walk while carrying
                your phone creates a unique motion signature.
              </li>
              <li>
                <strong className="text-slate-300">Typing patterns</strong> - The way your device moves
                as you type reveals behavioral biometrics.
              </li>
              <li>
                <strong className="text-slate-300">Touch behavior</strong> - Micro-movements during touch
                interactions are highly individual.
              </li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">The Privacy Implications</h3>
            <p>
              Motion data can reveal:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Whether you&apos;re walking, driving, or stationary</li>
              <li>Your typing patterns and PIN/password inputs</li>
              <li>Your physical location (combined with magnetometer)</li>
              <li>Your health and activity levels</li>
              <li>Device orientation during sensitive activities</li>
            </ul>

            <h3 className="text-xl text-slate-200 mt-8">Browser Implementation</h3>
            <table className="w-full text-sm my-4">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-300">Browser</th>
                  <th className="text-left py-2 text-slate-300">Access</th>
                  <th className="text-left py-2 text-slate-300">Permission Required</th>
                </tr>
              </thead>
              <tbody className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <td className="py-2">Safari (iOS 13+)</td>
                  <td className="py-2">Restricted</td>
                  <td className="py-2 text-cyan-400">Yes</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Chrome (Android)</td>
                  <td className="py-2">Available</td>
                  <td className="py-2 text-orange-400">No</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Firefox</td>
                  <td className="py-2">Available</td>
                  <td className="py-2 text-orange-400">No</td>
                </tr>
                <tr>
                  <td className="py-2">Desktop browsers</td>
                  <td className="py-2">Limited/None</td>
                  <td className="py-2">-</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl text-slate-200 mt-8">Protection Strategies</h3>
            <ol className="list-decimal pl-6 space-y-3">
              <li>
                <strong className="text-slate-300">Use iOS Safari</strong> - Requires explicit
                permission for motion sensor access since iOS 13.
              </li>
              <li>
                <strong className="text-slate-300">Disable in Firefox</strong> - Set
                <code className="bg-slate-800 px-1 rounded">device.sensors.enabled</code> to false.
              </li>
              <li>
                <strong className="text-slate-300">Use Tor Browser</strong> - Motion sensors are
                blocked by default.
              </li>
              <li>
                <strong className="text-slate-300">Use desktop browsers</strong> - Most desktop
                devices lack motion sensors entirely.
              </li>
            </ol>

            <div className="mt-8 p-6 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="text-cyan-300 font-medium mb-2">Key Takeaways</h4>
              <ul className="text-sm space-y-2">
                <li>Motion sensors can uniquely identify devices and users</li>
                <li>Data is available without permission on most browsers</li>
                <li>iOS 13+ requires user consent - a privacy win</li>
                <li>Motion data reveals activity, location, and behavior</li>
                <li>Manufacturing variations create unique sensor &quot;fingerprints&quot;</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </LabShell>
  );
}

function OrientationAxis({ label, value, color }: { label: string; value: number | null; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: 'text-cyan-300 bg-cyan-500',
    orange: 'text-orange-300 bg-orange-500',
    purple: 'text-purple-300 bg-purple-500',
  };

  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-2">{label}</p>
      <p className={`text-2xl font-mono ${colorClasses[color]?.split(' ')[0] || 'text-slate-300'}`}>
        {value !== null ? value.toFixed(1) : '---'}
      </p>
      <div className="h-1 mt-2 bg-slate-700 rounded overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]?.split(' ')[1] || 'bg-slate-500'}`}
          style={{ width: `${value !== null ? Math.abs((value / 360) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}

function AxisDisplay({ label, value }: { label: string; value: number | null }) {
  const normalized = value !== null ? Math.min(100, Math.abs(value * 5)) : 0;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-400 w-16">{label}:</span>
      <div className="flex-1 h-4 bg-slate-800 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100"
          style={{ width: `${normalized}%` }}
        />
      </div>
      <span className="text-xs text-cyan-300 font-mono w-20 text-right">
        {value !== null ? value.toFixed(4) : '---'}
      </span>
    </div>
  );
}
