/**
 * 설정 로더 - 환경 변수에서 설정 로드 및 검증
 */
import type { FixHiveConfig } from '../types/index.js';
/**
 * 환경 변수에서 설정 로드
 */
export declare function loadConfig(): FixHiveConfig;
/**
 * 클라우드 모드 여부 확인
 */
export declare function isCloudEnabled(): boolean;
/**
 * 설정 캐시 초기화 (테스트용)
 */
export declare function resetConfig(): void;
export { configSchema, validateSupabaseConfig } from './schema.js';
//# sourceMappingURL=index.d.ts.map