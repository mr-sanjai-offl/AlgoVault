import type { Manifest, ManifestProblem } from '@shared/types/manifest';
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

    // Basic validation
    if (!parsed.version || !parsed.submissions) {
      console.warn('[AlgoVault] Invalid manifest format, starting fresh');
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
): Manifest {
  const existing = manifest.submissions[sub.titleSlug];

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
        difficulty: sub.difficulty as 'Easy' | 'Medium' | 'Hard',
        tags: sub.tags.length > 0 ? sub.tags : ['General'],
        solutions: {},
      };

  problem.solutions[langKey] = {
    syncedAt: Date.now(),
    runtime: sub.runtime,
    memory: sub.memory,
    githubPath,
  };

  return {
    ...manifest,
    lastUpdated: new Date().toISOString(),
    submissions: {
      ...manifest.submissions,
      [sub.titleSlug]: problem,
    },
  };
}

// --- STATS CONVERSION ---

export function manifestToStats(manifest: Manifest): StatsPayload {
  const problems = Object.values(manifest.submissions);

  const total = problems.length;
  const easy = problems.filter((p) => p.difficulty === 'Easy').length;
  const medium = problems.filter((p) => p.difficulty === 'Medium').length;
  const hard = problems.filter((p) => p.difficulty === 'Hard').length;

  const byLanguage: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const groupedSubmissions: Record<string, StoredSubmission[]> = {};
  const allDates: string[] = [];

  for (const problem of problems) {
    const topic = problem.tags[0] || 'General';
    byTopic[topic] = (byTopic[topic] ?? 0) + 1;

    // Find the latest solution for this problem (used as the representative row)
    const solutions = Object.entries(problem.solutions);
    let latestSyncedAt = 0;
    let latestLang = '';

    for (const [lang, sol] of solutions) {
      byLanguage[lang] = (byLanguage[lang] ?? 0) + 1;
      allDates.push(new Date(sol.syncedAt).toISOString());
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
      difficulty: problem.difficulty,
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

  const { current: currentStreak, longest: longestStreak } =
    computeStreak(allDates);

  // Find last solved across all problems and solutions
  const allSolutions = problems.flatMap((p) =>
    Object.values(p.solutions).map((s) => ({
      title: p.title,
      difficulty: p.difficulty,
      syncedAt: s.syncedAt,
    })),
  );
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

  return {
    username: manifest.username,
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
