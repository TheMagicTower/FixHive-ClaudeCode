# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FixHive is a Claude Code MCP (Model Context Protocol) server that automatically captures errors during development sessions, queries a community knowledge base for solutions, and shares resolved errors with other developers.

## Development Commands

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode (development)
npm run dev

# Type check
npm run typecheck

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Architecture

This is a TypeScript MCP server with the following structure:

```
src/
├── server/
│   ├── index.ts          # MCP server definition
│   └── tools.ts          # Custom tools (7 tools)
├── core/
│   ├── error-detector.ts # Multi-signal error detection
│   ├── privacy-filter.ts # Sensitive data redaction
│   └── hash.ts           # Fingerprinting & deduplication
├── storage/
│   ├── local-store.ts    # SQLite local storage
│   └── migrations.ts     # Database migrations
├── cloud/
│   ├── client.ts         # Supabase client
│   └── embedding.ts      # OpenAI embeddings
└── types/
    └── index.ts          # TypeScript definitions
```

### Key Components

- **MCP Server** (`server/`): Implements Model Context Protocol with 7 tools for error search, resolution, listing, voting, stats, helpful reports, and content reporting
- **Error Detection** (`core/error-detector.ts`): Multi-signal detection from tool outputs (bash, edit, etc.)
- **Privacy Filter** (`core/privacy-filter.ts`): Redacts sensitive data (API keys, tokens, emails, paths, connection strings, IPs) before sharing
- **Local Storage** (`storage/`): SQLite-based caching for offline access
- **Cloud Integration** (`cloud/`): Supabase + pgvector for semantic similarity search

### Data Flow

1. Error occurs in tool output
2. Auto-detection via MCP tool hook
3. Privacy filter redacts sensitive data
4. Local storage in SQLite
5. Cloud search via Supabase + pgvector
6. Display ranked solutions (similarity & votes)
7. Resolution uploads to community

## External Dependencies

- **Supabase**: Cloud database with pgvector for semantic search
- **OpenAI API**: Optional, enables semantic similarity search via embeddings
- **better-sqlite3**: Local SQLite storage
