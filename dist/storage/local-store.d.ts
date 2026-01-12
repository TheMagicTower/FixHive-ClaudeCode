/**
 * SQLite 로컬 저장소 - 오프라인 캐싱 및 동기화 대기열
 */
import Database from 'better-sqlite3';
import type { DetectedError, Solution, PendingSync, Stats, ErrorStatus, SearchQuery } from '../types/index.js';
/**
 * 데이터베이스 연결 가져오기
 */
export declare function getDatabase(): Database.Database;
/**
 * 데이터베이스 연결 종료
 */
export declare function closeDatabase(): void;
/**
 * 에러 저장
 */
export declare function saveError(error: DetectedError): string;
/**
 * 에러 조회
 */
export declare function getError(id: string): DetectedError | null;
/**
 * 해시로 에러 조회 (중복 체크용)
 */
export declare function getErrorByHash(hash: string): DetectedError | null;
/**
 * 에러 목록 조회
 */
export declare function listErrors(status?: ErrorStatus, limit?: number): DetectedError[];
/**
 * 에러 상태 업데이트
 */
export declare function updateErrorStatus(id: string, status: ErrorStatus, resolvedAt?: Date): void;
/**
 * 솔루션 저장
 */
export declare function saveSolution(solution: Omit<Solution, 'id' | 'createdAt'>): string;
/**
 * 에러에 대한 솔루션 조회
 */
export declare function getSolutionsForError(errorId: string): Solution[];
/**
 * 동기화 대기열에 추가
 */
export declare function addToPendingSync(type: PendingSync['type'], data: unknown): string;
/**
 * 대기 중인 동기화 항목 조회
 */
export declare function getPendingSyncItems(limit?: number): PendingSync[];
/**
 * 동기화 항목 삭제
 */
export declare function removePendingSync(id: string): void;
/**
 * 재시도 횟수 증가
 */
export declare function incrementRetryCount(id: string): void;
/**
 * 통계 조회
 */
export declare function getStats(): Stats;
/**
 * 업로드 통계 증가 (외부 호출용)
 */
export declare function incrementUploadedSolutions(): void;
/**
 * 도움 투표 통계 증가 (외부 호출용)
 */
export declare function incrementHelpfulVotes(): void;
/**
 * 로컬 에러 검색 (키워드 기반)
 */
export declare function searchLocalErrors(query: SearchQuery): DetectedError[];
//# sourceMappingURL=local-store.d.ts.map