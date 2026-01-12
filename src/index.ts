#!/usr/bin/env node
/**
 * FixHive for Claude Code - Entry Point
 *
 * Community-based Error Knowledge Sharing for Claude Code
 */

import { startServer } from './server/index.js';

// 서버 시작
startServer().catch((error) => {
  console.error('Failed to start FixHive server:', error);
  process.exit(1);
});
