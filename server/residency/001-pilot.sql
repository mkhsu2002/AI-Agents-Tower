CREATE TABLE IF NOT EXISTS residency_pilot (
  invite_hash TEXT PRIMARY KEY NOT NULL,
  expires_at INTEGER NOT NULL,
  resident_hash TEXT UNIQUE,
  request_hash TEXT,
  unit_address TEXT UNIQUE,
  resident_name TEXT,
  home_json TEXT,
  state TEXT NOT NULL DEFAULT 'invited' CHECK (state IN ('invited', 'ready_for_handoff', 'resident')),
  revision INTEGER NOT NULL DEFAULT 0
);
