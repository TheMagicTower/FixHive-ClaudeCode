/**
 * fixhive_resolve - 에러를 해결됨으로 표시하고 솔루션 공유
 */

import { z } from 'zod';
import { isCloudEnabled, loadConfig } from '../../config/index.js';
import { uploadError, uploadSolution } from '../../cloud/client.js';
import {
  getError,
  updateErrorStatus,
  saveSolution,
  addToPendingSync,
  incrementUploadedSolutions,
} from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';
import { McpError, ErrorCode } from '../../utils/errors.js';

export const resolveToolName = 'fixhive_resolve';

export const resolveToolSchema = {
  name: resolveToolName,
  description: 'Mark an error as resolved and share the solution with the community',
  inputSchema: {
    type: 'object' as const,
    properties: {
      errorId: {
        type: 'string',
        description: 'Error ID from fixhive_list',
      },
      resolution: {
        type: 'string',
        description: 'Description of how the error was resolved',
      },
      resolutionCode: {
        type: 'string',
        description: 'Code fix or diff (optional)',
      },
      upload: {
        type: 'boolean',
        description: 'Upload to community knowledge base (default: true)',
      },
    },
    required: ['errorId', 'resolution'],
  },
};

export const resolveInputSchema = z.object({
  errorId: z.string().uuid(),
  resolution: z.string().min(10),
  resolutionCode: z.string().optional(),
  upload: z.boolean().optional().default(true),
});

export type ResolveInput = z.infer<typeof resolveInputSchema>;

export async function handleResolve(input: ResolveInput): Promise<string> {
  const config = loadConfig();

  // 에러 조회
  const error = getError(input.errorId);
  if (!error) {
    throw new McpError(ErrorCode.NotFound, `Error not found: ${input.errorId}`);
  }

  if (error.status === 'resolved') {
    return JSON.stringify({
      success: false,
      message: 'This error is already marked as resolved.',
      errorId: input.errorId,
    });
  }

  logger.info('Resolving error', {
    errorId: input.errorId,
    upload: input.upload,
  });

  // 에러 상태 업데이트
  updateErrorStatus(input.errorId, 'resolved', new Date());

  // 로컬에 솔루션 저장
  const solutionId = saveSolution({
    errorId: input.errorId,
    resolution: input.resolution,
    resolutionCode: input.resolutionCode,
    upvotes: 0,
    downvotes: 0,
    contributorId: config.contributorId,
  });

  let uploaded = false;
  let cloudErrorId: string | undefined;
  let cloudSolutionId: string | undefined;

  // 클라우드 업로드
  if (input.upload) {
    if (isCloudEnabled()) {
      try {
        // 에러 먼저 업로드
        cloudErrorId = await uploadError(error);

        // 솔루션 업로드
        cloudSolutionId = await uploadSolution(
          cloudErrorId,
          input.resolution,
          input.resolutionCode
        );

        updateErrorStatus(input.errorId, 'uploaded');
        incrementUploadedSolutions();
        uploaded = true;

        logger.info('Solution uploaded to cloud', {
          cloudErrorId,
          cloudSolutionId,
        });
      } catch (uploadError) {
        // 업로드 실패 시 대기열에 추가
        logger.warn('Cloud upload failed, adding to sync queue', {
          error: uploadError,
        });

        addToPendingSync('solution', {
          error,
          resolution: input.resolution,
          resolutionCode: input.resolutionCode,
        });
      }
    } else {
      // 클라우드 비활성화 - 대기열에 추가
      addToPendingSync('solution', {
        error,
        resolution: input.resolution,
        resolutionCode: input.resolutionCode,
      });

      logger.info('Cloud not configured, solution added to sync queue');
    }
  }

  return JSON.stringify({
    success: true,
    message: uploaded
      ? 'Error resolved and solution shared with the community!'
      : input.upload
        ? 'Error resolved locally. Solution will be uploaded when cloud is available.'
        : 'Error resolved locally.',
    errorId: input.errorId,
    solutionId,
    cloudErrorId,
    cloudSolutionId,
    uploaded,
  });
}
