/**
 * fixhive_search - 지식 베이스에서 에러 솔루션 검색
 */
import { z } from 'zod';
export declare const searchToolName = "fixhive_search";
export declare const searchToolSchema: {
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
};
export declare const searchInputSchema: z.ZodObject<{
    errorMessage: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    errorMessage: string;
    language?: string | undefined;
    framework?: string | undefined;
}, {
    errorMessage: string;
    language?: string | undefined;
    framework?: string | undefined;
    limit?: number | undefined;
}>;
export type SearchInput = z.infer<typeof searchInputSchema>;
export declare function handleSearch(input: SearchInput): Promise<string>;
//# sourceMappingURL=search.tool.d.ts.map