/**
 * fixhive_stats - 사용 통계 조회
 */

import { z } from 'zod';
import { getStats, listErrors } from '../../storage/local-store.js';
import { isCloudEnabled, loadConfig } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export const statsToolName = 'fixhive_stats';

export const statsToolSchema = {
  name: statsToolName,
  description: 'View FixHive usage statistics',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: [],
  },
};

export const statsInputSchema = z.object({});

export type StatsInput = z.infer<typeof statsInputSchema>;

export async function handleStats(_input: StatsInput): Promise<string> {
  logger.debug('Fetching stats');

  const stats = getStats();
  const config = loadConfig();

  // 최근 에러 가져오기 (언어/프레임워크 통계용)
  const recentErrors = listErrors(undefined, 100);

  // 언어별 통계
  const languageStats: Record<string, number> = {};
  for (const error of recentErrors) {
    if (error.language) {
      languageStats[error.language] = (languageStats[error.language] || 0) + 1;
    }
  }

  // 프레임워크별 통계
  const frameworkStats: Record<string, number> = {};
  for (const error of recentErrors) {
    if (error.framework) {
      frameworkStats[error.framework] = (frameworkStats[error.framework] || 0) + 1;
    }
  }

  // 해결률 계산
  const resolutionRate =
    stats.totalErrors > 0
      ? Math.round((stats.resolvedErrors / stats.totalErrors) * 100)
      : 0;

  return JSON.stringify({
    overview: {
      totalErrors: stats.totalErrors,
      resolvedErrors: stats.resolvedErrors,
      uploadedSolutions: stats.uploadedSolutions,
      helpfulVotes: stats.helpfulVotes,
      resolutionRate: `${resolutionRate}%`,
    },
    breakdown: {
      byLanguage: languageStats,
      byFramework: frameworkStats,
    },
    configuration: {
      cloudEnabled: isCloudEnabled(),
      contributorId: config.contributorId,
    },
    message:
      stats.totalErrors === 0
        ? 'No errors detected yet. FixHive will automatically track errors from tool outputs.'
        : `You have resolved ${stats.resolvedErrors} out of ${stats.totalErrors} errors (${resolutionRate}% resolution rate).`,
  });
}
