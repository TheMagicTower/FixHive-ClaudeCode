/**
 * fixhive_list - 현재 세션에서 감지된 에러 목록
 */
import { z } from 'zod';
import { listErrors } from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';
export const listToolName = 'fixhive_list';
export const listToolSchema = {
    name: listToolName,
    description: 'List errors detected in the current session',
    inputSchema: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['unresolved', 'resolved', 'uploaded'],
                description: 'Filter by error status',
            },
            limit: {
                type: 'number',
                description: 'Maximum number of results (default: 10)',
            },
        },
        required: [],
    },
};
export const listInputSchema = z.object({
    status: z.enum(['unresolved', 'resolved', 'uploaded']).optional(),
    limit: z.number().int().min(1).max(50).optional().default(10),
});
export async function handleList(input) {
    logger.debug('Listing errors', { status: input.status, limit: input.limit });
    const errors = listErrors(input.status, input.limit);
    if (errors.length === 0) {
        return JSON.stringify({
            count: 0,
            message: input.status
                ? `No ${input.status} errors found.`
                : 'No errors detected yet.',
            hint: 'Errors are automatically detected from tool outputs.',
        });
    }
    const formattedErrors = errors.map((e) => ({
        id: e.id,
        message: e.message.slice(0, 200) + (e.message.length > 200 ? '...' : ''),
        language: e.language,
        framework: e.framework,
        status: e.status,
        toolName: e.toolName,
        createdAt: e.createdAt.toISOString(),
        resolvedAt: e.resolvedAt?.toISOString(),
    }));
    // 상태별 통계
    const statusCounts = {
        unresolved: errors.filter((e) => e.status === 'unresolved').length,
        resolved: errors.filter((e) => e.status === 'resolved').length,
        uploaded: errors.filter((e) => e.status === 'uploaded').length,
    };
    return JSON.stringify({
        count: errors.length,
        statusCounts,
        errors: formattedErrors,
        hint: 'Use fixhive_search <errorId> to find solutions, or fixhive_resolve to mark as resolved.',
    });
}
//# sourceMappingURL=list.tool.js.map