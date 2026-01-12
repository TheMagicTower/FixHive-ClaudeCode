/**
 * 도구 등록 배럴 - 모든 도구 내보내기 및 등록
 */

import { handleToolError } from '../../utils/errors.js';

// 도구 임포트
import {
  searchToolName,
  searchToolSchema,
  searchInputSchema,
  handleSearch,
} from './search.tool.js';

import {
  resolveToolName,
  resolveToolSchema,
  resolveInputSchema,
  handleResolve,
} from './resolve.tool.js';

import {
  listToolName,
  listToolSchema,
  listInputSchema,
  handleList,
} from './list.tool.js';

import {
  voteToolName,
  voteToolSchema,
  voteInputSchema,
  handleVote,
} from './vote.tool.js';

import {
  statsToolName,
  statsToolSchema,
  statsInputSchema,
  handleStats,
} from './stats.tool.js';

import {
  helpfulToolName,
  helpfulToolSchema,
  helpfulInputSchema,
  handleHelpful,
} from './helpful.tool.js';

import {
  reportToolName,
  reportToolSchema,
  reportInputSchema,
  handleReport,
} from './report.tool.js';

// 모든 도구 스키마 내보내기
export const toolSchemas = [
  searchToolSchema,
  resolveToolSchema,
  listToolSchema,
  voteToolSchema,
  statsToolSchema,
  helpfulToolSchema,
  reportToolSchema,
];

// 도구 핸들러 맵
type ToolHandler = (args: unknown) => Promise<string>;

const toolHandlers: Record<string, { schema: unknown; handler: ToolHandler }> = {
  [searchToolName]: {
    schema: searchInputSchema,
    handler: async (args) => handleSearch(searchInputSchema.parse(args)),
  },
  [resolveToolName]: {
    schema: resolveInputSchema,
    handler: async (args) => handleResolve(resolveInputSchema.parse(args)),
  },
  [listToolName]: {
    schema: listInputSchema,
    handler: async (args) => handleList(listInputSchema.parse(args)),
  },
  [voteToolName]: {
    schema: voteInputSchema,
    handler: async (args) => handleVote(voteInputSchema.parse(args)),
  },
  [statsToolName]: {
    schema: statsInputSchema,
    handler: async (args) => handleStats(statsInputSchema.parse(args)),
  },
  [helpfulToolName]: {
    schema: helpfulInputSchema,
    handler: async (args) => handleHelpful(helpfulInputSchema.parse(args)),
  },
  [reportToolName]: {
    schema: reportInputSchema,
    handler: async (args) => handleReport(reportInputSchema.parse(args)),
  },
};

/**
 * 도구 호출 처리
 */
export async function handleToolCall(
  name: string,
  args: unknown
): Promise<{
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}> {
  const tool = toolHandlers[name];

  if (!tool) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: `Unknown tool: ${name}` }),
        },
      ],
    };
  }

  try {
    const result = await tool.handler(args);
    return {
      content: [{ type: 'text', text: result }],
    };
  } catch (error) {
    return handleToolError(error);
  }
}

/**
 * 도구 목록 반환
 */
export function getToolList() {
  return {
    tools: toolSchemas,
  };
}
