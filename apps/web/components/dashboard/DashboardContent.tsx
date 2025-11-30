'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useIPDetect } from '@/hooks/useIPDetect';
import { useDNSDetect } from '@/hooks/useDNSDetect';
import { useWebRTCDetect } from '@/hooks/useWebRTCDetect';
import { usePrivacyScore } from '@/hooks/usePrivacyScore';
import { useTelemetryStream } from '@/hooks/useTelemetryStream';
import { LabShell } from '@/components/layout/LabShell';
import { SpecimenTestCard } from './SpecimenTestCard';
import { CardSkeleton } from '@/components/ui/skeleton';
import type { AuditEntry } from './LiveAuditLog';
import type { AttackSurfaceEntry } from './AttackSurfacePanel';
import {
  LazyPrivacyScoreCard,
  LazyExposureRadar,
  LazyLiveAuditLog,
  LazyAttackSurfacePanel,
} from '@/components/lazy';

interface BatteryManager {
  level: number;
  charging: boolean;
}

interface BatterySnapshot {
  level: string;
  charging: boolean;
}

export function DashboardContent() {
  const [hasStarted, setHasStarted] = useState(false);
  const [battery, setBattery] = useState<BatterySnapshot>({ level: 'CALIBRATING', charging: false });
  const [apiSurface, setApiSurface] = useState<AttackSurfaceEntry[]>([]);

  const {
    data: ipData,
    loading: ipLoading,
    error: ipError,
    detect: detectIP,
  } = useIPDetect();

  const {
    data: dnsData,
    loading: dnsLoading,
    error: dnsError,
    detect: detectDNS,
  } = useDNSDetect();

  const {
    data: webrtcData,
    loading: webrtcLoading,
    error: webrtcError,
    progress: webrtcProgress,
    detect: detectWebRTC,
  } = useWebRTCDetect();

  const { score, loading: scoreLoading } = usePrivacyScore(ipData, dnsData, webrtcData);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      runAllTests();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ipData && hasStarted && !dnsData && !dnsLoading) {
      detectDNS(ipData.ip, ipData.geo.countryCode);
    }
  }, [ipData, hasStarted, dnsData, dnsLoading, detectDNS]);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const navAny = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };

    if (navAny.getBattery) {
      navAny
        .getBattery()
        .then((manager) => {
          setBattery({ level: `${Math.round(manager.level * 100)}%`, charging: manager.charging });
        })
        .catch(() => setBattery({ level: 'UNKNOWN', charging: false }));
    } else {
      setBattery({ level: 'N/A', charging: false });
    }
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setApiSurface([
      {
        label: 'WebRTC',
        status: webrtcLoading ? 'guarded' : webrtcData?.isLeak ? 'active' : 'guarded',
        detail: webrtcData?.isLeak
          ? `Leak via ${webrtcData.localIPs[0] || 'local interface'}`
          : webrtcLoading
          ? 'Probing STUN candidates'
          : 'No local leak detected',
      },
      {
        label: 'Web Bluetooth',
        status: 'bluetooth' in navigator ? 'active' : 'unsupported',
        detail: 'bluetooth' in navigator ? 'Adapter exposed to JS' : 'Not supported',
      },
      {
        label: 'Web USB',
        status: 'usb' in navigator ? 'active' : 'unsupported',
        detail: 'usb' in navigator ? 'Devices queryable' : 'Not supported',
      },
      {
        label: 'Web MIDI',
        status: 'requestMIDIAccess' in navigator ? 'active' : 'unsupported',
        detail: 'requestMIDIAccess' in navigator ? 'Interfaces detectable' : 'Not supported',
      },
      {
        label: 'Clipboard',
        status: navigator.clipboard ? 'active' : 'guarded',
        detail: navigator.clipboard ? 'Read/write available' : 'Permissions gated',
      },
    ]);
  }, [webrtcData, webrtcLoading]);

  const runAllTests = async () => {
    try {
      await Promise.all([detectIP(), detectWebRTC()]);
    } catch (error) {
      console.error('Error running tests:', error);
    }
  };

  const isLoading = ipLoading || dnsLoading || webrtcLoading || scoreLoading;

  const statusReadings = useMemo(
    () => [
      {
        label: 'IP',
        value: ipData ? `${ipData.ip}` : ipError ? 'ERROR' : 'SCANNING',
        detail: ipData ? `${ipData.geo.countryCode} • ${ipData.network.isp}` : ipError || '',
        tone: ipError ? 'alert' as const : ipData ? 'active' as const : 'neutral' as const,
      },
      {
        label: 'DNS',
        value: dnsLoading ? 'SCANNING' : dnsData ? dnsData.leakType.toUpperCase() : 'PENDING',
        detail: dnsData?.servers[0]?.isp || '',
        tone: dnsData?.leakType === 'full' ? 'alert' as const : dnsData ? 'active' as const : 'neutral' as const,
      },
      {
        label: 'WebRTC',
        value: webrtcLoading ? `${webrtcProgress}%` : webrtcData?.isLeak ? 'LEAK' : 'SEALED',
        detail: webrtcError || (webrtcData?.localIPs[0] ?? ''),
        tone: webrtcError || webrtcData?.isLeak ? 'alert' as const : 'active' as const,
      },
      {
        label: 'Battery',
        value: battery.level,
        detail: battery.charging ? 'CHARGING' : 'IDLE',
        tone: battery.level.includes('%') ? 'active' as const : 'neutral' as const,
      },
    ],
    [battery, dnsData, dnsLoading, ipData, ipError, webrtcData, webrtcError, webrtcLoading, webrtcProgress]
  );

  const radarMetrics = useMemo(
    () => [
      { label: 'WebRTC', value: webrtcData?.isLeak ? 95 : webrtcLoading ? 55 : 30 },
      {
        label: 'DNS',
        value: dnsData ? (dnsData.leakType === 'full' ? 90 : dnsData.leakType === 'partial' ? 60 : 25) : 40,
      },
      { label: 'Canvas', value: 65 },
      { label: 'Audio', value: 45 },
      { label: 'Battery', value: battery.level.endsWith('%') ? parseInt(battery.level, 10) : 35 },
      {
        label: 'APIs',
        value: apiSurface.filter((api) => api.status === 'active').length * 20,
      },
    ],
    [apiSurface, battery.level, dnsData, webrtcData, webrtcLoading]
  );

  const auditEntries: AuditEntry[] = useMemo(() => {
    const timestamp = () => new Date().toLocaleTimeString();
    return [
      {
        time: timestamp(),
        label: 'WebRTC Probe',
        status: webrtcLoading ? 'pending' : webrtcData?.isLeak ? 'critical' : 'ok',
        detail: webrtcError
          ? webrtcError
          : webrtcLoading
          ? 'Enumerating ICE candidates'
          : webrtcData?.isLeak
          ? `Leak detected (${webrtcData.localIPs[0] || 'local scope'})`
          : 'No leak observed',
      },
      {
        time: timestamp(),
        label: 'DNS Trace',
        status: dnsLoading ? 'pending' : dnsData?.leakType === 'full' ? 'critical' : 'ok',
        detail: dnsError
          ? dnsError
          : dnsLoading
          ? 'Querying recursive resolvers'
          : dnsData?.servers.slice(0, 2).map((s) => s.isp).join(', ') || 'Awaiting samples',
      },
      {
        time: timestamp(),
        label: 'IP Reputation',
        status: ipLoading ? 'pending' : ipData?.privacy.isVPN || ipData?.privacy.isProxy ? 'warn' : 'ok',
        detail: ipError
          ? ipError
          : ipData
          ? `${ipData.network.isp} • Rep ${ipData.reputation.score}`
          : 'Awaiting response',
      },
    ];
  }, [dnsData, dnsError, dnsLoading, ipData, ipError, ipLoading, webrtcData, webrtcError, webrtcLoading]);

  const ipStatus = ipLoading ? 'running' : ipError ? 'failed' : ipData ? 'passed' : 'idle';
  const dnsStatus = dnsLoading ? 'running' : dnsError ? 'failed' : dnsData ? 'passed' : 'idle';
  const webrtcStatus = webrtcLoading ? 'running' : webrtcError ? 'failed' : webrtcData ? 'passed' : 'idle';
  const liveAuditEntries = useTelemetryStream(auditEntries);

  return (
    <LabShell
      statusReadings={statusReadings}
      diagnosticsRunning={isLoading}
      onRunDiagnostics={runAllTests}
    >
      <div className="space-y-10">
        <div>
          <div className="text-xs uppercase tracking-[0.5em] text-slate-500">Dashboard</div>
          <h1 className="mt-2 text-4xl font-light text-slate-100">
            Privacy Dashboard – Modern Privacy Penetration Lab
          </h1>
        </div>

        <Suspense fallback={<CardSkeleton className="h-40" />}>
          <LazyPrivacyScoreCard score={score} loading={isLoading} />
        </Suspense>

        <div className="grid gap-6 lg:grid-cols-3">
          <SpecimenTestCard
            title="IP Leak"
            description="Check if your real IP is exposed"
            status={ipStatus}
            metric={ipData ? `${ipData.ip} / ${ipData.geo.countryCode}` : undefined}
            onRun={detectIP}
            href="/tests/ip-leak"
          />
          <SpecimenTestCard
            title="DNS Leak"
            description="Detect DNS query leaks"
            status={dnsStatus}
            metric={dnsData ? dnsData.leakType.toUpperCase() : undefined}
            onRun={() => ipData && detectDNS(ipData.ip, ipData.geo.countryCode)}
            href="/tests/dns-leak"
          />
          <SpecimenTestCard
            title="WebRTC Leak"
            description="Test WebRTC IP exposure"
            status={webrtcStatus}
            metric={webrtcLoading ? `${webrtcProgress}%` : webrtcData?.riskLevel.toUpperCase()}
            onRun={detectWebRTC}
            href="/tests/webrtc-leak"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <Suspense fallback={<CardSkeleton className="h-64" />}>
            <LazyExposureRadar metrics={radarMetrics} />
          </Suspense>
          <Suspense fallback={<CardSkeleton className="h-64" />}>
            <LazyLiveAuditLog entries={liveAuditEntries} />
          </Suspense>
          <Suspense fallback={<CardSkeleton className="h-64" />}>
            <LazyAttackSurfacePanel apis={apiSurface} />
          </Suspense>
        </div>
      </div>
    </LabShell>
  );
}
