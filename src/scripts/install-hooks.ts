#!/usr/bin/env node
/**
 * Hook 자동 설치 스크립트
 *
 * npm postinstall에서 실행되어 ~/.claude/settings.json에
 * FixHive PostToolUse 훅을 자동으로 등록합니다.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

interface ClaudeSettings {
  hooks?: {
    PostToolUse?: Array<{
      matcher?: string;
      command: string;
    }>;
  };
  [key: string]: unknown;
}

const HOOK_COMMAND = 'fixhive-hook-handler';
const MATCHERS = ['Bash', 'Edit', 'Write'];

function main(): void {
  const claudeDir = join(homedir(), '.claude');
  const settingsPath = join(claudeDir, 'settings.json');

  // .claude 디렉토리가 없으면 건너뜀 (Claude Code 미설치)
  if (!existsSync(claudeDir)) {
    console.log('[FixHive] Claude Code not detected, skipping hook installation.');
    return;
  }

  // 설정 파일 로드 또는 초기화
  let settings: ClaudeSettings = {};

  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf-8')) as ClaudeSettings;
    } catch {
      console.warn('[FixHive] Could not parse settings.json, creating new one.');
    }
  }

  // hooks 객체 초기화
  settings.hooks = settings.hooks || {};
  settings.hooks.PostToolUse = settings.hooks.PostToolUse || [];

  // 이미 설치되어 있는지 확인
  const alreadyInstalled = settings.hooks.PostToolUse.some(
    (hook) => hook.command.includes('fixhive')
  );

  if (alreadyInstalled) {
    console.log('[FixHive] Hooks already installed.');
    return;
  }

  // 각 매처에 대해 훅 추가
  for (const matcher of MATCHERS) {
    settings.hooks.PostToolUse.push({
      matcher,
      command: HOOK_COMMAND,
    });
  }

  // 설정 파일 저장
  try {
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('[FixHive] Hooks installed successfully!');
    console.log(`[FixHive] Added PostToolUse hooks for: ${MATCHERS.join(', ')}`);
  } catch (error) {
    console.error('[FixHive] Failed to install hooks:', error);
    console.log('[FixHive] You can manually add the hooks by editing ~/.claude/settings.json');
  }
}

main();
