/**
 * 에러 감지 - 도구 출력에서 에러 패턴 매칭
 */
import { randomUUID } from 'node:crypto';
import { filterSensitiveData } from './privacy-filter.js';
import { generateErrorHash } from './hash.js';
const ERROR_PATTERNS = [
    // JavaScript/TypeScript 에러
    {
        name: 'TypeError',
        pattern: /TypeError:\s*.+/g,
    },
    {
        name: 'SyntaxError',
        pattern: /SyntaxError:\s*.+/g,
    },
    {
        name: 'ReferenceError',
        pattern: /ReferenceError:\s*.+/g,
    },
    {
        name: 'RangeError',
        pattern: /RangeError:\s*.+/g,
    },
    {
        name: 'TypeScript Error',
        pattern: /error\s+TS\d+:\s*.+/g,
    },
    // Node.js 에러
    {
        name: 'Node Error',
        pattern: /Error:\s*.+/g,
    },
    {
        name: 'Module Not Found',
        pattern: /Cannot find module\s+['"].+['"]/g,
    },
    {
        name: 'ENOENT',
        pattern: /ENOENT:\s*.+/g,
    },
    {
        name: 'EACCES',
        pattern: /EACCES:\s*.+/g,
    },
    // Python 에러
    {
        name: 'Python Exception',
        pattern: /(?:Traceback \(most recent call last\):[\s\S]*?)?(?:[A-Z][a-z]*Error|Exception):\s*.+/g,
    },
    {
        name: 'Python ImportError',
        pattern: /(?:ImportError|ModuleNotFoundError):\s*.+/g,
    },
    // Rust 에러
    {
        name: 'Rust Error',
        pattern: /error\[E\d+\]:\s*.+/g,
    },
    // Go 에러
    {
        name: 'Go Error',
        pattern: /panic:\s*.+/g,
    },
    // Java 에러
    {
        name: 'Java Exception',
        pattern: /(?:Exception|Error):\s*.+(?:\n\s+at\s+.+)*/g,
    },
    // 빌드 도구 에러
    {
        name: 'npm Error',
        pattern: /npm ERR!\s*.+/g,
    },
    {
        name: 'Webpack Error',
        pattern: /Module build failed:\s*.+/g,
    },
    {
        name: 'ESLint Error',
        pattern: /✖\s+\d+\s+problems?\s+\(\d+\s+errors?,\s+\d+\s+warnings?\)/g,
    },
    // 일반 에러 패턴
    {
        name: 'Failed',
        pattern: /(?:FAIL|FAILED|failed):\s*.+/g,
    },
    {
        name: 'Exit Code',
        pattern: /(?:exit|exited with|returned)\s+(?:code\s+)?[1-9]\d*/gi,
    },
];
// 언어 감지 패턴
const LANGUAGE_PATTERNS = {
    typescript: /\bTS\d+\b|\.tsx?:|tsconfig/i,
    javascript: /\.jsx?:|node_modules|package\.json/i,
    python: /\.py:|Traceback|ImportError|ModuleNotFoundError/i,
    rust: /error\[E\d+\]|Cargo\.toml|\.rs:/i,
    go: /\.go:|panic:|go\.mod/i,
    java: /\.java:|at\s+[\w.]+\([\w.]+\.java:\d+\)/i,
};
// 프레임워크 감지 패턴
const FRAMEWORK_PATTERNS = {
    react: /react|jsx|useState|useEffect/i,
    nextjs: /next\.config|next\/|getServerSideProps|getStaticProps/i,
    express: /express|app\.get|app\.post|router\./i,
    nestjs: /@nestjs|@Injectable|@Controller/i,
    django: /django|models\.py|views\.py/i,
    flask: /flask|@app\.route/i,
    vue: /vue|\.vue:|v-if|v-for/i,
    angular: /angular|@Component|@NgModule/i,
};
/**
 * 도구 출력에서 에러 감지
 */
export function detectErrors(output, toolName) {
    const errors = [];
    const seenHashes = new Set();
    for (const { pattern } of ERROR_PATTERNS) {
        const matches = output.matchAll(pattern);
        for (const match of matches) {
            const errorMessage = match[0];
            // 민감정보 필터링
            const { filtered } = filterSensitiveData(errorMessage);
            // 해시 생성 및 중복 체크
            const hash = generateErrorHash(filtered);
            if (seenHashes.has(hash)) {
                continue;
            }
            seenHashes.add(hash);
            // 언어 감지
            const language = detectLanguage(output);
            // 프레임워크 감지
            const framework = detectFramework(output);
            errors.push({
                id: randomUUID(),
                message: filtered,
                messageHash: hash,
                fullOutput: filterSensitiveData(output).filtered,
                language,
                framework,
                toolName,
                status: 'unresolved',
                createdAt: new Date(),
            });
        }
    }
    return errors;
}
/**
 * 언어 감지
 */
export function detectLanguage(output) {
    for (const [language, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
        if (pattern.test(output)) {
            return language;
        }
    }
    return undefined;
}
/**
 * 프레임워크 감지
 */
export function detectFramework(output) {
    for (const [framework, pattern] of Object.entries(FRAMEWORK_PATTERNS)) {
        if (pattern.test(output)) {
            return framework;
        }
    }
    return undefined;
}
/**
 * 에러 여부만 확인 (빠른 체크)
 */
export function hasError(output) {
    for (const { pattern } of ERROR_PATTERNS) {
        if (pattern.test(output)) {
            pattern.lastIndex = 0;
            return true;
        }
        pattern.lastIndex = 0;
    }
    return false;
}
/**
 * 에러 심각도 판단
 */
export function getErrorSeverity(message) {
    const lower = message.toLowerCase();
    // Critical: 보안, 데이터 손실, 충돌
    if (/security|vulnerability|crash|corruption|data\s*loss/i.test(lower)) {
        return 'critical';
    }
    // High: 빌드 실패, 모듈 누락, 타입 에러
    if (/build\s*fail|cannot\s*find\s*module|type\s*error|syntax\s*error/i.test(lower)) {
        return 'high';
    }
    // Medium: 경고, 폐기 예정
    if (/warning|deprecated|eslint/i.test(lower)) {
        return 'medium';
    }
    // Low: 기타
    return 'low';
}
//# sourceMappingURL=error-detector.js.map