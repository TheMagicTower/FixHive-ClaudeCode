/**
 * fixhive_search - 지식 베이스에서 에러 솔루션 검색
 */

import { z } from 'zod';
import { isCloudEnabled } from '../../config/index.js';
import { findSimilarErrors, summarizeSolutions } from '../../cloud/similarity.js';
import { searchLocalErrors, getSolutionsForError } from '../../storage/local-store.js';
import { logger } from '../../utils/logger.js';
import type { SearchResult } from '../../types/index.js';

export const searchToolName = 'fixhive_search';

export const searchToolSchema = {
  name: searchToolName,
  description: 'Search the FixHive knowledge base for error solutions',
  inputSchema: {
    type: 'object' as const,
    properties: {
      errorMessage: {
        type: 'string',
        description: 'The error message to search for',
      },
      language: {
        type: 'string',
        description: 'Programming language (typescript, python, etc.)',
      },
      framework: {
        type: 'string',
        description: 'Framework (react, nextjs, express, etc.)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 5)',
      },
    },
    required: ['errorMessage'],
  },
};

export const searchInputSchema = z.object({
  errorMessage: z.string().min(1),
  language: z.string().optional(),
  framework: z.string().optional(),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export async function handleSearch(input: SearchInput): Promise<string> {
  logger.info('Searching for error solutions', {
    errorMessage: input.errorMessage.slice(0, 100),
    language: input.language,
    framework: input.framework,
  });

  let results: SearchResult[] = [];

  // 클라우드가 활성화되어 있으면 LLM 유사도 검색 사용
  if (isCloudEnabled()) {
    try {
      results = await findSimilarErrors(input.errorMessage, {
        language: input.language,
        framework: input.framework,
        limit: input.limit,
      });
    } catch (error) {
      logger.warn('Cloud search failed, falling back to local', { error });
    }
  }

  // 클라우드 결과가 없으면 로컬 검색
  if (results.length === 0) {
    const localErrors = searchLocalErrors({
      errorMessage: input.errorMessage,
      language: input.language,
      framework: input.framework,
      limit: input.limit,
    });

    results = localErrors.map((error) => ({
      error,
      solutions: getSolutionsForError(error.id),
      similarity: 0.5, // 로컬 검색은 고정 유사도
    }));
  }

  if (results.length === 0) {
    return JSON.stringify({
      found: false,
      message: 'No similar errors found in the knowledge base.',
      suggestions: [
        'Try searching with different keywords',
        'Check if the error message is complete',
        'Consider contributing your solution after resolving the issue',
      ],
    });
  }

  // 결과 포맷팅
  const formattedResults = results.map((r, i) => ({
    rank: i + 1,
    errorId: r.error.id,
    errorMessage: r.error.message,
    similarity: Math.round(r.similarity * 100) + '%',
    solutionCount: r.solutions.length,
    topSolution: r.solutions[0]
      ? {
          id: r.solutions[0].id,
          resolution: r.solutions[0].resolution,
          votes: r.solutions[0].upvotes - r.solutions[0].downvotes,
        }
      : null,
  }));

  // 첫 번째 결과의 솔루션들 요약 시도
  let summary: string | undefined;
  if (results[0]?.solutions.length > 0 && isCloudEnabled()) {
    try {
      summary = await summarizeSolutions(
        input.errorMessage,
        results[0].solutions
      );
    } catch {
      // 요약 실패 시 무시
    }
  }

  return JSON.stringify({
    found: true,
    resultCount: results.length,
    summary,
    results: formattedResults,
    hint: 'Use fixhive_vote to upvote helpful solutions, or fixhive_helpful to mark them as helpful.',
  });
}
