import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { ScanSession, PrivacyScore, RiskLevel } from './useTestStore';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  session: ScanSession;
  privacyScore: PrivacyScore;
  metadata: {
    userAgent: string;
    ip?: string;
    location?: {
      country: string;
      city: string;
    };
    browser: string;
    os: string;
  };
}

export interface ComparisonResult {
  entry1: HistoryEntry;
  entry2: HistoryEntry;
  scoreDiff: number;
  improvements: string[];
  regressions: string[];
  unchanged: string[];
}

interface HistoryState {
  // History entries (max 30 days)
  entries: HistoryEntry[];
  maxEntries: number;
  retentionDays: number;

  // Selected entries for comparison
  selectedEntries: string[];

  // Comparison result
  comparisonResult: ComparisonResult | null;

  // Actions
  addEntry: (session: ScanSession) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  cleanupOldEntries: () => void;
  selectEntry: (id: string) => void;
  deselectEntry: (id: string) => void;
  clearSelection: () => void;
  compareSelected: () => void;
  getEntryById: (id: string) => HistoryEntry | undefined;
  getEntriesByDateRange: (startDate: Date, endDate: Date) => HistoryEntry[];
  getAverageScore: () => number;
  getScoreTrend: () => 'improving' | 'declining' | 'stable';
}

function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = 'Unknown';
  let os = 'Unknown';

  // Detect browser
  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    browser = 'Safari';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
  }

  // Detect OS
  if (ua.includes('Windows NT')) {
    os = 'Windows';
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS';
  } else if (ua.includes('Linux')) {
    os = ua.includes('Android') ? 'Android' : 'Linux';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
  }

  return { browser, os };
}

function generateEntryId(): string {
  return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const useHistoryStore = create<HistoryState>()(
  devtools(
    persist(
      (set, get) => ({
        entries: [],
        maxEntries: 100,
        retentionDays: 30,
        selectedEntries: [],
        comparisonResult: null,

        addEntry: (session: ScanSession) => {
          if (!session.privacyScore) return;

          const { browser, os } = parseUserAgent(session.userAgent);

          const entry: HistoryEntry = {
            id: generateEntryId(),
            timestamp: Date.now(),
            session,
            privacyScore: session.privacyScore,
            metadata: {
              userAgent: session.userAgent,
              ip: session.ip,
              browser,
              os,
            },
          };

          set((state) => {
            // Add new entry and keep only maxEntries
            const newEntries = [entry, ...state.entries].slice(0, state.maxEntries);
            return { entries: newEntries };
          });

          // Cleanup old entries
          get().cleanupOldEntries();
        },

        removeEntry: (id: string) => {
          set((state) => ({
            entries: state.entries.filter((entry) => entry.id !== id),
            selectedEntries: state.selectedEntries.filter((entryId) => entryId !== id),
          }));
        },

        clearHistory: () => {
          set({
            entries: [],
            selectedEntries: [],
            comparisonResult: null,
          });
        },

        cleanupOldEntries: () => {
          const cutoffTime = Date.now() - THIRTY_DAYS_MS;
          set((state) => ({
            entries: state.entries.filter((entry) => entry.timestamp > cutoffTime),
          }));
        },

        selectEntry: (id: string) => {
          set((state) => {
            // Maximum 2 entries for comparison
            if (state.selectedEntries.length >= 2) {
              return { selectedEntries: [state.selectedEntries[1], id] };
            }
            if (state.selectedEntries.includes(id)) {
              return state;
            }
            return { selectedEntries: [...state.selectedEntries, id] };
          });
        },

        deselectEntry: (id: string) => {
          set((state) => ({
            selectedEntries: state.selectedEntries.filter((entryId) => entryId !== id),
            comparisonResult: null,
          }));
        },

        clearSelection: () => {
          set({
            selectedEntries: [],
            comparisonResult: null,
          });
        },

        compareSelected: () => {
          const { entries, selectedEntries } = get();

          if (selectedEntries.length !== 2) {
            set({ comparisonResult: null });
            return;
          }

          const entry1 = entries.find((e) => e.id === selectedEntries[0]);
          const entry2 = entries.find((e) => e.id === selectedEntries[1]);

          if (!entry1 || !entry2) {
            set({ comparisonResult: null });
            return;
          }

          const improvements: string[] = [];
          const regressions: string[] = [];
          const unchanged: string[] = [];

          // Compare breakdown categories
          const categories = ['ipPrivacy', 'dnsPrivacy', 'webrtcPrivacy', 'fingerprintResistance', 'browserConfig'] as const;

          for (const category of categories) {
            const score1 = entry1.privacyScore.breakdown[category].score;
            const score2 = entry2.privacyScore.breakdown[category].score;

            const categoryName = category
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, (str) => str.toUpperCase());

            if (score2 > score1) {
              improvements.push(`${categoryName}: +${score2 - score1} points`);
            } else if (score2 < score1) {
              regressions.push(`${categoryName}: -${score1 - score2} points`);
            } else {
              unchanged.push(categoryName);
            }
          }

          const comparisonResult: ComparisonResult = {
            entry1,
            entry2,
            scoreDiff: entry2.privacyScore.totalScore - entry1.privacyScore.totalScore,
            improvements,
            regressions,
            unchanged,
          };

          set({ comparisonResult });
        },

        getEntryById: (id: string) => {
          return get().entries.find((entry) => entry.id === id);
        },

        getEntriesByDateRange: (startDate: Date, endDate: Date) => {
          const start = startDate.getTime();
          const end = endDate.getTime();
          return get().entries.filter(
            (entry) => entry.timestamp >= start && entry.timestamp <= end
          );
        },

        getAverageScore: () => {
          const { entries } = get();
          if (entries.length === 0) return 0;

          const sum = entries.reduce((acc, entry) => acc + entry.privacyScore.totalScore, 0);
          return Math.round(sum / entries.length);
        },

        getScoreTrend: () => {
          const { entries } = get();
          if (entries.length < 2) return 'stable';

          // Compare average of first half vs second half
          const midpoint = Math.floor(entries.length / 2);
          const recentEntries = entries.slice(0, midpoint);
          const olderEntries = entries.slice(midpoint);

          const recentAvg =
            recentEntries.reduce((acc, e) => acc + e.privacyScore.totalScore, 0) / recentEntries.length;
          const olderAvg =
            olderEntries.reduce((acc, e) => acc + e.privacyScore.totalScore, 0) / olderEntries.length;

          const diff = recentAvg - olderAvg;
          if (diff > 5) return 'improving';
          if (diff < -5) return 'declining';
          return 'stable';
        },
      }),
      {
        name: 'browserleaks-history-store',
        version: 1,
      }
    ),
    { name: 'HistoryStore' }
  )
);

// Cleanup old entries on store initialization
if (typeof window !== 'undefined') {
  useHistoryStore.getState().cleanupOldEntries();
}
