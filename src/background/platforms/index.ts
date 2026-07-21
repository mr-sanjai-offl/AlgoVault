import { LeetCodeAdapter } from './leetcode';
import { CodeforcesAdapter } from './codeforces';
import { HackerRankAdapter } from './hackerrank';
import type { IPlatformAdapter } from './core';

export const PLATFORMS: Record<string, IPlatformAdapter> = {
  [LeetCodeAdapter.id]: LeetCodeAdapter,
  [CodeforcesAdapter.id]: CodeforcesAdapter,
  [HackerRankAdapter.id]: HackerRankAdapter,
};

export function getPlatform(id: string): IPlatformAdapter {
  const adapter = PLATFORMS[id];
  if (!adapter) {
    throw new Error(`Platform adapter not found for id: ${id}`);
  }
  return adapter;
}
