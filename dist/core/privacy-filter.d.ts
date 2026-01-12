/**
 * 민감정보 필터링 - API 키, 토큰, 이메일, 경로 등 자동 마스킹
 */
/**
 * 민감정보 필터링 결과
 */
export interface FilterResult {
    filtered: string;
    redactedCount: number;
    redactedTypes: string[];
}
/**
 * 텍스트에서 민감정보 필터링
 */
export declare function filterSensitiveData(text: string): FilterResult;
/**
 * 민감정보가 포함되어 있는지 확인
 */
export declare function containsSensitiveData(text: string): boolean;
/**
 * 커스텀 패턴 추가 (런타임)
 */
export declare function addCustomPattern(name: string, pattern: RegExp, replacement: string): void;
//# sourceMappingURL=privacy-filter.d.ts.map