# FixHive for Claude Code

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  </a>
  <img src="https://img.shields.io/badge/Node.js-20%20%7C%2022-green" alt="Node.js Version">
</p>

> Community-based Error Knowledge Sharing for Claude Code (CodeCaseDB v2.0)

FixHive is a Claude Code plugin that provides slash commands, MCP tools, and integrations for searching and sharing error solutions with the developer community.

## Features

- **Slash Commands**: `/fixhive:search` and `/fixhive:report` for quick access
- **MCP Tools**: `fixhive_search_cases`, `fixhive_report_resolution`, `fixhive_vote`
- **Cloud Knowledge Base**: Search community solutions using semantic similarity (pgvector)
- **AI-Guided Normalization**: Normalize error signatures for better matching
- **Environment Matching**: Solutions ranked by language, framework, and package compatibility
- **Privacy Filtering**: Automatically redacts sensitive data (API keys, paths, emails)
- **Community Voting**: Upvote/downvote solutions to help identify the best fixes

## Installation

### Option 1: MCP Server (Recommended)

```bash
claude mcp add fixhive -- npx -y @the-magic-tower/fixhive-claude-code@beta
```

This installs the MCP server with 3 tools: `fixhive_search_cases`, `fixhive_report_resolution`, `fixhive_vote`.

### Option 2: Full Plugin (with Slash Commands)

Clone the repository and use `--plugin-dir`:

```bash
# Clone to a permanent location
git clone https://github.com/TheMagicTower/FixHive-ClaudeCode.git ~/.claude-plugins/fixhive

# Run Claude Code with plugin
claude --plugin-dir ~/.claude-plugins/fixhive
```

This adds slash commands (`/fixhive:search`, `/fixhive:report`) in addition to MCP tools.

### Option 3: Manual MCP Configuration

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "fixhive": {
      "command": "npx",
      "args": ["-y", "@the-magic-tower/fixhive-claude-code@beta"]
    }
  }
}
```

## Plugin Structure

```
fixhive/
├── .claude-plugin/
│   └── plugin.json       # Plugin metadata
├── commands/
│   ├── search.md         # /fixhive:search command
│   └── report.md         # /fixhive:report command
├── .mcp.json             # MCP server configuration
└── src/                  # MCP server source code
```

## Usage

### Slash Commands

- `/fixhive:search` - Search for error solutions
- `/fixhive:report` - Report an error resolution

### MCP Tools

- `fixhive_search_cases` - Search knowledge base with environment matching
- `fixhive_report_resolution` - Report a resolution to the community
- `fixhive_vote` - Vote on solution quality (up/down/report)

## Upgrading from v1.x

See [Migration Guide](MIGRATION.md) for breaking changes:

- Tool names changed: `fixhive_search` → `fixhive_search_cases`
- Local storage removed (cloud-only)
- Automatic device ID (no need for `FIXHIVE_CONTRIBUTOR_ID`)

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    FixHive Flow (v2.0)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Error Occurs                                               │
│      ↓                                                          │
│   2. AI Normalizes Error Signature                              │
│      ↓                                                          │
│   3. Cloud Search (Supabase + pgvector)                         │
│      ↓                                                          │
│   4. Environment Matching (language, framework, packages)       │
│      ↓                                                          │
│   5. Display Ranked Solutions (similarity + votes)              │
│      ↓                                                          │
│   6. Resolution → Upload to Community                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Configuration (Optional)

Environment variables to customize behavior:

```bash
# Use your own Supabase instance instead of community
FIXHIVE_SUPABASE_URL=https://your-project.supabase.co
FIXHIVE_SUPABASE_KEY=your-anon-key
```

| Variable | Default | Description |
|----------|---------|-------------|
| `FIXHIVE_SUPABASE_URL` | Community DB | Your Supabase project URL |
| `FIXHIVE_SUPABASE_KEY` | Community Key | Your Supabase anon key |

## Available Tools

### `fixhive_search_cases`

Search the knowledge base for error solutions.

```typescript
// Arguments
{
  error_message: string;     // Required: The error message to search for
  error_signature?: string;  // Optional: Normalized signature with placeholders
  language?: string;         // Optional: Programming language (typescript, python, etc.)
  framework?: string;        // Optional: Framework (react, nextjs, express, etc.)
  packages?: object;         // Optional: Key dependencies with versions
  limit?: number;            // Optional: Maximum results (default: 5)
}
```

### `fixhive_report_resolution`

Report an error resolution to the community.

```typescript
// Arguments
{
  error_message: string;      // Required: Original error message
  error_signature: string;    // Required: Normalized signature
  solution?: string;          // Optional: How the error was resolved
  cause?: string;             // Optional: Root cause of the error
  solution_steps?: string[];  // Optional: Step-by-step resolution
  code_diff?: string;         // Optional: Code changes that fixed the issue
  language?: string;          // Optional: Programming language
  framework?: string;         // Optional: Framework
  packages?: object;          // Optional: Key dependencies
  used_variant_id?: string;   // Optional: If existing solution helped
}
```

### `fixhive_vote`

Vote on a solution's quality.

```typescript
// Arguments
{
  variant_id: string;  // Required: The variant ID to vote on
  value: 'up' | 'down' | 'report';  // Required: Vote type
  reason?: string;     // Required when reporting: Explain why
}
```

## Error Signature Normalization

When searching or reporting errors, normalize the message by replacing variable parts with placeholders:

| Target | Placeholder | Example |
|--------|-------------|---------|
| Class names | `{class}` | `UserController` → `{class}` |
| File names | `{file}` | `index.ts:42` → `{file}:{id}` |
| Numeric IDs | `{id}` | `user_id: 12345` → `user_id: {id}` |
| UUIDs | `{uuid}` | `550e8400-e29b-...` → `{uuid}` |
| Timestamps | `{timestamp}` | `2024-01-15T10:30:00Z` → `{timestamp}` |
| File paths | `{path}` | `/home/user/project/` → `{path}` |
| DB identifiers | `{table}.{column}` | `users.email` → `{table}.{column}` |
| Routes | `{route}` | `/api/users/123` → `{route}` |
| Views | `{view}` | `admin.users.index` → `{view}` |

**Keep unchanged**: Framework classes, error codes (`SQLSTATE`, `TypeError`), package names

## Example Workflow

```
1. Run a command that fails
   $ npm run build
   > error TS2307: Cannot find module '@/components/Button'

2. Search for solutions
   Use fixhive_search_cases with normalized error signature

3. Apply the top-ranked solution

4. Report your resolution
   Use fixhive_report_resolution to share how you fixed it

5. Vote on solutions that helped
   Use fixhive_vote to upvote helpful solutions
```

## Privacy

FixHive automatically filters sensitive information before sharing:

| Category | Examples | Replacement |
|----------|----------|-------------|
| API Keys | `sk-abc123...`, `ghp_xxx...` | `[API_KEY_REDACTED]` |
| Tokens | `Bearer eyJ...`, `xoxb-...` | `[TOKEN_REDACTED]` |
| Emails | `user@example.com` | `[EMAIL_REDACTED]` |
| Paths | `/Users/john/projects/...` | `[PATH_REDACTED]` |
| Env Vars | `DATABASE_URL=postgres://...` | `[ENV_REDACTED]` |
| Connection Strings | `mongodb://user:pass@...` | `[CONNECTION_STRING_REDACTED]` |
| IP Addresses | `192.168.1.100` | `[IP_REDACTED]` |

## Self-Hosted Setup (Optional)

Skip this section if you're using the default community knowledge base.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project (Free tier works)
2. Wait for the project to be ready

### 2. Enable pgvector Extension

In SQL Editor, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Run Setup Script

Copy and run the contents of `scripts/setup-codecasedb-v2.sql` in the SQL Editor.

### 4. Configure Environment

```bash
# Get these from Settings > API
FIXHIVE_SUPABASE_URL=https://your-project.supabase.co
FIXHIVE_SUPABASE_KEY=your-anon-key
```

## Architecture

```
@the-magic-tower/fixhive-claude-code
├── src/
│   ├── index.ts              # Entry point
│   ├── server/
│   │   ├── index.ts          # MCP server definition
│   │   └── tools/
│   │       ├── index.ts      # Tool registry (3 tools)
│   │       ├── search-cases.tool.ts
│   │       ├── report-resolution.tool.ts
│   │       └── vote.tool.ts
│   ├── config/
│   │   ├── index.ts          # Config loader
│   │   └── schema.ts         # Zod validation
│   └── utils/
│       ├── logger.ts         # Pino logger
│       └── errors.ts         # Error handling
│
└── Shared Package (@the-magic-tower/fixhive-shared)
    ├── types/                # CaseGroup, CaseVariant, Resolution, Vote
    ├── device/               # device_id management
    ├── cloud/                # Supabase client, ranking algorithm
    └── utils/                # hash, privacy filtering
```

## Device Identification

FixHive uses a persistent device ID stored in `~/.codecasedb/device_id`. This ID:
- Is automatically generated on first use (UUID v4)
- Persists across sessions and projects
- Does not contain any personal information
- Used for vote deduplication and contribution tracking

## Ranking Algorithm

Solutions are ranked using:

```
final_score = env_match × 0.4 + success_rate × 0.3 + vote_score × 0.2 + report_factor × 0.1

env_match = language_match × 0.4 + framework_match × 0.4 + packages_overlap × 0.2
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Create a Pull Request

### Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation
- Keep commits atomic

## License

MIT - see [LICENSE](LICENSE) for details.

## Related Packages

- [@the-magic-tower/fixhive-shared](https://github.com/TheMagicTower/fixhive-shared) - Shared utilities
- [@the-magic-tower/fixhive-opencode-plugin](https://github.com/TheMagicTower/FixHive) - OpenCode plugin

## Acknowledgments

- [Claude Code](https://claude.ai/code) - AI coding assistant by Anthropic
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP specification
- [Supabase](https://supabase.com) - Backend as a Service
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
