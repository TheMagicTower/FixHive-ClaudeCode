/**
 * Supabase 클라이언트 - 클라우드 데이터베이스 연동
 */
import { SupabaseClient } from '@supabase/supabase-js';
import type { DetectedError, Solution } from '../types/index.js';
/**
 * Supabase 클라이언트 가져오기
 */
export declare function getSupabaseClient(): SupabaseClient;
/**
 * 클라우드 연결 상태 확인
 */
export declare function checkCloudConnection(): Promise<boolean>;
/**
 * 에러 업로드
 */
export declare function uploadError(error: DetectedError): Promise<string>;
/**
 * 에러 검색 (텍스트 기반)
 */
export declare function searchErrors(query: string, options?: {
    language?: string;
    framework?: string;
    limit?: number;
}): Promise<Array<DetectedError & {
    solutions: Solution[];
}>>;
/**
 * 에러 후보 가져오기 (LLM 유사도 검색용)
 */
export declare function getErrorCandidates(options?: {
    language?: string;
    framework?: string;
    limit?: number;
}): Promise<Array<{
    id: string;
    message: string;
}>>;
/**
 * 솔루션 업로드
 */
export declare function uploadSolution(errorId: string, resolution: string, resolutionCode?: string): Promise<string>;
/**
 * 에러에 대한 솔루션 가져오기
 */
export declare function getSolutionsForError(errorId: string): Promise<Solution[]>;
/**
 * 솔루션 투표
 */
export declare function voteSolution(knowledgeId: string, helpful: boolean): Promise<void>;
/**
 * 콘텐츠 신고
 */
export declare function reportContent(knowledgeId: string, reason?: string): Promise<void>;
//# sourceMappingURL=client.d.ts.map