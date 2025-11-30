'use client';

import { LabShell } from '@/components/layout/LabShell';
import { useNetworkInsights } from '@/hooks/useNetworkInsights';
import { TracerouteMap } from '@/components/network/TracerouteMap';
import { Ja3Card } from '@/components/network/Ja3Card';
import { LanScannerPanel } from '@/components/network/LanScannerPanel';
import { SpecimenTestCard } from '@/components/dashboard/SpecimenTestCard';
import { useWebRTCDetect } from '@/hooks/useWebRTCDetect';

export function NetworkLab() {
  const { data, loading, error } = useNetworkInsights();
  const {
    data: webrtcData,
    loading: webrtcLoading,
    progress,
    detect: detectWebRTC,
  } = useWebRTCDetect();

  const statusReadings = [
    {
      label: 'Traceroute',
      value: data ? `${data.traceroute.length} hops` : 'IDLE',
      tone: data ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'JA3',
      value: data?.ja3.hash.slice(0, 8) || 'IDLE',
      tone: data ? 'active' as const : 'neutral' as const,
    },
    {
      label: 'LAN',
      value: data ? `${data.lanHosts.length} hosts` : 'IDLE',
      tone: data ? 'active' as const : 'neutral' as const,
    },
  ];

  return (
    <LabShell statusReadings={statusReadings} diagnosticsRunning={loading}>
      <div className="space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Network Lab</p>
          <h1 className="mt-2 text-4xl font-light text-slate-100">Protocol Deep Dive</h1>
          <p className="mt-2 text-sm text-slate-400">Traceroute visualizations, JA3 fingerprinting, and LAN scanning.</p>
          {error && <p className="text-xs text-orange-400">{error}</p>}
        </header>
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <TracerouteMap hops={data?.traceroute || []} />
          {data && <Ja3Card hash={data.ja3.hash} userAgent={data.ja3.userAgent} ciphers={data.ja3.ciphers} />}
        </div>
        {data && <LanScannerPanel hosts={data.lanHosts} />}
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-slate-500">WebRTC Playback</p>
          <div className="mt-4">
            <SpecimenTestCard
              title="WebRTC Leak"
              description="Replay STUN/TURN candidates and NAT traversal"
              status={webrtcLoading ? 'running' : webrtcData ? 'passed' : 'idle'}
              metric={webrtcLoading ? `${progress}%` : webrtcData?.riskLevel.toUpperCase()}
              onRun={detectWebRTC}
              href="/tests/webrtc-leak"
            />
          </div>
        </div>
      </div>
    </LabShell>
  );
}
