/**
 * LLM 기반 유사도 검색 - server.createMessage()를 사용하여 클라이언트 LLM 활용
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';
import { McpError, ErrorCode } from '../utils/errors.js';
import { getErrorCandidates, getSolutionsForError } from './client.js';
import type { Solution, SearchResult } from '../types/index.js';

// 서버 인스턴스 저장 (도구에서 설정)
let serverInstance: Server | null = null;

/**
 * 서버 인스턴스 설정
 */
export function setServerInstance(server: Server): void {
  serverInstance = server;
}

/**
 * 서버 인스턴스 가져오기
 */
function getServer(): Server {
  if (!serverInstance) {
    throw new McpError(
      ErrorCode.InternalError,
      'Server instance not initialized'
    );
  }
  return serverInstance;
}

/**
 * LLM 응답 파싱
 */
interface SimilarityResponse {
  matches: number[];
  reasoning: string;
}

function parseResponse(content: unknown): SimilarityResponse {
  if (typeof content !== 'object' || content === null) {
    throw new McpError(ErrorCode.InternalError, 'Invalid LLM response format');
  }

  const obj = content as Record<string, unknown>;

  if (obj.type === 'text' && typeof obj.text === 'string') {
    // JSON 블록 추출
    const jsonMatch = obj.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as SimilarityResponse;
      } catch {
        throw new McpError(ErrorCode.InternalError, 'Failed to parse LLM JSON response');
      }
    }
  }

  throw new McpError(ErrorCode.InternalError, 'Could not extract JSON from LLM response');
}

/**
 * LLM을 사용한 유사 에러 검색
 */
export async function findSimilarErrors(
  errorMessage: string,
  options?: {
    language?: string;
    framework?: string;
    limit?: number;
  }
): Promise<SearchResult[]> {
  const server = getServer();

  // 후보 에러 가져오기
  const candidates = await getErrorCandidates({
    language: options?.language,
    framework: options?.framework,
    limit: 50, // LLM 컨텍스트 제한 고려
  });

  if (candidates.length === 0) {
    logger.info('No candidates found for similarity search');
    return [];
  }

  // LLM에게 유사도 판단 요청
  const prompt = `다음 에러 메시지와 가장 유사한 항목을 선택하세요.

**검색할 에러:**
${errorMessage}

**후보 목록:**
${candidates.map((c, i) => `${i + 1}. ${c.message.slice(0, 200)}`).join('\n')}

**지침:**
- 에러 타입, 원인, 컨텍스트가 비슷한 항목을 선택하세요
- 최대 ${options?.limit ?? 5}개까지 선택하세요
- 유사한 항목이 없으면 빈 배열을 반환하세요

**JSON 형식으로 응답:**
{ "matches": [선택한 항목의 번호 배열], "reasoning": "선택 이유" }`;

  try {
    const response = await server.createMessage({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
      maxTokens: 500,
    });

    const parsed = parseResponse(response.content);

    logger.debug('LLM similarity response', {
      matches: parsed.matches,
      reasoning: parsed.reasoning,
    });

    // 매칭된 에러와 솔루션 가져오기
    const results: SearchResult[] = [];
    const limit = options?.limit ?? 5;

    for (const idx of parsed.matches.slice(0, limit)) {
      // 1-indexed를 0-indexed로 변환
      const candidate = candidates[idx - 1];
      if (!candidate) continue;

      const solutions = await getSolutionsForError(candidate.id);

      results.push({
        error: {
          id: candidate.id,
          message: candidate.message,
          messageHash: '',
          toolName: 'unknown',
          status: 'resolved',
          createdAt: new Date(),
        },
        solutions,
        similarity: 1 - (parsed.matches.indexOf(idx) / parsed.matches.length), // 순서 기반 유사도
      });
    }

    return results;
  } catch (error) {
    // LLM 호출 실패 시 텍스트 검색으로 폴백
    logger.warn('LLM similarity search failed, falling back to text search', {
      error,
    });

    return fallbackTextSearch(errorMessage, candidates, options?.limit ?? 5);
  }
}

/**
 * 폴백 텍스트 검색 (LLM 실패 시)
 */
async function fallbackTextSearch(
  errorMessage: string,
  candidates: Array<{ id: string; message: string }>,
  limit: number
): Promise<SearchResult[]> {
  // 간단한 키워드 매칭
  const keywords = errorMessage.toLowerCase().split(/\s+/).filter((w) => w.length > 3);

  const scored = candidates.map((c) => {
    const message = c.message.toLowerCase();
    const matchCount = keywords.filter((k) => message.includes(k)).length;
    return { ...c, score: matchCount / keywords.length };
  });

  // 점수순 정렬
  scored.sort((a, b) => b.score - a.score);

  const results: SearchResult[] = [];

  for (const candidate of scored.slice(0, limit)) {
    if (candidate.score === 0) continue;

    const solutions = await getSolutionsForError(candidate.id);

    results.push({
      error: {
        id: candidate.id,
        message: candidate.message,
        messageHash: '',
        toolName: 'unknown',
        status: 'resolved',
        createdAt: new Date(),
      },
      solutions,
      similarity: candidate.score,
    });
  }

  return results;
}

/**
 * LLM을 사용한 해결책 요약
 */
export async function summarizeSolutions(
  errorMessage: string,
  solutions: Solution[]
): Promise<string> {
  if (solutions.length === 0) {
    return '관련 해결책을 찾지 못했습니다.';
  }

  const server = getServer();

  const prompt = `다음 에러에 대한 커뮤니티 해결책들을 요약해주세요.

**에러:**
${errorMessage}

**해결책들:**
${solutions.map((s, i) => `${i + 1}. [👍 ${s.upvotes}] ${s.resolution}`).join('\n')}

**요약 지침:**
- 가장 효과적인 해결책을 먼저 언급
- 핵심 단계를 간결하게 설명
- 여러 해결책이 있으면 공통점과 차이점 언급
- 2-3문장으로 요약`;

  try {
    const response = await server.createMessage({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: prompt,
          },
        },
      ],
      maxTokens: 300,
    });

    if (
      typeof response.content === 'object' &&
      response.content !== null &&
      'text' in response.content
    ) {
      return (response.content as { text: string }).text;
    }

    return solutions[0].resolution;
  } catch (error) {
    logger.warn('Failed to summarize solutions', { error });
    return solutions[0].resolution;
  }
}
