'use client';

import dynamic from 'next/dynamic';
import { DashboardSkeleton, ResultSkeleton, CardSkeleton } from '@/components/ui/skeleton';

// Lazy load heavy dashboard components
export const LazyExposureRadar = dynamic(
  () => import('@/components/dashboard/ExposureRadar').then((mod) => ({ default: mod.ExposureRadar })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);

export const LazyLiveAuditLog = dynamic(
  () => import('@/components/dashboard/LiveAuditLog').then((mod) => ({ default: mod.LiveAuditLog })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);

export const LazyAttackSurfacePanel = dynamic(
  () => import('@/components/dashboard/AttackSurfacePanel').then((mod) => ({ default: mod.AttackSurfacePanel })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);

export const LazyPrivacyScoreCard = dynamic(
  () => import('@/components/dashboard/PrivacyScoreCard').then((mod) => ({ default: mod.PrivacyScoreCard })),
  {
    loading: () => (
      <div className="lab-panel p-8 animate-pulse">
        <div className="h-32 bg-slate-800/50 rounded" />
      </div>
    ),
    ssr: false,
  }
);

// Lazy load leak test components
export const LazyIPLeakTest = dynamic(
  () => import('@/components/leak-tests/IPLeakTest').then((mod) => ({ default: mod.IPLeakTest })),
  {
    loading: () => <ResultSkeleton />,
    ssr: false,
  }
);

export const LazyDNSLeakTest = dynamic(
  () => import('@/components/leak-tests/DNSLeakTest').then((mod) => ({ default: mod.DNSLeakTest })),
  {
    loading: () => <ResultSkeleton />,
    ssr: false,
  }
);

export const LazyWebRTCLeakTest = dynamic(
  () => import('@/components/leak-tests/WebRTCLeakTest').then((mod) => ({ default: mod.WebRTCLeakTest })),
  {
    loading: () => <ResultSkeleton />,
    ssr: false,
  }
);

// Lazy load lab components (heavy fingerprinting)
export const LazyHardwareLab = dynamic(
  () => import('@/components/labs/HardwareLab').then((mod) => ({ default: mod.HardwareLab })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

export const LazyIdentityLab = dynamic(
  () => import('@/components/labs/IdentityLab').then((mod) => ({ default: mod.IdentityLab })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

export const LazyNetworkLab = dynamic(
  () => import('@/components/labs/NetworkLab').then((mod) => ({ default: mod.NetworkLab })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

export const LazyModernApiLab = dynamic(
  () => import('@/components/labs/ModernApiLab').then((mod) => ({ default: mod.ModernApiLab })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

// Lazy load network components
export const LazyTracerouteMap = dynamic(
  () => import('@/components/network/TracerouteMap').then((mod) => ({ default: mod.TracerouteMap })),
  {
    loading: () => <CardSkeleton className="h-96" />,
    ssr: false,
  }
);

export const LazyLanScannerPanel = dynamic(
  () => import('@/components/network/LanScannerPanel').then((mod) => ({ default: mod.LanScannerPanel })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);

// Lazy load hardware components
export const LazyBioRhythm = dynamic(
  () => import('@/components/hardware/BioRhythm').then((mod) => ({ default: mod.BioRhythm })),
  {
    loading: () => <CardSkeleton className="h-48" />,
    ssr: false,
  }
);

export const LazyMotionVisualizer = dynamic(
  () => import('@/components/hardware/MotionVisualizer').then((mod) => ({ default: mod.MotionVisualizer })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);

// Lazy load modern API components
export const LazySocialLoginDetector = dynamic(
  () => import('@/components/modern/SocialLoginDetector').then((mod) => ({ default: mod.SocialLoginDetector })),
  {
    loading: () => <CardSkeleton className="h-48" />,
    ssr: false,
  }
);

export const LazyApiSurfaceFuzzer = dynamic(
  () => import('@/components/modern/ApiSurfaceFuzzer').then((mod) => ({ default: mod.ApiSurfaceFuzzer })),
  {
    loading: () => <CardSkeleton className="h-64" />,
    ssr: false,
  }
);
