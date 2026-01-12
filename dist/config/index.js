/**
 * 설정 로더 - 환경 변수에서 설정 로드 및 검증
 */
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { configSchema, validateSupabaseConfig } from './schema.js';
let cachedConfig = null;
/**
 * 경로에서 ~ 를 홈 디렉토리로 확장
 */
function expandPath(path) {
    if (path.startsWith('~')) {
        return join(homedir(), path.slice(1));
    }
    return path;
}
/**
 * 환경 변수에서 설정 로드
 */
export function loadConfig() {
    if (cachedConfig) {
        return cachedConfig;
    }
    const rawConfig = {
        supabaseUrl: process.env.FIXHIVE_SUPABASE_URL,
        supabaseKey: process.env.FIXHIVE_SUPABASE_KEY,
        contributorId: process.env.FIXHIVE_CONTRIBUTOR_ID,
        localDbPath: process.env.FIXHIVE_DB_PATH || '~/.fixhive/data.db',
        logLevel: process.env.FIXHIVE_LOG_LEVEL || 'info',
    };
    // 스키마 검증
    const parsed = configSchema.parse(rawConfig);
    // Supabase 설정 검증
    validateSupabaseConfig(parsed);
    // 기여자 ID 자동 생성
    const contributorId = parsed.contributorId || randomUUID();
    cachedConfig = {
        supabaseUrl: parsed.supabaseUrl,
        supabaseKey: parsed.supabaseKey,
        contributorId,
        localDbPath: expandPath(parsed.localDbPath),
        logLevel: parsed.logLevel,
    };
    return cachedConfig;
}
/**
 * 클라우드 모드 여부 확인
 */
export function isCloudEnabled() {
    const config = loadConfig();
    return !!(config.supabaseUrl && config.supabaseKey);
}
/**
 * 설정 캐시 초기화 (테스트용)
 */
export function resetConfig() {
    cachedConfig = null;
}
export { configSchema, validateSupabaseConfig } from './schema.js';
//# sourceMappingURL=index.js.map