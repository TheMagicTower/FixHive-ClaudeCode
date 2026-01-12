/**
 * fixhive_list - 현재 세션에서 감지된 에러 목록
 */
import { z } from 'zod';
export declare const listToolName = "fixhive_list";
export declare const listToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
        };
        required: never[];
    };
};
export declare const listInputSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["unresolved", "resolved", "uploaded"]>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "unresolved" | "resolved" | "uploaded" | undefined;
}, {
    status?: "unresolved" | "resolved" | "uploaded" | undefined;
    limit?: number | undefined;
}>;
export type ListInput = z.infer<typeof listInputSchema>;
export declare function handleList(input: ListInput): Promise<string>;
//# sourceMappingURL=list.tool.d.ts.map