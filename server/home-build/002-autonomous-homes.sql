CREATE TABLE IF NOT EXISTS home_build_sessions (
  id TEXT PRIMARY KEY,
  owner_hash TEXT NOT NULL UNIQUE,
  network_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('open','planning','question','ready','failed','resident')),
  planning_started INTEGER,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 2),
  brief_json TEXT,
  brief_hash TEXT,
  question TEXT,
  plan_json TEXT,
  projection_json TEXT,
  approval_hash TEXT,
  revision INTEGER NOT NULL DEFAULT 0,
  share_generation INTEGER NOT NULL DEFAULT 0,
  sharing INTEGER NOT NULL DEFAULT 0 CHECK (sharing IN (0,1))
);
CREATE INDEX IF NOT EXISTS home_build_start ON home_build_sessions(network_hash, created_at);
CREATE INDEX IF NOT EXISTS home_build_created ON home_build_sessions(created_at);
CREATE TABLE IF NOT EXISTS home_build_budget (
  day TEXT PRIMARY KEY,
  calls INTEGER NOT NULL CHECK (calls BETWEEN 1 AND 10)
);
CREATE TABLE IF NOT EXISTS home_build_audit (
  seq INTEGER PRIMARY KEY,
  home_id TEXT NOT NULL,
  state TEXT NOT NULL,
  revision INTEGER NOT NULL,
  sharing INTEGER NOT NULL,
  recorded_at INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE TRIGGER IF NOT EXISTS home_build_state_audit
AFTER UPDATE ON home_build_sessions
WHEN OLD.state <> NEW.state OR OLD.revision <> NEW.revision OR OLD.sharing <> NEW.sharing
BEGIN
  INSERT INTO home_build_audit(home_id,state,revision,sharing)
  VALUES (NEW.id,NEW.state,NEW.revision,NEW.sharing);
END;
