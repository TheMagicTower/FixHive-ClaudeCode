/**
 * LLM 기반 유사도 검색 - server.createMessage()를 사용하여 클라이언트 LLM 활용
 */
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Solution, SearchResult } from '../types/index.js';
/**
 * 서버 인스턴스 설정
 */
export declare function setServerInstance(server: Server): void;
/**
 * LLM을 사용한 유사 에러 검색
 */
export declare function findSimilarErrors(errorMessage: string, options?: {
    language?: string;
    framework?: string;
    limit?: number;
}): Promise<SearchResult[]>;
/**
 * LLM을 사용한 해결책 요약
 */
export declare function summarizeSolutions(errorMessage: string, solutions: Solution[]): Promise<string>;
//# sourceMappingURL=similarity.d.ts.map