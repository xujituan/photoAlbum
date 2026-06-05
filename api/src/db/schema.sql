-- 记忆表
CREATE TABLE IF NOT EXISTS memories (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  photo_url     TEXT NOT NULL,
  taken_at      TEXT NOT NULL,
  location_name TEXT,
  lat           REAL,
  lng           REAL,
  mood          TEXT NOT NULL,
  story         TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mood  ON memories(mood);
CREATE INDEX IF NOT EXISTS idx_taken ON memories(taken_at);
