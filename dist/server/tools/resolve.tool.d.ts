/**
 * fixhive_resolve - 에러를 해결됨으로 표시하고 솔루션 공유
 */
import { z } from 'zod';
export declare const resolveToolName = "fixhive_resolve";
export declare const resolveToolSchema: {
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
};
export declare const resolveInputSchema: z.ZodObject<{
    errorId: z.ZodString;
    resolution: z.ZodString;
    resolutionCode: z.ZodOptional<z.ZodString>;
    upload: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    resolution: string;
    errorId: string;
    upload: boolean;
    resolutionCode?: string | undefined;
}, {
    resolution: string;
    errorId: string;
    resolutionCode?: string | undefined;
    upload?: boolean | undefined;
}>;
export type ResolveInput = z.infer<typeof resolveInputSchema>;
export declare function handleResolve(input: ResolveInput): Promise<string>;
//# sourceMappingURL=resolve.tool.d.ts.map