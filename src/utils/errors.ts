/**
 * 에러 처리 유틸리티 - MCP 에러 래퍼 및 에러 코드
 */

// MCP 에러 코드 (JSON-RPC 2.0 기반)
export enum ErrorCode {
  // 표준 JSON-RPC 에러
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,

  // 커스텀 에러 코드 (-32000 ~ -32099)
  NotFound = -32001,
  AlreadyExists = -32002,
  CloudUnavailable = -32003,
  StorageError = -32004,
  ValidationError = -32005,
  RateLimited = -32006,
}

// 에러 코드별 메시지
const ERROR_MESSAGES: Record<ErrorCode, string> = {
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
  readonly code: ErrorCode;
  readonly data?: unknown;

  constructor(code: ErrorCode, message?: string, data?: unknown) {
    super(message || ERROR_MESSAGES[code]);
    this.name = 'McpError';
    this.code = code;
    this.data = data;
  }

  /**
   * JSON-RPC 에러 객체로 변환
   */
  toJSON(): { code: number; message: string; data?: unknown } {
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
export function toMcpError(error: unknown): McpError {
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
export function handleToolError(error: unknown): {
  isError: true;
  content: Array<{ type: 'text'; text: string }>;
} {
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
