import { describe, it, expect } from 'vitest';
import { mergeSubmission, manifestToStats, serializeManifest } from '@background/manifest/manifestStore';
import { createEmptyManifest } from '@shared/types/manifest';
import type { Manifest } from '@shared/types/manifest';
import type { SerializedSubmission } from '@shared/types/submission';

function makeSub(overrides: Partial<SerializedSubmission> = {}): SerializedSubmission {
  return {
    questionId: '1',
    title: 'Two Sum',
    titleSlug: 'two-sum',
    difficulty: 'Easy',
    description: 'Given an array...',
    examples: 'Input: [2,7,11,15]',
    constraints: '2 <= nums.length',
    tags: ['Array', 'Hash Table'],
    language: 'python3',
    solutionCode: 'class Solution: ...',
    runtime: '40 ms',
    memory: '16.4 MB',
    url: 'https://leetcode.com/problems/two-sum/',
    timestamp: '2026-07-13T12:00:00Z',
    dedupKey: 'abc123',
    ...overrides,
  };
}

describe('mergeSubmission', () => {
  it('should create a new problem entry in an empty manifest', () => {
    const manifest = createEmptyManifest();
    const sub = makeSub();
    const result = mergeSubmission(manifest, sub, 'Array/Two Sum/', 'python3');

    expect(Object.keys(result.submissions)).toHaveLength(1);
    expect(result.submissions['two-sum']).toBeDefined();

    const problem = result.submissions['two-sum'];
    expect(problem.questionId).toBe('1');
    expect(problem.title).toBe('Two Sum');
    expect(problem.difficulty).toBe('Easy');
    expect(problem.tags).toEqual(['Array', 'Hash Table']);
    expect(problem.solutions['python3']).toBeDefined();
    expect(problem.solutions['python3'].runtime).toBe('40 ms');
    expect(problem.solutions['python3'].memory).toBe('16.4 MB');
    expect(problem.solutions['python3'].githubPath).toBe('Array/Two Sum/');
  });

  it('should add a new language to an existing problem', () => {
    const manifest = createEmptyManifest();
    const sub1 = makeSub({ language: 'python3' });
    const after1 = mergeSubmission(manifest, sub1, 'Array/Two Sum/', 'python3');

    const sub2 = makeSub({ language: 'java', runtime: '2 ms', memory: '42.1 MB' });
    const after2 = mergeSubmission(after1, sub2, 'Array/Two Sum/', 'java');

    const problem = after2.submissions['two-sum'];
    expect(Object.keys(problem.solutions)).toHaveLength(2);
    expect(problem.solutions['python3']).toBeDefined();
    expect(problem.solutions['java']).toBeDefined();
    expect(problem.solutions['java'].runtime).toBe('2 ms');
  });

  it('should update an existing language solution', () => {
    const manifest = createEmptyManifest();
    const sub1 = makeSub({ runtime: '40 ms' });
    const after1 = mergeSubmission(manifest, sub1, 'Array/Two Sum/', 'python3');

    const sub2 = makeSub({ runtime: '20 ms', memory: '15.0 MB' });
    const after2 = mergeSubmission(after1, sub2, 'Array/Two Sum/', 'python3');

    const problem = after2.submissions['two-sum'];
    expect(Object.keys(problem.solutions)).toHaveLength(1);
    expect(problem.solutions['python3'].runtime).toBe('20 ms');
    expect(problem.solutions['python3'].memory).toBe('15.0 MB');
  });

  it('should preserve other problems when merging', () => {
    const manifest = createEmptyManifest();
    const sub1 = makeSub({ titleSlug: 'two-sum', title: 'Two Sum' });
    const after1 = mergeSubmission(manifest, sub1, 'Array/Two Sum/', 'python3');

    const sub2 = makeSub({
      titleSlug: 'add-two-numbers',
      title: 'Add Two Numbers',
      questionId: '2',
      difficulty: 'Medium',
      tags: ['Linked List'],
    });
    const after2 = mergeSubmission(after1, sub2, 'Linked List/Add Two Numbers/', 'java');

    expect(Object.keys(after2.submissions)).toHaveLength(2);
    expect(after2.submissions['two-sum']).toBeDefined();
    expect(after2.submissions['add-two-numbers']).toBeDefined();
  });

  it('should update tags if existing has only General', () => {
    const manifest = createEmptyManifest();
    const sub1 = makeSub({ tags: ['General'] });
    const after1 = mergeSubmission(manifest, sub1, 'General/Two Sum/', 'python3');

    const sub2 = makeSub({ tags: ['Array', 'Hash Table'] });
    const after2 = mergeSubmission(after1, sub2, 'Array/Two Sum/', 'java');

    expect(after2.submissions['two-sum'].tags).toEqual(['Array', 'Hash Table']);
  });

  it('should not overwrite good tags with empty tags', () => {
    const manifest = createEmptyManifest();
    const sub1 = makeSub({ tags: ['Array', 'Hash Table'] });
    const after1 = mergeSubmission(manifest, sub1, 'Array/Two Sum/', 'python3');

    const sub2 = makeSub({ tags: [] });
    const after2 = mergeSubmission(after1, sub2, 'Array/Two Sum/', 'java');

    expect(after2.submissions['two-sum'].tags).toEqual(['Array', 'Hash Table']);
  });

  it('should update lastUpdated timestamp', () => {
    const manifest = createEmptyManifest();
    const originalTimestamp = manifest.lastUpdated;

    // Small delay to ensure different timestamps
    const sub = makeSub();
    const result = mergeSubmission(manifest, sub, 'Array/Two Sum/', 'python3');

    expect(result.lastUpdated).toBeDefined();
    expect(typeof result.lastUpdated).toBe('string');
  });
});

describe('manifestToStats', () => {
  function buildManifest(): Manifest {
    const manifest = createEmptyManifest();
    const now = Date.now();

    manifest.username = 'testuser';
    manifest.submissions = {
      'two-sum': {
        questionId: '1',
        title: 'Two Sum',
        titleSlug: 'two-sum',
        difficulty: 'Easy',
        tags: ['Array', 'Hash Table'],
        solutions: {
          python3: { syncedAt: now - 86400000, runtime: '40 ms', memory: '16.4 MB', githubPath: 'Array/Two Sum/python/' },
          java: { syncedAt: now, runtime: '2 ms', memory: '42.1 MB', githubPath: 'Array/Two Sum/java/' },
        },
      },
      'add-two-numbers': {
        questionId: '2',
        title: 'Add Two Numbers',
        titleSlug: 'add-two-numbers',
        difficulty: 'Medium',
        tags: ['Linked List'],
        solutions: {
          python3: { syncedAt: now - 172800000, runtime: '60 ms', memory: '14.0 MB', githubPath: 'Linked List/Add Two Numbers/python/' },
        },
      },
      'median-of-two-sorted-arrays': {
        questionId: '4',
        title: 'Median of Two Sorted Arrays',
        titleSlug: 'median-of-two-sorted-arrays',
        difficulty: 'Hard',
        tags: ['Array', 'Binary Search'],
        solutions: {
          cpp: { syncedAt: now - 3600000, runtime: '8 ms', memory: '89.1 MB', githubPath: 'Array/Median of Two Sorted Arrays/cpp/' },
        },
      },
    };
    return manifest;
  }

  it('should compute correct difficulty totals', () => {
    const stats = manifestToStats(buildManifest());

    expect(stats.total).toBe(3);
    expect(stats.easy).toBe(1);
    expect(stats.medium).toBe(1);
    expect(stats.hard).toBe(1);
  });

  it('should compute byLanguage counts from all solutions', () => {
    const stats = manifestToStats(buildManifest());

    expect(stats.byLanguage['python3']).toBe(2); // two-sum + add-two-numbers
    expect(stats.byLanguage['java']).toBe(1);
    expect(stats.byLanguage['cpp']).toBe(1);
  });

  it('should compute byTopic counts', () => {
    const stats = manifestToStats(buildManifest());

    expect(stats.byTopic['Array']).toBe(2); // two-sum + median
    expect(stats.byTopic['Linked List']).toBe(1);
  });

  it('should group submissions by topic for dashboard', () => {
    const stats = manifestToStats(buildManifest());

    expect(stats.groupedSubmissions['Array']).toHaveLength(2);
    expect(stats.groupedSubmissions['Linked List']).toHaveLength(1);

    // Verify representative has correct fields
    const arrayProblems = stats.groupedSubmissions['Array'];
    const twoSum = arrayProblems.find(p => p.problemSlug === 'two-sum');
    expect(twoSum).toBeDefined();
    expect(twoSum!.questionId).toBe('1');
    expect(twoSum!.title).toBe('Two Sum');
    expect(twoSum!.difficulty).toBe('Easy');
    expect(twoSum!.status).toBe('synced');
  });

  it('should use latest solution as representative', () => {
    const stats = manifestToStats(buildManifest());

    const twoSum = stats.groupedSubmissions['Array'].find(p => p.problemSlug === 'two-sum');
    // Java was synced more recently than python3
    expect(twoSum!.language).toBe('java');
    expect(twoSum!.runtime).toBe('2 ms');
  });

  it('should compute lastSolved correctly', () => {
    const stats = manifestToStats(buildManifest());

    expect(stats.lastSolved).toBeDefined();
    expect(stats.lastSolved!.title).toBe('Two Sum'); // Java solution is most recent
  });

  it('should preserve username from manifest', () => {
    const stats = manifestToStats(buildManifest());
    expect(stats.username).toBe('testuser');
  });

  it('should handle empty manifest', () => {
    const stats = manifestToStats(createEmptyManifest());

    expect(stats.total).toBe(0);
    expect(stats.easy).toBe(0);
    expect(stats.medium).toBe(0);
    expect(stats.hard).toBe(0);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.lastSolved).toBeUndefined();
    expect(Object.keys(stats.byLanguage)).toHaveLength(0);
    expect(Object.keys(stats.groupedSubmissions)).toHaveLength(0);
  });
});

describe('serializeManifest', () => {
  it('should produce valid JSON that round-trips', () => {
    const manifest = createEmptyManifest();
    const sub = makeSub();
    const updated = mergeSubmission(manifest, sub, 'Array/Two Sum/', 'python3');
    const serialized = serializeManifest(updated);

    const parsed = JSON.parse(serialized) as Manifest;
    expect(parsed.version).toBe(1);
    expect(parsed.submissions['two-sum']).toBeDefined();
    expect(parsed.submissions['two-sum'].solutions['python3'].runtime).toBe('40 ms');
  });

  it('should produce pretty-printed JSON', () => {
    const manifest = createEmptyManifest();
    const serialized = serializeManifest(manifest);

    // Pretty-printed JSON has newlines
    expect(serialized).toContain('\n');
    expect(serialized).toContain('  ');
  });
});
