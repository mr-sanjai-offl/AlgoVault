import type { Manifest, ManifestProblem, PlatformManifest } from '@shared/types/manifest';
import { createEmptyManifest } from '@shared/types/manifest';
import type { SerializedSubmission } from '@shared/types/submission';
import type { StoredSubmission } from '@shared/types/submission';
import type { StatsPayload } from '@shared/types/messages';
import { MANIFEST_PATH, STORAGE_KEYS } from '@shared/constants';
import { getFileContent } from '../github/client';
import { computeStreak } from '../stats/aggregator';

// --- FETCH ---

export async function fetchManifest(
  owner: string,
  repo: string,
  branch: string,
): Promise<Manifest> {
  try {
    const raw = await getFileContent(owner, repo, branch, MANIFEST_PATH);
    if (!raw) return createEmptyManifest();

    const parsed = JSON.parse(raw) as Manifest;

    // Basic validation for v3.0.0
    if (parsed.version !== '3.0.0' || !parsed.platforms) {
      console.warn('[AlgoVault] Invalid manifest format or old version, starting fresh v3.0.0');
      return createEmptyManifest();
    }

    return parsed;
  } catch (error) {
    console.warn('[AlgoVault] Could not fetch manifest, starting fresh', error);
    return createEmptyManifest();
  }
}

// --- MERGE ---

export function mergeSubmission(
  manifest: Manifest,
  sub: SerializedSubmission,
  githubPath: string,
  langKey: string,
  platformId: string,
): Manifest {
  // Ensure platform namespace exists
  const platforms = { ...manifest.platforms };
  if (!platforms[platformId as keyof typeof platforms]) {
    (platforms as any)[platformId] = { submissions: {} };
  }
  
  const platformManifest = platforms[platformId as keyof typeof platforms] as PlatformManifest;
  const existing = platformManifest.submissions[sub.titleSlug];

  const problem: ManifestProblem = existing
    ? {
        ...existing,
        // Update tags if the incoming submission has better tags
        tags:
          sub.tags.length > 0 &&
          (existing.tags.length === 0 || existing.tags[0] === 'General')
            ? sub.tags
            : existing.tags,
        solutions: { ...existing.solutions },
      }
    : {
        questionId: sub.questionId,
        title: sub.title,
        titleSlug: sub.titleSlug,
        difficulty: sub.difficulty,
        tags: sub.tags.length > 0 ? sub.tags : ['General'],
        solutions: {},
      };

  problem.solutions[langKey] = {
    syncedAt: Date.now(),
    runtime: sub.runtime,
    memory: sub.memory,
    githubPath,
  };

  const updatedPlatformManifest: PlatformManifest = {
    ...platformManifest,
    submissions: {
      ...platformManifest.submissions,
      [sub.titleSlug]: problem,
    }
  };

  return {
    ...manifest,
    lastUpdated: new Date().toISOString(),
    platforms: {
      ...platforms,
      [platformId]: updatedPlatformManifest,
    }
  };
}

// --- STATS CONVERSION ---

export function manifestToStats(manifest: Manifest, platformId?: string): StatsPayload {
  let total = 0;
  let easy = 0;
  let medium = 0;
  let hard = 0;

  const byLanguage: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const groupedSubmissions: Record<string, StoredSubmission[]> = {};
  const allDates: string[] = [];
  const allSolutions: any[] = [];
  
  // Aggregate across platforms
  const platformsToProcess = platformId 
    ? [platformId].filter(id => manifest.platforms[id as keyof typeof manifest.platforms]) 
    : Object.keys(manifest.platforms);

  for (const pId of platformsToProcess) {
    const platformManifest = (manifest.platforms as any)[pId] as PlatformManifest;
    const problems = Object.values(platformManifest.submissions);
    total += problems.length;
    
    for (const problem of problems) {
      if (problem.difficulty === 'Easy') easy++;
      else if (problem.difficulty === 'Medium') medium++;
      else if (problem.difficulty === 'Hard') hard++;
      // Codeforces ratings aren't added to easy/med/hard for now
      
      const topic = problem.tags[0] || 'General';
      byTopic[topic] = (byTopic[topic] ?? 0) + 1;

      // Find the latest solution for this problem (used as the representative row)
      const solutions = Object.entries(problem.solutions);
      let latestSyncedAt = 0;
      let latestLang = '';

      for (const [lang, sol] of solutions) {
        byLanguage[lang] = (byLanguage[lang] ?? 0) + 1;
        allDates.push(new Date(sol.syncedAt).toISOString());
        
        allSolutions.push({
          title: problem.title,
          difficulty: problem.difficulty,
          syncedAt: sol.syncedAt,
        });

        if (sol.syncedAt > latestSyncedAt) {
          latestSyncedAt = sol.syncedAt;
          latestLang = lang;
        }
      }

      // Build a StoredSubmission-compatible object for dashboardBuilder
      const latestSol = problem.solutions[latestLang];
      const representative: StoredSubmission = {
        id: problem.titleSlug,
        questionId: problem.questionId,
        problemSlug: problem.titleSlug,
        title: problem.title,
        difficulty: problem.difficulty as any,
        language: latestLang,
        tags: problem.tags,
        runtime: latestSol?.runtime ?? '',
        memory: latestSol?.memory ?? '',
        syncedAt: latestSyncedAt,
        githubPath: latestSol?.githubPath ?? `${topic}/${problem.title}/`,
        status: 'synced',
      };

      if (!groupedSubmissions[topic]) groupedSubmissions[topic] = [];
      groupedSubmissions[topic].push(representative);
    }
  }

  const { current: currentStreak, longest: longestStreak } = computeStreak(allDates);

  allSolutions.sort((a, b) => b.syncedAt - a.syncedAt);

  const lastSolved =
    allSolutions.length > 0
      ? {
          title: allSolutions[0].title,
          date: new Date(allSolutions[0].syncedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          difficulty: allSolutions[0].difficulty,
        }
      : undefined;

  // We take the username from LeetCode if it exists, or just fallback
  const username = manifest.platforms.leetcode?.username || 
                   manifest.platforms.codeforces?.username || 
                   manifest.platforms.hackerrank?.username || 'user';

  return {
    username,
    total,
    easy,
    medium,
    hard,
    currentStreak,
    longestStreak,
    lastSolved,
    byLanguage,
    byTopic,
    groupedSubmissions,
  };
}

// --- SERIALIZATION ---

export function serializeManifest(manifest: Manifest): string {
  return JSON.stringify(manifest, null, 2);
}

// --- LOCAL CACHE ---

export async function cacheManifest(manifest: Manifest): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.MANIFEST_CACHE]: manifest });
}

export async function getCachedManifest(): Promise<Manifest | null> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.MANIFEST_CACHE);
  return (stored[STORAGE_KEYS.MANIFEST_CACHE] as Manifest) ?? null;
}
