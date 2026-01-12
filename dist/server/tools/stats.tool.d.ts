/**
 * fixhive_stats - 사용 통계 조회
 */
import { z } from 'zod';
export declare const statsToolName = "fixhive_stats";
export declare const statsToolSchema: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
        required: never[];
    };
};
export declare const statsInputSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type StatsInput = z.infer<typeof statsInputSchema>;
export declare function handleStats(_input: StatsInput): Promise<string>;
//# sourceMappingURL=stats.tool.d.ts.map