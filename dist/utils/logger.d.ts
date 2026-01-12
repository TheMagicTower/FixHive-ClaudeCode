/**
 * 구조화된 로깅 - Pino 기반, stderr로 출력 (STDIO 호환)
 */
import pino from 'pino';
/**
 * 로거 인스턴스 가져오기 (싱글톤)
 */
export declare function getLogger(): pino.Logger;
/**
 * 로거 인스턴스 초기화 (테스트용)
 */
export declare function resetLogger(): void;
export declare const logger: {
    debug: (msg: string, data?: object) => void;
    info: (msg: string, data?: object) => void;
    warn: (msg: string, data?: object) => void;
    error: (msg: string, data?: object) => void;
    child: (bindings: object) => pino.Logger<never, boolean>;
};
//# sourceMappingURL=logger.d.ts.map