// State management stores for BrowserLeaks.io
// Using Zustand with devtools and persist middleware

export {
  useTestStore,
  type TestStatus,
  type RiskLevel,
  type TestResult,
  type PrivacyScore,
  type ScanSession,
} from './useTestStore';

export {
  useUIStore,
  type Theme,
  type Locale,
  type Toast,
} from './useUIStore';

export {
  useHistoryStore,
  type HistoryEntry,
  type ComparisonResult,
} from './useHistoryStore';
