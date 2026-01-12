/**
 * fixhive_helpful - 솔루션이 도움이 되었다고 보고
 */
import { z } from 'zod';
export declare const helpfulToolName = "fixhive_helpful";
export declare const helpfulToolSchema: {
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
};
export declare const helpfulInputSchema: z.ZodObject<{
    knowledgeId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    knowledgeId: string;
}, {
    knowledgeId: string;
}>;
export type HelpfulInput = z.infer<typeof helpfulInputSchema>;
export declare function handleHelpful(input: HelpfulInput): Promise<string>;
//# sourceMappingURL=helpful.tool.d.ts.map