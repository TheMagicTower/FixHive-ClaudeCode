/**
 * fixhive_vote - 솔루션에 투표
 */
import { z } from 'zod';
export declare const voteToolName = "fixhive_vote";
export declare const voteToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            knowledgeId: {
                type: string;
                description: string;
            };
            helpful: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const voteInputSchema: z.ZodObject<{
    knowledgeId: z.ZodString;
    helpful: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    helpful: boolean;
    knowledgeId: string;
}, {
    helpful: boolean;
    knowledgeId: string;
}>;
export type VoteInput = z.infer<typeof voteInputSchema>;
export declare function handleVote(input: VoteInput): Promise<string>;
//# sourceMappingURL=vote.tool.d.ts.map