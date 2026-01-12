/**
 * fixhive_helpful - 솔루션이 도움이 되었다고 보고
 */
import { z } from 'zod';
import { isCloudEnabled } from '../../config/index.js';
import { voteSolution } from '../../cloud/client.js';
import { addToPendingSync, incrementHelpfulVotes } from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';
export const helpfulToolName = 'fixhive_helpful';
export const helpfulToolSchema = {
    name: helpfulToolName,
    description: 'Report that a solution was helpful',
    inputSchema: {
        type: 'object',
        properties: {
            knowledgeId: {
                type: 'string',
                description: 'Solution ID that was helpful',
            },
        },
        required: ['knowledgeId'],
    },
};
export const helpfulInputSchema = z.object({
    knowledgeId: z.string().uuid(),
});
export async function handleHelpful(input) {
    logger.info('Recording helpful feedback', {
        knowledgeId: input.knowledgeId,
    });
    // helpful은 기본적으로 upvote와 동일
    if (!isCloudEnabled()) {
        addToPendingSync('vote', {
            knowledgeId: input.knowledgeId,
            helpful: true,
        });
        incrementHelpfulVotes();
        return JSON.stringify({
            success: true,
            message: 'Thank you for your feedback! It will be synced when cloud is available.',
            knowledgeId: input.knowledgeId,
            synced: false,
        });
    }
    try {
        await voteSolution(input.knowledgeId, true);
        incrementHelpfulVotes();
        return JSON.stringify({
            success: true,
            message: 'Thank you! Your feedback helps improve the knowledge base.',
            knowledgeId: input.knowledgeId,
            synced: true,
        });
    }
    catch (error) {
        logger.warn('Helpful feedback failed, adding to sync queue', { error });
        addToPendingSync('vote', {
            knowledgeId: input.knowledgeId,
            helpful: true,
        });
        incrementHelpfulVotes();
        return JSON.stringify({
            success: true,
            message: 'Thank you! Your feedback will be synced later.',
            knowledgeId: input.knowledgeId,
            synced: false,
        });
    }
}
//# sourceMappingURL=helpful.tool.js.map