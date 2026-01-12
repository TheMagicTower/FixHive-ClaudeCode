/**
 * 도구 등록 배럴 - 모든 도구 내보내기 및 등록
 */
export declare const toolSchemas: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            errorMessage: {
                type: string;
                description: string;
            };
            language: {
                type: string;
                description: string;
            };
            framework: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            errorId: {
                type: string;
                description: string;
            };
            resolution: {
                type: string;
                description: string;
            };
            resolutionCode: {
                type: string;
                description: string;
            };
            upload: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            knowledgeId: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
})[];
/**
 * 도구 호출 처리
 */
export declare function handleToolCall(name: string, args: unknown): Promise<{
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}>;
/**
 * 도구 목록 반환
 */
export declare function getToolList(): {
    tools: ({
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                errorMessage: {
                    type: string;
                    description: string;
                };
                language: {
                    type: string;
                    description: string;
                };
                framework: {
                    type: string;
                    description: string;
                };
                limit: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                errorId: {
                    type: string;
                    description: string;
                };
                resolution: {
                    type: string;
                    description: string;
                };
                resolutionCode: {
                    type: string;
                    description: string;
                };
                upload: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {};
            required: never[];
        };
    } | {
        name: string;
        description: string;
        inputSchema: {
            type: "object";
            properties: {
                knowledgeId: {
                    type: string;
                    description: string;
                };
            };
            required: string[];
        };
    })[];
};
//# sourceMappingURL=index.d.ts.map