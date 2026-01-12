#!/usr/bin/env node
/**
 * PostToolUse Hook Handler - 도구 출력에서 에러 자동 감지
 *
 * Claude Code의 PostToolUse 훅에서 호출됩니다.
 * stdin으로 도구 출력을 받아 에러를 감지하고 로컬에 저장합니다.
 */
import { detectErrors, hasError } from '../core/error-detector.js';
import { saveError, getErrorByHash } from '../storage/local-store.js';
import { logger } from '../utils/logger.js';
async function main() {
    // stdin에서 입력 읽기
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString('utf-8');
    if (!input.trim()) {
        process.exit(0);
    }
    let hookInput;
    try {
        hookInput = JSON.parse(input);
    }
    catch {
        // JSON 파싱 실패 - 무시
        process.exit(0);
    }
    const { tool_name, tool_output } = hookInput;
    // 에러가 없으면 빠르게 종료
    if (!hasError(tool_output)) {
        process.exit(0);
    }
    // 에러 감지
    const errors = detectErrors(tool_output, tool_name);
    if (errors.length === 0) {
        process.exit(0);
    }
    logger.info('Errors detected', {
        toolName: tool_name,
        errorCount: errors.length,
    });
    // 중복 체크 및 저장
    for (const error of errors) {
        const existing = getErrorByHash(error.messageHash);
        if (existing) {
            logger.debug('Duplicate error skipped', { hash: error.messageHash });
            continue;
        }
        saveError(error);
        logger.info('Error saved', {
            id: error.id,
            message: error.message.slice(0, 100),
        });
    }
    // 사용자에게 알림 출력 (stdout)
    if (errors.length > 0) {
        console.log(JSON.stringify({
            fixhive: {
                detected: errors.length,
                message: `FixHive detected ${errors.length} error(s). Use fixhive_search to find solutions.`,
                errorIds: errors.map((e) => e.id),
            },
        }));
    }
}
main().catch((error) => {
    logger.error('Hook handler error', { error });
    process.exit(1);
});
//# sourceMappingURL=post-tool-handler.js.map