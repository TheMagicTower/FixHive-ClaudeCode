/**
 * fixhive_report - 부적절한 콘텐츠 신고
 */

import { z } from 'zod';
import { isCloudEnabled } from '../../config/index.js';
import { reportContent } from '../../cloud/client.js';
import { addToPendingSync } from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';

export const reportToolName = 'fixhive_report';

export const reportToolSchema = {
  name: reportToolName,
  description: 'Report inappropriate content',
  inputSchema: {
    type: 'object' as const,
    properties: {
      knowledgeId: {
        type: 'string',
        description: 'Content ID to report',
      },
      reason: {
        type: 'string',
        description: 'Reason for reporting (optional)',
      },
    },
    required: ['knowledgeId'],
  },
};

export const reportInputSchema = z.object({
  knowledgeId: z.string().uuid(),
  reason: z.string().optional(),
});

export type ReportInput = z.infer<typeof reportInputSchema>;

export async function handleReport(input: ReportInput): Promise<string> {
  logger.info('Reporting content', {
    knowledgeId: input.knowledgeId,
    reason: input.reason,
  });

  if (!isCloudEnabled()) {
    // 신고는 클라우드가 필요하지만, 대기열에 추가
    addToPendingSync('error', {
      type: 'report',
      knowledgeId: input.knowledgeId,
      reason: input.reason,
    });

    return JSON.stringify({
      success: true,
      message: 'Report recorded locally. It will be submitted when cloud is available.',
      knowledgeId: input.knowledgeId,
      submitted: false,
    });
  }

  try {
    await reportContent(input.knowledgeId, input.reason);

    return JSON.stringify({
      success: true,
      message: 'Thank you for reporting. Our team will review this content.',
      knowledgeId: input.knowledgeId,
      submitted: true,
    });
  } catch (error) {
    logger.warn('Report submission failed, adding to sync queue', { error });

    addToPendingSync('error', {
      type: 'report',
      knowledgeId: input.knowledgeId,
      reason: input.reason,
    });

    return JSON.stringify({
      success: true,
      message: 'Report recorded. It will be submitted later.',
      knowledgeId: input.knowledgeId,
      submitted: false,
    });
  }
}
