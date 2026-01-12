/**
 * Supabase 클라이언트 - 클라우드 데이터베이스 연동
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { loadConfig, isCloudEnabled } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { McpError, ErrorCode } from '../utils/errors.js';
import type { DetectedError, Solution } from '../types/index.js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Supabase 클라이언트 가져오기
 */
export function getSupabaseClient(): SupabaseClient {
  if (!isCloudEnabled()) {
    throw new McpError(
      ErrorCode.CloudUnavailable,
      'Cloud is not configured. Set FIXHIVE_SUPABASE_URL and FIXHIVE_SUPABASE_KEY.'
    );
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = loadConfig();

  supabaseInstance = createClient(
    config.supabaseUrl!,
    config.supabaseKey!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  logger.info('Supabase client initialized');

  return supabaseInstance;
}

/**
 * 클라우드 연결 상태 확인
 */
export async function checkCloudConnection(): Promise<boolean> {
  if (!isCloudEnabled()) {
    return false;
  }

  try {
    const client = getSupabaseClient();
    const { error } = await client.from('errors').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

// =====================
// 에러 관련 함수
// =====================

/**
 * 에러 업로드
 */
export async function uploadError(error: DetectedError): Promise<string> {
  const client = getSupabaseClient();
  const config = loadConfig();

  const { data, error: uploadError } = await client
    .from('errors')
    .insert({
      message: error.message,
      message_hash: error.messageHash,
      language: error.language,
      framework: error.framework,
      contributor_id: config.contributorId,
    })
    .select('id')
    .single();

  if (uploadError) {
    logger.error('Failed to upload error', { error: uploadError });
    throw new McpError(ErrorCode.CloudUnavailable, uploadError.message);
  }

  logger.info('Error uploaded to cloud', { cloudId: data.id });

  return data.id;
}

/**
 * 에러 검색 (텍스트 기반)
 */
export async function searchErrors(
  query: string,
  options?: {
    language?: string;
    framework?: string;
    limit?: number;
  }
): Promise<Array<DetectedError & { solutions: Solution[] }>> {
  const client = getSupabaseClient();

  let queryBuilder = client
    .from('errors')
    .select(`
      id,
      message,
      message_hash,
      language,
      framework,
      created_at,
      solutions (
        id,
        resolution,
        resolution_code,
        upvotes,
        downvotes,
        contributor_id,
        created_at
      )
    `)
    .textSearch('message', query, { type: 'websearch' });

  if (options?.language) {
    queryBuilder = queryBuilder.eq('language', options.language);
  }

  if (options?.framework) {
    queryBuilder = queryBuilder.eq('framework', options.framework);
  }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 10);

  if (error) {
    logger.error('Failed to search errors', { error });
    throw new McpError(ErrorCode.CloudUnavailable, error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    message: row.message,
    messageHash: row.message_hash,
    language: row.language,
    framework: row.framework,
    toolName: 'unknown',
    status: 'resolved' as const,
    createdAt: new Date(row.created_at),
    solutions: (row.solutions ?? []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      errorId: row.id,
      resolution: s.resolution as string,
      resolutionCode: s.resolution_code as string | undefined,
      upvotes: s.upvotes as number,
      downvotes: s.downvotes as number,
      contributorId: s.contributor_id as string,
      createdAt: new Date(s.created_at as string),
    })),
  }));
}

/**
 * 에러 후보 가져오기 (LLM 유사도 검색용)
 */
export async function getErrorCandidates(
  options?: {
    language?: string;
    framework?: string;
    limit?: number;
  }
): Promise<Array<{ id: string; message: string }>> {
  const client = getSupabaseClient();

  let queryBuilder = client
    .from('errors')
    .select('id, message');

  if (options?.language) {
    queryBuilder = queryBuilder.eq('language', options.language);
  }

  if (options?.framework) {
    queryBuilder = queryBuilder.eq('framework', options.framework);
  }

  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 100);

  if (error) {
    logger.error('Failed to get error candidates', { error });
    throw new McpError(ErrorCode.CloudUnavailable, error.message);
  }

  return data ?? [];
}

// =====================
// 솔루션 관련 함수
// =====================

/**
 * 솔루션 업로드
 */
export async function uploadSolution(
  errorId: string,
  resolution: string,
  resolutionCode?: string
): Promise<string> {
  const client = getSupabaseClient();
  const config = loadConfig();

  const { data, error } = await client
    .from('solutions')
    .insert({
      error_id: errorId,
      resolution,
      resolution_code: resolutionCode,
      contributor_id: config.contributorId,
    })
    .select('id')
    .single();

  if (error) {
    logger.error('Failed to upload solution', { error });
    throw new McpError(ErrorCode.CloudUnavailable, error.message);
  }

  logger.info('Solution uploaded to cloud', { cloudId: data.id });

  return data.id;
}

/**
 * 에러에 대한 솔루션 가져오기
 */
export async function getSolutionsForError(errorId: string): Promise<Solution[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from('solutions')
    .select('*')
    .eq('error_id', errorId)
    .order('upvotes', { ascending: false });

  if (error) {
    logger.error('Failed to get solutions', { error });
    throw new McpError(ErrorCode.CloudUnavailable, error.message);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    errorId: row.error_id,
    resolution: row.resolution,
    resolutionCode: row.resolution_code,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    contributorId: row.contributor_id,
    createdAt: new Date(row.created_at),
  }));
}

// =====================
// 투표 관련 함수
// =====================

/**
 * 솔루션 투표
 */
export async function voteSolution(
  knowledgeId: string,
  helpful: boolean
): Promise<void> {
  const client = getSupabaseClient();
  const config = loadConfig();

  // 기존 투표 확인
  const { data: existing } = await client
    .from('votes')
    .select('id, helpful')
    .eq('knowledge_id', knowledgeId)
    .eq('contributor_id', config.contributorId)
    .single();

  if (existing) {
    if (existing.helpful === helpful) {
      // 동일한 투표 - 취소
      await client.from('votes').delete().eq('id', existing.id);

      // 카운트 감소
      await client.rpc(helpful ? 'decrement_upvotes' : 'decrement_downvotes', {
        solution_id: knowledgeId,
      });
    } else {
      // 반대 투표 - 변경
      await client
        .from('votes')
        .update({ helpful })
        .eq('id', existing.id);

      // 카운트 조정
      if (helpful) {
        await client.rpc('increment_upvotes', { solution_id: knowledgeId });
        await client.rpc('decrement_downvotes', { solution_id: knowledgeId });
      } else {
        await client.rpc('decrement_upvotes', { solution_id: knowledgeId });
        await client.rpc('increment_downvotes', { solution_id: knowledgeId });
      }
    }
  } else {
    // 새 투표
    const { error } = await client.from('votes').insert({
      knowledge_id: knowledgeId,
      helpful,
      contributor_id: config.contributorId,
    });

    if (error) {
      logger.error('Failed to vote', { error });
      throw new McpError(ErrorCode.CloudUnavailable, error.message);
    }

    // 카운트 증가
    await client.rpc(helpful ? 'increment_upvotes' : 'increment_downvotes', {
      solution_id: knowledgeId,
    });
  }

  logger.info('Vote recorded', { knowledgeId, helpful });
}

// =====================
// 신고 관련 함수
// =====================

/**
 * 콘텐츠 신고
 */
export async function reportContent(
  knowledgeId: string,
  reason?: string
): Promise<void> {
  const client = getSupabaseClient();
  const config = loadConfig();

  const { error } = await client.from('reports').insert({
    knowledge_id: knowledgeId,
    reason,
    reporter_id: config.contributorId,
  });

  if (error) {
    logger.error('Failed to report content', { error });
    throw new McpError(ErrorCode.CloudUnavailable, error.message);
  }

  logger.info('Content reported', { knowledgeId, reason });
}
