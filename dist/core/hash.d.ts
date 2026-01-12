/**
 * 핑거프린팅 & 중복 제거 - 에러 메시지 해시 생성
 */
/**
 * 에러 메시지 정규화 - 해시 전 전처리
 *
 * 목적: 동일한 에러를 일관되게 식별하기 위해
 * - 줄 번호, 열 번호 제거
 * - 파일 경로 정규화
 * - 공백 정규화
 * - 동적 값(타임스탬프, 메모리 주소 등) 제거
 */
export declare function normalizeErrorMessage(message: string): string;
/**
 * 에러 메시지 해시 생성
 */
export declare function generateErrorHash(message: string): string;
/**
 * 두 에러가 동일한지 확인 (해시 기반)
 */
export declare function isSameError(message1: string, message2: string): boolean;
/**
 * 에러 메시지에서 핵심 키워드 추출 (검색용)
 */
export declare function extractKeywords(message: string): string[];
//# sourceMappingURL=hash.d.ts.map