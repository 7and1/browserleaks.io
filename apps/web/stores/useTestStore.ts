import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Test result types
export type TestStatus = 'idle' | 'running' | 'completed' | 'error';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  score: number;
  maxScore: number;
  riskLevel: RiskLevel;
  data: Record<string, unknown>;
  issues: string[];
  timestamp: number;
  duration?: number;
}

export interface PrivacyScore {
  totalScore: number;
  maxScore: number;
  riskLevel: RiskLevel;
  breakdown: {
    ipPrivacy: { score: number; max: number };
    dnsPrivacy: { score: number; max: number };
    webrtcPrivacy: { score: number; max: number };
    fingerprintResistance: { score: number; max: number };
    browserConfig: { score: number; max: number };
  };
}

export interface ScanSession {
  id: string;
  startTime: number;
  endTime?: number;
  results: Record<string, TestResult>;
  privacyScore: PrivacyScore | null;
  userAgent: string;
  ip?: string;
}

interface TestState {
  // Current scan session
  currentSession: ScanSession | null;
  isScanning: boolean;
  scanProgress: number;
  activeTests: string[];

  // Individual test results
  results: Record<string, TestResult>;

  // Privacy score
  privacyScore: PrivacyScore | null;

  // Actions
  startScan: () => void;
  stopScan: () => void;
  updateProgress: (progress: number) => void;
  setTestRunning: (testId: string) => void;
  setTestResult: (testId: string, result: Omit<TestResult, 'id'>) => void;
  setTestError: (testId: string, error: string) => void;
  calculatePrivacyScore: () => void;
  resetResults: () => void;
  completeScan: () => void;
}

const DEFAULT_PRIVACY_SCORE: PrivacyScore = {
  totalScore: 0,
  maxScore: 100,
  riskLevel: 'high',
  breakdown: {
    ipPrivacy: { score: 0, max: 20 },
    dnsPrivacy: { score: 0, max: 15 },
    webrtcPrivacy: { score: 0, max: 15 },
    fingerprintResistance: { score: 0, max: 30 },
    browserConfig: { score: 0, max: 20 },
  },
};

function calculateRiskLevel(score: number, maxScore: number): RiskLevel {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'low';
  if (percentage >= 60) return 'medium';
  if (percentage >= 40) return 'high';
  return 'critical';
}

function generateSessionId(): string {
  return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const useTestStore = create<TestState>()(
  devtools(
    persist(
      (set, get) => ({
        currentSession: null,
        isScanning: false,
        scanProgress: 0,
        activeTests: [],
        results: {},
        privacyScore: null,

        startScan: () => {
          const session: ScanSession = {
            id: generateSessionId(),
            startTime: Date.now(),
            results: {},
            privacyScore: null,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          };

          set({
            currentSession: session,
            isScanning: true,
            scanProgress: 0,
            activeTests: [],
            results: {},
            privacyScore: null,
          });
        },

        stopScan: () => {
          set({
            isScanning: false,
            activeTests: [],
          });
        },

        updateProgress: (progress: number) => {
          set({ scanProgress: Math.min(100, Math.max(0, progress)) });
        },

        setTestRunning: (testId: string) => {
          set((state) => ({
            activeTests: [...state.activeTests.filter((id) => id !== testId), testId],
            results: {
              ...state.results,
              [testId]: {
                id: testId,
                name: testId,
                status: 'running',
                score: 0,
                maxScore: 0,
                riskLevel: 'high',
                data: {},
                issues: [],
                timestamp: Date.now(),
              },
            },
          }));
        },

        setTestResult: (testId: string, result: Omit<TestResult, 'id'>) => {
          const fullResult: TestResult = {
            ...result,
            id: testId,
            status: 'completed',
            riskLevel: calculateRiskLevel(result.score, result.maxScore),
          };

          set((state) => ({
            activeTests: state.activeTests.filter((id) => id !== testId),
            results: {
              ...state.results,
              [testId]: fullResult,
            },
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  results: {
                    ...state.currentSession.results,
                    [testId]: fullResult,
                  },
                }
              : null,
          }));
        },

        setTestError: (testId: string, error: string) => {
          set((state) => ({
            activeTests: state.activeTests.filter((id) => id !== testId),
            results: {
              ...state.results,
              [testId]: {
                id: testId,
                name: testId,
                status: 'error',
                score: 0,
                maxScore: 0,
                riskLevel: 'critical',
                data: { error },
                issues: [error],
                timestamp: Date.now(),
              },
            },
          }));
        },

        calculatePrivacyScore: () => {
          const { results } = get();
          const breakdown = { ...DEFAULT_PRIVACY_SCORE.breakdown };

          // Calculate IP Privacy (20 points)
          const ipResult = results['ip-leak'];
          if (ipResult?.status === 'completed') {
            let ipScore = 20;
            const data = ipResult.data as Record<string, unknown>;
            if (data.isProxy) ipScore -= 5;
            if (data.isDatacenter) ipScore -= 5;
            if ((data.reputation as number) < 50) ipScore -= 5;
            if (data.isBlacklisted) ipScore -= 5;
            breakdown.ipPrivacy.score = Math.max(0, ipScore);
          }

          // Calculate DNS Privacy (15 points)
          const dnsResult = results['dns-leak'];
          if (dnsResult?.status === 'completed') {
            let dnsScore = 15;
            const data = dnsResult.data as Record<string, unknown>;
            if (data.hasFullLeak) dnsScore -= 10;
            else if (data.hasPartialLeak) dnsScore -= 5;
            if (data.usingIspDns) dnsScore -= 3;
            if (!data.hasDoHDoT) dnsScore -= 2;
            breakdown.dnsPrivacy.score = Math.max(0, dnsScore);
          }

          // Calculate WebRTC Privacy (15 points)
          const webrtcResult = results['webrtc-leak'];
          if (webrtcResult?.status === 'completed') {
            let webrtcScore = 15;
            const data = webrtcResult.data as Record<string, unknown>;
            if (data.localIpLeak) webrtcScore -= 3;
            if (data.publicIpLeak) webrtcScore -= 5;
            if (data.mdnsLeak) webrtcScore -= 4;
            if (data.ipv6Leak) webrtcScore -= 3;
            breakdown.webrtcPrivacy.score = Math.max(0, webrtcScore);
          }

          // Calculate Fingerprint Resistance (30 points)
          const canvasResult = results['canvas-fingerprint'];
          const webglResult = results['webgl-fingerprint'];
          const audioResult = results['audio-fingerprint'];
          const fontResult = results['font-detection'];

          let fpScore = 30;
          if (canvasResult?.status === 'completed') {
            const uniqueness = (canvasResult.data as Record<string, number>).uniqueness || 0;
            if (uniqueness > 0.8) fpScore -= 5;
          }
          if (webglResult?.status === 'completed') {
            const uniqueness = (webglResult.data as Record<string, number>).uniqueness || 0;
            if (uniqueness > 0.8) fpScore -= 5;
          }
          if (audioResult?.status === 'completed') {
            const uniqueness = (audioResult.data as Record<string, number>).uniqueness || 0;
            if (uniqueness > 0.7) fpScore -= 3;
          }
          if (fontResult?.status === 'completed') {
            const uniqueness = (fontResult.data as Record<string, number>).uniqueness || 0;
            if (uniqueness > 0.6) fpScore -= 2;
          }
          breakdown.fingerprintResistance.score = Math.max(0, fpScore);

          // Calculate Browser Config (20 points)
          const browserResult = results['browser-fingerprint'];
          if (browserResult?.status === 'completed') {
            let browserScore = 20;
            const data = browserResult.data as Record<string, unknown>;
            if (!data.doNotTrack) browserScore -= 3;
            if (data.cookiesEnabled) browserScore -= 2;
            if ((data.plugins as unknown[])?.length > 5) browserScore -= 3;
            if (!data.adBlocker) browserScore -= 2;
            breakdown.browserConfig.score = Math.max(0, browserScore);
          }

          const totalScore = Object.values(breakdown).reduce((sum, cat) => sum + cat.score, 0);
          const maxScore = Object.values(breakdown).reduce((sum, cat) => sum + cat.max, 0);

          const privacyScore: PrivacyScore = {
            totalScore,
            maxScore,
            riskLevel: calculateRiskLevel(totalScore, maxScore),
            breakdown,
          };

          set((state) => ({
            privacyScore,
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  privacyScore,
                }
              : null,
          }));
        },

        resetResults: () => {
          set({
            currentSession: null,
            isScanning: false,
            scanProgress: 0,
            activeTests: [],
            results: {},
            privacyScore: null,
          });
        },

        completeScan: () => {
          const { calculatePrivacyScore } = get();
          calculatePrivacyScore();

          set((state) => ({
            isScanning: false,
            scanProgress: 100,
            activeTests: [],
            currentSession: state.currentSession
              ? {
                  ...state.currentSession,
                  endTime: Date.now(),
                }
              : null,
          }));
        },
      }),
      {
        name: 'browserleaks-test-store',
        partialize: (state) => ({
          // Only persist completed sessions, not active scan state
          privacyScore: state.privacyScore,
        }),
      }
    ),
    { name: 'TestStore' }
  )
);
