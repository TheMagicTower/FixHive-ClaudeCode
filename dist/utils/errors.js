/**
 * 에러 처리 유틸리티 - MCP 에러 래퍼 및 에러 코드
 */
// MCP 에러 코드 (JSON-RPC 2.0 기반)
export var ErrorCode;
(function (ErrorCode) {
    // 표준 JSON-RPC 에러
    ErrorCode[ErrorCode["ParseError"] = -32700] = "ParseError";
    ErrorCode[ErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    ErrorCode[ErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    ErrorCode[ErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    ErrorCode[ErrorCode["InternalError"] = -32603] = "InternalError";
    // 커스텀 에러 코드 (-32000 ~ -32099)
    ErrorCode[ErrorCode["NotFound"] = -32001] = "NotFound";
    ErrorCode[ErrorCode["AlreadyExists"] = -32002] = "AlreadyExists";
    ErrorCode[ErrorCode["CloudUnavailable"] = -32003] = "CloudUnavailable";
    ErrorCode[ErrorCode["StorageError"] = -32004] = "StorageError";
    ErrorCode[ErrorCode["ValidationError"] = -32005] = "ValidationError";
    ErrorCode[ErrorCode["RateLimited"] = -32006] = "RateLimited";
})(ErrorCode || (ErrorCode = {}));
// 에러 코드별 메시지
const ERROR_MESSAGES = {
    [ErrorCode.ParseError]: 'Parse error',
    [ErrorCode.InvalidRequest]: 'Invalid request',
    [ErrorCode.MethodNotFound]: 'Method not found',
    [ErrorCode.InvalidParams]: 'Invalid params',
    [ErrorCode.InternalError]: 'Internal error',
    [ErrorCode.NotFound]: 'Resource not found',
    [ErrorCode.AlreadyExists]: 'Resource already exists',
    [ErrorCode.CloudUnavailable]: 'Cloud service unavailable',
    [ErrorCode.StorageError]: 'Storage operation failed',
    [ErrorCode.ValidationError]: 'Validation failed',
    [ErrorCode.RateLimited]: 'Rate limit exceeded',
};
/**
 * MCP 에러 클래스
 */
export class McpError extends Error {
    code;
    data;
    constructor(code, message, data) {
        super(message || ERROR_MESSAGES[code]);
        this.name = 'McpError';
        this.code = code;
        this.data = data;
    }
    /**
     * JSON-RPC 에러 객체로 변환
     */
    toJSON() {
        return {
            code: this.code,
            message: this.message,
            ...(this.data !== undefined && { data: this.data }),
        };
    }
}
/**
 * 에러를 McpError로 변환
 */
export function toMcpError(error) {
    if (error instanceof McpError) {
        return error;
    }
    if (error instanceof Error) {
        return new McpError(ErrorCode.InternalError, error.message);
    }
    return new McpError(ErrorCode.InternalError, String(error));
}
/**
 * 에러 핸들러 - 도구 핸들러에서 사용
 */
export function handleToolError(error) {
    const mcpError = toMcpError(error);
    return {
        isError: true,
        content: [
            {
                type: 'text',
                text: JSON.stringify(mcpError.toJSON()),
            },
        ],
    };
}
//# sourceMappingURL=errors.js.map