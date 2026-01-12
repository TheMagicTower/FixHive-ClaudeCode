/**
 * SQLite 데이터베이스 마이그레이션
 */

import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial schema - errors, solutions, pending_sync',
    up: (db) => {
      // 에러 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS errors (
          id TEXT PRIMARY KEY,
          message TEXT NOT NULL,
          message_hash TEXT NOT NULL,
          full_output TEXT,
          language TEXT,
          framework TEXT,
          tool_name TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'unresolved',
          created_at TEXT NOT NULL,
          resolved_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_errors_hash ON errors(message_hash);
        CREATE INDEX IF NOT EXISTS idx_errors_status ON errors(status);
        CREATE INDEX IF NOT EXISTS idx_errors_created ON errors(created_at);
      `);

      // 솔루션 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS solutions (
          id TEXT PRIMARY KEY,
          error_id TEXT NOT NULL,
          resolution TEXT NOT NULL,
          resolution_code TEXT,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          contributor_id TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (error_id) REFERENCES errors(id)
        );

        CREATE INDEX IF NOT EXISTS idx_solutions_error ON solutions(error_id);
      `);

      // 동기화 대기열 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS pending_sync (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          data TEXT NOT NULL,
          created_at TEXT NOT NULL,
          retry_count INTEGER DEFAULT 0
        );

        CREATE INDEX IF NOT EXISTS idx_pending_created ON pending_sync(created_at);
      `);

      // 투표 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS votes (
          id TEXT PRIMARY KEY,
          knowledge_id TEXT NOT NULL,
          helpful INTEGER NOT NULL,
          contributor_id TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_votes_unique
          ON votes(knowledge_id, contributor_id);
      `);

      // 통계 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS stats (
          key TEXT PRIMARY KEY,
          value INTEGER DEFAULT 0
        );

        INSERT OR IGNORE INTO stats (key, value) VALUES
          ('total_errors', 0),
          ('resolved_errors', 0),
          ('uploaded_solutions', 0),
          ('helpful_votes', 0);
      `);

      // 마이그레이션 버전 테이블
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_version (
          version INTEGER PRIMARY KEY
        );
      `);
    },
  },
  {
    version: 2,
    description: 'Add cloud_id for synced items',
    up: (db) => {
      db.exec(`
        ALTER TABLE errors ADD COLUMN cloud_id TEXT;
        ALTER TABLE solutions ADD COLUMN cloud_id TEXT;
      `);
    },
  },
];

/**
 * 현재 스키마 버전 조회
 */
export function getCurrentVersion(db: Database.Database): number {
  try {
    const result = db.prepare(
      'SELECT MAX(version) as version FROM schema_version'
    ).get() as { version: number } | undefined;
    return result?.version ?? 0;
  } catch {
    return 0;
  }
}

/**
 * 마이그레이션 실행
 */
export function runMigrations(db: Database.Database): void {
  const currentVersion = getCurrentVersion(db);

  const pendingMigrations = MIGRATIONS.filter(
    (m) => m.version > currentVersion
  );

  if (pendingMigrations.length === 0) {
    return;
  }

  for (const migration of pendingMigrations) {
    db.transaction(() => {
      migration.up(db);
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(
        migration.version
      );
    })();
  }
}

/**
 * 최신 버전 확인
 */
export function getLatestVersion(): number {
  return Math.max(...MIGRATIONS.map((m) => m.version));
}
