/**
 * 에러 처리 유틸리티 - MCP 에러 래퍼 및 에러 코드
 */
export declare enum ErrorCode {
    ParseError = -32700,
    InvalidRequest = -32600,
    MethodNotFound = -32601,
    InvalidParams = -32602,
    InternalError = -32603,
    NotFound = -32001,
    AlreadyExists = -32002,
    CloudUnavailable = -32003,
    StorageError = -32004,
    ValidationError = -32005,
    RateLimited = -32006
}
/**
 * MCP 에러 클래스
 */
export declare class McpError extends Error {
    readonly code: ErrorCode;
    readonly data?: unknown;
    constructor(code: ErrorCode, message?: string, data?: unknown);
    /**
     * JSON-RPC 에러 객체로 변환
     */
    toJSON(): {
        code: number;
        message: string;
        data?: unknown;
    };
}
/**
 * 에러를 McpError로 변환
 */
export declare function toMcpError(error: unknown): McpError;
/**
 * 에러 핸들러 - 도구 핸들러에서 사용
 */
export declare function handleToolError(error: unknown): {
    isError: true;
    content: Array<{
        type: 'text';
        text: string;
    }>;
};
//# sourceMappingURL=errors.d.ts.map