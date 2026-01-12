/**
 * 구조화된 로깅 - Pino 기반, stderr로 출력 (STDIO 호환)
 */
import pino from 'pino';
import { loadConfig } from '../config/index.js';
let loggerInstance = null;
/**
 * 로거 인스턴스 생성
 */
function createLogger() {
    const config = loadConfig();
    return pino({
        name: 'fixhive',
        level: config.logLevel,
        // MCP STDIO 전송과 충돌 방지를 위해 stderr로 출력
        transport: {
            target: 'pino/file',
            options: { destination: 2 }, // stderr
        },
        formatters: {
            level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    });
}
/**
 * 로거 인스턴스 가져오기 (싱글톤)
 */
export function getLogger() {
    if (!loggerInstance) {
        loggerInstance = createLogger();
    }
    return loggerInstance;
}
/**
 * 로거 인스턴스 초기화 (테스트용)
 */
export function resetLogger() {
    loggerInstance = null;
}
// 편의 함수들
export const logger = {
    debug: (msg, data) => getLogger().debug(data, msg),
    info: (msg, data) => getLogger().info(data, msg),
    warn: (msg, data) => getLogger().warn(data, msg),
    error: (msg, data) => getLogger().error(data, msg),
    child: (bindings) => getLogger().child(bindings),
};
//# sourceMappingURL=logger.js.map