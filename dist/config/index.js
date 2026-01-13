/**
 * 설정 로더 - 환경 변수에서 설정 로드 및 검증
 *
 * CodeCaseDB v2.0: device_id 기반 식별
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getDeviceId } from '@the-magic-tower/fixhive-shared';
import { configSchema, validateSupabaseConfig } from './schema.js';
/**
 * Default FixHive Community Supabase
 */
const COMMUNITY_SUPABASE = {
    url: 'https://flpqzkrpufrgnpxvftip.supabase.co',
    anonKey: 'sb_publishable_w3Y2uo-0vb4bFVamntChVw_Aqi0rv2y',
};
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
        supabaseUrl: process.env.FIXHIVE_SUPABASE_URL || COMMUNITY_SUPABASE.url,
        supabaseKey: process.env.FIXHIVE_SUPABASE_KEY || COMMUNITY_SUPABASE.anonKey,
        localDbPath: process.env.FIXHIVE_DB_PATH || '~/.fixhive/data.db',
        logLevel: process.env.FIXHIVE_LOG_LEVEL || 'info',
    };
    // 스키마 검증
    const parsed = configSchema.parse(rawConfig);
    // Supabase 설정 검증
    validateSupabaseConfig(parsed);
    // device_id 로드 (공유 패키지에서)
    const deviceId = getDeviceId();
    cachedConfig = {
        supabaseUrl: parsed.supabaseUrl,
        supabaseKey: parsed.supabaseKey,
        deviceId,
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