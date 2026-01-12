/**
 * SQLite 데이터베이스 마이그레이션
 */
import type Database from 'better-sqlite3';
/**
 * 현재 스키마 버전 조회
 */
export declare function getCurrentVersion(db: Database.Database): number;
/**
 * 마이그레이션 실행
 */
export declare function runMigrations(db: Database.Database): void;
/**
 * 최신 버전 확인
 */
export declare function getLatestVersion(): number;
//# sourceMappingURL=migrations.d.ts.map