/**
 * 핑거프린팅 & 중복 제거 - 에러 메시지 해시 생성
 */
import { createHash } from 'node:crypto';
/**
 * 에러 메시지 정규화 - 해시 전 전처리
 *
 * 목적: 동일한 에러를 일관되게 식별하기 위해
 * - 줄 번호, 열 번호 제거
 * - 파일 경로 정규화
 * - 공백 정규화
 * - 동적 값(타임스탬프, 메모리 주소 등) 제거
 */
export function normalizeErrorMessage(message) {
    let normalized = message;
    // 1. 줄/열 번호 제거 (예: :123:45, line 123, at line 123)
    normalized = normalized.replace(/:[0-9]+:[0-9]+/g, ':X:X');
    normalized = normalized.replace(/\bline\s+[0-9]+/gi, 'line X');
    normalized = normalized.replace(/\bat\s+line\s+[0-9]+/gi, 'at line X');
    normalized = normalized.replace(/\bcolumn\s+[0-9]+/gi, 'column X');
    // 2. 파일 경로 정규화 (상대 경로만 유지)
    normalized = normalized.replace(/(?:\/[\w.-]+)+\/([^\/\s:]+)/g, '.../$1');
    normalized = normalized.replace(/(?:[A-Z]:\\[\w.-]+\\)+([^\\]+)/g, '...\\$1');
    // 3. 메모리 주소 제거 (0x...)
    normalized = normalized.replace(/0x[0-9a-fA-F]+/g, '0xXXXX');
    // 4. 타임스탬프 제거
    normalized = normalized.replace(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}/g, 'TIMESTAMP');
    normalized = normalized.replace(/\d{13,}/g, 'TIMESTAMP'); // Unix timestamp (ms)
    // 5. UUID 정규화
    normalized = normalized.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID');
    // 6. 프로세스 ID 정규화
    normalized = normalized.replace(/\bPID[:\s]+[0-9]+/gi, 'PID:X');
    normalized = normalized.replace(/\bpid[:\s]+[0-9]+/gi, 'pid:X');
    // 7. 포트 번호 (컨텍스트에 따라)
    normalized = normalized.replace(/:\d{4,5}(?=\/|$|\s)/g, ':PORT');
    // 8. 공백 정규화
    normalized = normalized.replace(/\s+/g, ' ').trim();
    // 9. 소문자 변환 (대소문자 무관 매칭)
    normalized = normalized.toLowerCase();
    return normalized;
}
/**
 * 에러 메시지 해시 생성
 */
export function generateErrorHash(message) {
    const normalized = normalizeErrorMessage(message);
    return createHash('sha256').update(normalized).digest('hex').slice(0, 16);
}
/**
 * 두 에러가 동일한지 확인 (해시 기반)
 */
export function isSameError(message1, message2) {
    return generateErrorHash(message1) === generateErrorHash(message2);
}
/**
 * 에러 메시지에서 핵심 키워드 추출 (검색용)
 */
export function extractKeywords(message) {
    const normalized = normalizeErrorMessage(message);
    // 일반적인 에러 키워드 패턴
    const keywords = new Set();
    // 에러 타입 추출 (예: TypeError, SyntaxError, TS2307)
    const errorTypes = normalized.match(/\b(?:[a-z]*error|[a-z]*exception|ts\d+|e\d+)\b/gi);
    if (errorTypes) {
        errorTypes.forEach((t) => keywords.add(t.toLowerCase()));
    }
    // 주요 동사/동작 추출
    const actions = normalized.match(/\bcannot\s+\w+|failed\s+to\s+\w+|unable\s+to\s+\w+|could\s+not\s+\w+/gi);
    if (actions) {
        actions.forEach((a) => keywords.add(a.toLowerCase()));
    }
    // 모듈/패키지 이름 추출
    const modules = normalized.match(/'[^']+'/g);
    if (modules) {
        modules.forEach((m) => keywords.add(m.replace(/'/g, '').toLowerCase()));
    }
    // 3자 이상의 단어 추출 (너무 일반적인 단어 제외)
    const STOP_WORDS = new Set([
        'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'has',
        'was', 'were', 'are', 'been', 'being', 'not', 'but', 'what', 'when',
        'where', 'which', 'who', 'will', 'would', 'could', 'should', 'may',
    ]);
    const words = normalized.match(/\b[a-z]{3,}\b/g);
    if (words) {
        words
            .filter((w) => !STOP_WORDS.has(w))
            .slice(0, 10) // 상위 10개만
            .forEach((w) => keywords.add(w));
    }
    return Array.from(keywords);
}
//# sourceMappingURL=hash.js.map