CREATE TABLE IF NOT EXISTS leak_logs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  privacy_score INTEGER DEFAULT 0,
  entropy_score REAL DEFAULT 0,
  leaks_webrtc INTEGER DEFAULT 0,
  leaks_dns TEXT DEFAULT 'none',
  leaks_battery INTEGER DEFAULT 0,
  leaks_motion INTEGER DEFAULT 0,
  resolver_ip TEXT,
  resolver_country TEXT,
  colo TEXT,
  api_surface TEXT,
  full_report_blob TEXT
);
