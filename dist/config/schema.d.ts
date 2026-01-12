/**
 * 설정 스키마 - Zod를 사용한 환경 변수 검증
 */
import { z } from 'zod';
export declare const configSchema: z.ZodObject<{
    supabaseUrl: z.ZodOptional<z.ZodString>;
    supabaseKey: z.ZodOptional<z.ZodString>;
    contributorId: z.ZodOptional<z.ZodString>;
    localDbPath: z.ZodDefault<z.ZodString>;
    logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
}, "strip", z.ZodTypeAny, {
    localDbPath: string;
    logLevel: "error" | "debug" | "info" | "warn";
    supabaseUrl?: string | undefined;
    supabaseKey?: string | undefined;
    contributorId?: string | undefined;
}, {
    supabaseUrl?: string | undefined;
    supabaseKey?: string | undefined;
    contributorId?: string | undefined;
    localDbPath?: string | undefined;
    logLevel?: "error" | "debug" | "info" | "warn" | undefined;
}>;
export type ConfigSchema = z.infer<typeof configSchema>;
export declare const validateSupabaseConfig: (config: ConfigSchema) => boolean;
//# sourceMappingURL=schema.d.ts.map