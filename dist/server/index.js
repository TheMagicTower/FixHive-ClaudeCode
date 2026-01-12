/**
 * MCP 서버 초기화 - FixHive MCP Server
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../config/index.js';
import { getToolList, handleToolCall } from './tools/index.js';
import { setServerInstance } from '../cloud/similarity.js';
/**
 * MCP 서버 생성 및 설정
 */
export function createServer() {
    const server = new Server({
        name: 'fixhive',
        version: '0.1.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // similarity.ts에서 LLM 호출할 수 있도록 서버 인스턴스 설정
    setServerInstance(server);
    // 도구 목록 핸들러
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        logger.debug('Listing tools');
        return getToolList();
    });
    // 도구 호출 핸들러
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        logger.debug('Tool called', { name, args });
        const result = await handleToolCall(name, args);
        logger.debug('Tool result', { name, isError: result.isError });
        return result;
    });
    return server;
}
/**
 * 서버 시작
 */
export async function startServer() {
    const config = loadConfig();
    logger.info('Starting FixHive MCP server', {
        version: '0.1.0',
        cloudEnabled: !!config.supabaseUrl,
    });
    const server = createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('FixHive MCP server running');
    // 종료 시그널 처리
    process.on('SIGINT', async () => {
        logger.info('Shutting down server');
        await server.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        logger.info('Shutting down server');
        await server.close();
        process.exit(0);
    });
}
//# sourceMappingURL=index.js.map