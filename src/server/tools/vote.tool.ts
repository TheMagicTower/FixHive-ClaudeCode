/**
 * fixhive_vote - 솔루션에 투표
 */

import { z } from 'zod';
import { isCloudEnabled } from '../../config/index.js';
import { voteSolution } from '../../cloud/client.js';
import { addToPendingSync, incrementHelpfulVotes } from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';

export const voteToolName = 'fixhive_vote';

export const voteToolSchema = {
  name: voteToolName,
  description: 'Upvote or downvote a solution',
  inputSchema: {
    type: 'object' as const,
    properties: {
      knowledgeId: {
        type: 'string',
        description: 'Solution ID from search results',
      },
      helpful: {
        type: 'boolean',
        description: 'true for upvote, false for downvote',
      },
    },
    required: ['knowledgeId', 'helpful'],
  },
};

export const voteInputSchema = z.object({
  knowledgeId: z.string().uuid(),
  helpful: z.boolean(),
});

export type VoteInput = z.infer<typeof voteInputSchema>;

export async function handleVote(input: VoteInput): Promise<string> {
  logger.info('Recording vote', {
    knowledgeId: input.knowledgeId,
    helpful: input.helpful,
  });

  if (!isCloudEnabled()) {
    // 클라우드 비활성화 - 대기열에 추가
    addToPendingSync('vote', {
      knowledgeId: input.knowledgeId,
      helpful: input.helpful,
    });

    return JSON.stringify({
      success: true,
      message: 'Vote recorded locally. It will be synced when cloud is available.',
      knowledgeId: input.knowledgeId,
      helpful: input.helpful,
      synced: false,
    });
  }

  try {
    await voteSolution(input.knowledgeId, input.helpful);

    if (input.helpful) {
      incrementHelpfulVotes();
    }

    return JSON.stringify({
      success: true,
      message: input.helpful
        ? 'Upvoted! Thank you for your feedback.'
        : 'Downvoted. Thank you for your feedback.',
      knowledgeId: input.knowledgeId,
      helpful: input.helpful,
      synced: true,
    });
  } catch (error) {
    // 투표 실패 시 대기열에 추가
    logger.warn('Vote failed, adding to sync queue', { error });

    addToPendingSync('vote', {
      knowledgeId: input.knowledgeId,
      helpful: input.helpful,
    });

    return JSON.stringify({
      success: true,
      message: 'Vote recorded locally. It will be synced later.',
      knowledgeId: input.knowledgeId,
      helpful: input.helpful,
      synced: false,
    });
  }
}
