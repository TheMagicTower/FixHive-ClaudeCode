/**
 * 민감정보 필터링 - API 키, 토큰, 이메일, 경로 등 자동 마스킹
 */
const SENSITIVE_PATTERNS = [
    // API 키
    {
        name: 'OpenAI API Key',
        pattern: /sk-[a-zA-Z0-9]{20,}/g,
        replacement: '[OPENAI_API_KEY_REDACTED]',
    },
    {
        name: 'Anthropic API Key',
        pattern: /sk-ant-[a-zA-Z0-9-]{20,}/g,
        replacement: '[ANTHROPIC_API_KEY_REDACTED]',
    },
    {
        name: 'GitHub Token',
        pattern: /gh[ps]_[a-zA-Z0-9]{36,}/g,
        replacement: '[GITHUB_TOKEN_REDACTED]',
    },
    {
        name: 'GitHub OAuth',
        pattern: /gho_[a-zA-Z0-9]{36,}/g,
        replacement: '[GITHUB_OAUTH_REDACTED]',
    },
    {
        name: 'AWS Access Key',
        pattern: /AKIA[0-9A-Z]{16}/g,
        replacement: '[AWS_ACCESS_KEY_REDACTED]',
    },
    {
        name: 'AWS Secret Key',
        pattern: /[a-zA-Z0-9/+=]{40}(?=\s|$|")/g,
        replacement: '[AWS_SECRET_KEY_REDACTED]',
    },
    {
        name: 'Generic API Key',
        pattern: /(?:api[_-]?key|apikey|api_secret|secret_key)\s*[=:]\s*['"]?([a-zA-Z0-9_-]{16,})['"]?/gi,
        replacement: '[API_KEY_REDACTED]',
    },
    // 토큰
    {
        name: 'Bearer Token',
        pattern: /Bearer\s+[a-zA-Z0-9._-]+/gi,
        replacement: 'Bearer [TOKEN_REDACTED]',
    },
    {
        name: 'JWT Token',
        pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
        replacement: '[JWT_REDACTED]',
    },
    {
        name: 'Slack Token',
        pattern: /xox[baprs]-[a-zA-Z0-9-]+/g,
        replacement: '[SLACK_TOKEN_REDACTED]',
    },
    // 이메일
    {
        name: 'Email',
        pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
        replacement: '[EMAIL_REDACTED]',
    },
    // 연결 문자열
    {
        name: 'MongoDB Connection String',
        pattern: /mongodb(?:\+srv)?:\/\/[^@\s]+@[^\s]+/g,
        replacement: '[MONGODB_CONNECTION_REDACTED]',
    },
    {
        name: 'PostgreSQL Connection String',
        pattern: /postgres(?:ql)?:\/\/[^@\s]+@[^\s]+/g,
        replacement: '[POSTGRES_CONNECTION_REDACTED]',
    },
    {
        name: 'MySQL Connection String',
        pattern: /mysql:\/\/[^@\s]+@[^\s]+/g,
        replacement: '[MYSQL_CONNECTION_REDACTED]',
    },
    {
        name: 'Redis Connection String',
        pattern: /redis:\/\/[^@\s]*@?[^\s]+/g,
        replacement: '[REDIS_CONNECTION_REDACTED]',
    },
    // 환경 변수 할당
    {
        name: 'Environment Variable',
        pattern: /(?:export\s+)?(?:DATABASE_URL|DB_PASSWORD|SECRET_KEY|PRIVATE_KEY|AUTH_SECRET|SESSION_SECRET)\s*=\s*['"]?[^\s'"]+['"]?/gi,
        replacement: '[ENV_REDACTED]',
    },
    // IP 주소 (프라이빗 범위)
    {
        name: 'Private IP Address',
        pattern: /(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}/g,
        replacement: '[PRIVATE_IP_REDACTED]',
    },
    // SSH 키
    {
        name: 'SSH Private Key',
        pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
        replacement: '[SSH_PRIVATE_KEY_REDACTED]',
    },
    // 비밀번호 패턴
    {
        name: 'Password in URL',
        pattern: /:\/\/([^:]+):([^@]+)@/g,
        replacement: '://[USER_REDACTED]:[PASSWORD_REDACTED]@',
    },
];
// 홈 디렉토리 경로 정규화
const HOME_DIR_PATTERN = /(?:\/Users\/[^\/\s]+|\/home\/[^\/\s]+|C:\\Users\\[^\\]+)/g;
/**
 * 텍스트에서 민감정보 필터링
 */
export function filterSensitiveData(text) {
    let filtered = text;
    const redactedTypes = new Set();
    let redactedCount = 0;
    // 각 패턴에 대해 필터링
    for (const { name, pattern, replacement } of SENSITIVE_PATTERNS) {
        const matches = filtered.match(pattern);
        if (matches) {
            redactedCount += matches.length;
            redactedTypes.add(name);
            filtered = filtered.replace(pattern, replacement);
        }
    }
    // 홈 디렉토리 경로 정규화
    const homeMatches = filtered.match(HOME_DIR_PATTERN);
    if (homeMatches) {
        redactedCount += homeMatches.length;
        redactedTypes.add('Home Directory Path');
        filtered = filtered.replace(HOME_DIR_PATTERN, '~');
    }
    return {
        filtered,
        redactedCount,
        redactedTypes: Array.from(redactedTypes),
    };
}
/**
 * 민감정보가 포함되어 있는지 확인
 */
export function containsSensitiveData(text) {
    for (const { pattern } of SENSITIVE_PATTERNS) {
        if (pattern.test(text)) {
            // 정규식 상태 초기화
            pattern.lastIndex = 0;
            return true;
        }
        pattern.lastIndex = 0;
    }
    if (HOME_DIR_PATTERN.test(text)) {
        HOME_DIR_PATTERN.lastIndex = 0;
        return true;
    }
    HOME_DIR_PATTERN.lastIndex = 0;
    return false;
}
/**
 * 커스텀 패턴 추가 (런타임)
 */
export function addCustomPattern(name, pattern, replacement) {
    SENSITIVE_PATTERNS.push({ name, pattern, replacement });
}
//# sourceMappingURL=privacy-filter.js.map