/**
 * fixhive_report - 부적절한 콘텐츠 신고
 */
import { z } from 'zod';
export declare const reportToolName = "fixhive_report";
export declare const reportToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            knowledgeId: {
                type: string;
                description: string;
            };
            reason: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const reportInputSchema: z.ZodObject<{
    knowledgeId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    knowledgeId: string;
    reason?: string | undefined;
}, {
    knowledgeId: string;
    reason?: string | undefined;
}>;
export type ReportInput = z.infer<typeof reportInputSchema>;
export declare function handleReport(input: ReportInput): Promise<string>;
//# sourceMappingURL=report.tool.d.ts.map