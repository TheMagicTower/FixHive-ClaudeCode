/**
 * FixHive TypeScript 타입 정의
 */

// 에러 상태
export type ErrorStatus = 'unresolved' | 'resolved' | 'uploaded';

// 감지된 에러
export interface DetectedError {
  id: string;
  message: string;
  messageHash: string;
  fullOutput?: string;
  language?: string;
  framework?: string;
  toolName: string;
  status: ErrorStatus;
  createdAt: Date;
  resolvedAt?: Date;
}

// 해결책
export interface Solution {
  id: string;
  errorId: string;
  resolution: string;
  resolutionCode?: string;
  upvotes: number;
  downvotes: number;
  contributorId: string;
  createdAt: Date;
}

// 검색 결과
export interface SearchResult {
  error: DetectedError;
  solutions: Solution[];
  similarity: number;
}

// 검색 쿼리
export interface SearchQuery {
  errorMessage: string;
  language?: string;
  framework?: string;
  limit?: number;
}

// 동기화 대기열 항목
export interface PendingSync {
  id: string;
  type: 'error' | 'solution' | 'vote';
  data: unknown;
  createdAt: Date;
  retryCount: number;
}

// 통계
export interface Stats {
  totalErrors: number;
  resolvedErrors: number;
  uploadedSolutions: number;
  helpfulVotes: number;
}

// 투표
export interface Vote {
  knowledgeId: string;
  helpful: boolean;
  contributorId: string;
  createdAt: Date;
}

// 설정
export interface FixHiveConfig {
  supabaseUrl?: string;
  supabaseKey?: string;
  contributorId: string;
  localDbPath: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// MCP 도구 입력 타입
export interface SearchToolInput {
  errorMessage: string;
  language?: string;
  framework?: string;
  limit?: number;
}

export interface ResolveToolInput {
  errorId: string;
  resolution: string;
  resolutionCode?: string;
  upload?: boolean;
}

export interface ListToolInput {
  status?: ErrorStatus;
  limit?: number;
}

export interface VoteToolInput {
  knowledgeId: string;
  helpful: boolean;
}

export interface HelpfulToolInput {
  knowledgeId: string;
}

export interface ReportToolInput {
  knowledgeId: string;
  reason?: string;
}
