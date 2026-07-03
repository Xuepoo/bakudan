-- schema.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS barrages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  author_id TEXT NOT NULL,
  font_name TEXT,
  font_key TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS likes (
  user_id TEXT NOT NULL,
  barrage_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, barrage_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (barrage_id) REFERENCES barrages(id) ON DELETE CASCADE
);

-- Optimal indexes for querying barrages and likes
CREATE INDEX IF NOT EXISTS idx_barrages_author_id ON barrages(author_id);
CREATE INDEX IF NOT EXISTS idx_barrages_created_at ON barrages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_barrages_likes_created ON barrages(likes DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_barrages_views_created ON barrages(views DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_barrage_created ON likes(barrage_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_created ON likes(user_id, created_at DESC);
