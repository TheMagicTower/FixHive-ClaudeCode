/**
 * FixHive TypeScript 타입 정의
 */
export type ErrorStatus = 'unresolved' | 'resolved' | 'uploaded';
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
export interface SearchResult {
    error: DetectedError;
    solutions: Solution[];
    similarity: number;
}
export interface SearchQuery {
    errorMessage: string;
    language?: string;
    framework?: string;
    limit?: number;
}
export interface PendingSync {
    id: string;
    type: 'error' | 'solution' | 'vote';
    data: unknown;
    createdAt: Date;
    retryCount: number;
}
export interface Stats {
    totalErrors: number;
    resolvedErrors: number;
    uploadedSolutions: number;
    helpfulVotes: number;
}
export interface Vote {
    knowledgeId: string;
    helpful: boolean;
    contributorId: string;
    createdAt: Date;
}
export interface FixHiveConfig {
    supabaseUrl?: string;
    supabaseKey?: string;
    contributorId: string;
    localDbPath: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
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
//# sourceMappingURL=index.d.ts.map