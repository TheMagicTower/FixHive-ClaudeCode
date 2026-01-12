/**
 * SQLite 로컬 저장소 - 오프라인 캐싱 및 동기화 대기열
 */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { loadConfig } from '../config/index.js';
import { runMigrations } from './migrations.js';
import { logger } from '../utils/logger.js';
let dbInstance = null;
/**
 * 데이터베이스 연결 가져오기
 */
export function getDatabase() {
    if (dbInstance) {
        return dbInstance;
    }
    const config = loadConfig();
    // 디렉토리 생성
    mkdirSync(dirname(config.localDbPath), { recursive: true });
    dbInstance = new Database(config.localDbPath);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    // 마이그레이션 실행
    runMigrations(dbInstance);
    logger.info('Database initialized', { path: config.localDbPath });
    return dbInstance;
}
/**
 * 데이터베이스 연결 종료
 */
export function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
// =====================
// 에러 관련 함수
// =====================
/**
 * 에러 저장
 */
export function saveError(error) {
    const db = getDatabase();
    db.prepare(`
    INSERT INTO errors (
      id, message, message_hash, full_output, language,
      framework, tool_name, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(error.id, error.message, error.messageHash, error.fullOutput ?? null, error.language ?? null, error.framework ?? null, error.toolName, error.status, error.createdAt.toISOString());
    updateStat('total_errors', 1);
    return error.id;
}
/**
 * 에러 조회
 */
export function getError(id) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM errors WHERE id = ?').get(id);
    if (!row)
        return null;
    return rowToError(row);
}
/**
 * 해시로 에러 조회 (중복 체크용)
 */
export function getErrorByHash(hash) {
    const db = getDatabase();
    const row = db.prepare('SELECT * FROM errors WHERE message_hash = ? ORDER BY created_at DESC LIMIT 1').get(hash);
    if (!row)
        return null;
    return rowToError(row);
}
/**
 * 에러 목록 조회
 */
export function listErrors(status, limit = 10) {
    const db = getDatabase();
    let query = 'SELECT * FROM errors';
    const params = [];
    if (status) {
        query += ' WHERE status = ?';
        params.push(status);
    }
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);
    const rows = db.prepare(query).all(...params);
    return rows.map(rowToError);
}
/**
 * 에러 상태 업데이트
 */
export function updateErrorStatus(id, status, resolvedAt) {
    const db = getDatabase();
    db.prepare(`
    UPDATE errors
    SET status = ?, resolved_at = ?
    WHERE id = ?
  `).run(status, resolvedAt?.toISOString() ?? null, id);
    if (status === 'resolved') {
        updateStat('resolved_errors', 1);
    }
}
// =====================
// 솔루션 관련 함수
// =====================
/**
 * 솔루션 저장
 */
export function saveSolution(solution) {
    const db = getDatabase();
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    db.prepare(`
    INSERT INTO solutions (
      id, error_id, resolution, resolution_code,
      upvotes, downvotes, contributor_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, solution.errorId, solution.resolution, solution.resolutionCode ?? null, solution.upvotes, solution.downvotes, solution.contributorId, createdAt);
    return id;
}
/**
 * 에러에 대한 솔루션 조회
 */
export function getSolutionsForError(errorId) {
    const db = getDatabase();
    const rows = db.prepare(`
    SELECT * FROM solutions
    WHERE error_id = ?
    ORDER BY upvotes DESC, created_at DESC
  `).all(errorId);
    return rows.map(rowToSolution);
}
// =====================
// 동기화 대기열 함수
// =====================
/**
 * 동기화 대기열에 추가
 */
export function addToPendingSync(type, data) {
    const db = getDatabase();
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    db.prepare(`
    INSERT INTO pending_sync (id, type, data, created_at, retry_count)
    VALUES (?, ?, ?, ?, 0)
  `).run(id, type, JSON.stringify(data), createdAt);
    return id;
}
/**
 * 대기 중인 동기화 항목 조회
 */
export function getPendingSyncItems(limit = 50) {
    const db = getDatabase();
    const rows = db.prepare(`
    SELECT * FROM pending_sync
    ORDER BY created_at ASC
    LIMIT ?
  `).all(limit);
    return rows.map((row) => ({
        id: row.id,
        type: row.type,
        data: JSON.parse(row.data),
        createdAt: new Date(row.created_at),
        retryCount: row.retry_count,
    }));
}
/**
 * 동기화 항목 삭제
 */
export function removePendingSync(id) {
    const db = getDatabase();
    db.prepare('DELETE FROM pending_sync WHERE id = ?').run(id);
}
/**
 * 재시도 횟수 증가
 */
export function incrementRetryCount(id) {
    const db = getDatabase();
    db.prepare('UPDATE pending_sync SET retry_count = retry_count + 1 WHERE id = ?').run(id);
}
// =====================
// 통계 함수
// =====================
/**
 * 통계 조회
 */
export function getStats() {
    const db = getDatabase();
    const rows = db.prepare('SELECT key, value FROM stats').all();
    const statsMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
        totalErrors: statsMap.total_errors ?? 0,
        resolvedErrors: statsMap.resolved_errors ?? 0,
        uploadedSolutions: statsMap.uploaded_solutions ?? 0,
        helpfulVotes: statsMap.helpful_votes ?? 0,
    };
}
/**
 * 통계 업데이트
 */
function updateStat(key, increment) {
    const db = getDatabase();
    db.prepare('UPDATE stats SET value = value + ? WHERE key = ?').run(increment, key);
}
/**
 * 업로드 통계 증가 (외부 호출용)
 */
export function incrementUploadedSolutions() {
    updateStat('uploaded_solutions', 1);
}
/**
 * 도움 투표 통계 증가 (외부 호출용)
 */
export function incrementHelpfulVotes() {
    updateStat('helpful_votes', 1);
}
// =====================
// 로컬 검색 함수
// =====================
/**
 * 로컬 에러 검색 (키워드 기반)
 */
export function searchLocalErrors(query) {
    const db = getDatabase();
    let sql = 'SELECT * FROM errors WHERE 1=1';
    const params = [];
    // 메시지 검색 (LIKE)
    if (query.errorMessage) {
        sql += ' AND message LIKE ?';
        params.push(`%${query.errorMessage}%`);
    }
    // 언어 필터
    if (query.language) {
        sql += ' AND language = ?';
        params.push(query.language);
    }
    // 프레임워크 필터
    if (query.framework) {
        sql += ' AND framework = ?';
        params.push(query.framework);
    }
    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(query.limit ?? 10);
    const rows = db.prepare(sql).all(...params);
    return rows.map(rowToError);
}
// =====================
// 유틸리티 함수
// =====================
function rowToError(row) {
    return {
        id: row.id,
        message: row.message,
        messageHash: row.message_hash,
        fullOutput: row.full_output,
        language: row.language,
        framework: row.framework,
        toolName: row.tool_name,
        status: row.status,
        createdAt: new Date(row.created_at),
        resolvedAt: row.resolved_at
            ? new Date(row.resolved_at)
            : undefined,
    };
}
function rowToSolution(row) {
    return {
        id: row.id,
        errorId: row.error_id,
        resolution: row.resolution,
        resolutionCode: row.resolution_code,
        upvotes: row.upvotes,
        downvotes: row.downvotes,
        contributorId: row.contributor_id,
        createdAt: new Date(row.created_at),
    };
}
//# sourceMappingURL=local-store.js.map