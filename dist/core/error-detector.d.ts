/**
 * 에러 감지 - 도구 출력에서 에러 패턴 매칭
 */
import type { DetectedError } from '../types/index.js';
/**
 * 도구 출력에서 에러 감지
 */
export declare function detectErrors(output: string, toolName: string): DetectedError[];
/**
 * 언어 감지
 */
export declare function detectLanguage(output: string): string | undefined;
/**
 * 프레임워크 감지
 */
export declare function detectFramework(output: string): string | undefined;
/**
 * 에러 여부만 확인 (빠른 체크)
 */
export declare function hasError(output: string): boolean;
/**
 * 에러 심각도 판단
 */
export declare function getErrorSeverity(message: string): 'low' | 'medium' | 'high' | 'critical';
//# sourceMappingURL=error-detector.d.ts.map