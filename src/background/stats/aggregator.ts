import type { StatsPayload } from '@shared/types/messages';

import { getAllSubmissions } from '../storage/indexedDb';
import { getStatsCache, setStatsCache } from '../storage/configStore';
import { LeetCodeAdapter } from '../platforms/leetcode';
import { getCachedManifest, manifestToStats } from '../manifest/manifestStore';

export function computeStreak(dates: string[]): { current: number; longest: number } {
  if (dates.length === 0) return { current: 0, longest: 0 };

  const uniqueDays = [...new Set(dates.map((d) => d.split('T')[0]))].sort().reverse();

  let current = 1;
  let longest = 1;
  let tempStreak = 1;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDays[0] !== today && uniqueDays[0] !== yesterday) {
    current = 0;
  }

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = new Date(uniqueDays[i - 1]).getTime();
    const curr = new Date(uniqueDays[i]).getTime();
    const diffDays = (prev - curr) / 86400000;

    if (Math.abs(diffDays - 1) < 0.01) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
      if (i <= current || current === 1) {
        current = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }

  longest = Math.max(longest, tempStreak);

  return { current, longest };
}

export async function computeStats(): Promise<StatsPayload> {
  const cached = await getStatsCache<StatsPayload>();
  if (cached) return cached;

  // Try cached manifest first (populated after successful syncs)
  // This ensures stats are accurate on new devices after first sync
  const cachedManifest = await getCachedManifest();
  if (cachedManifest && Object.keys(cachedManifest.platforms || {}).length > 0) {
    const stats = manifestToStats(cachedManifest);
    if (!stats.username) {
      try {
        stats.username = await LeetCodeAdapter.getUsername();
      } catch { /* non-critical */ }
    }
    await setStatsCache(stats);
    return stats;
  }

  // Fallback: compute from local IndexedDB (original behavior)
  let username: string | undefined;
  try {
    username = await LeetCodeAdapter.getUsername();
  } catch (err) {
    console.warn('[AlgoVault] Could not fetch username for stats', err);
  }

  const submissions = await getAllSubmissions();
  const synced = submissions.filter((s) => s.status === 'synced');

  // De-duplicate by titleSlug to avoid multiple entries for the same problem in the dashboard
  const uniqueProblems = Array.from(
    synced.reduce((acc, sub) => {
      const existing = acc.get(sub.problemSlug);
      if (!existing || sub.syncedAt > existing.syncedAt) {
        acc.set(sub.problemSlug, sub);
      }
      return acc;
    }, new Map<string, import('@shared/types/submission').StoredSubmission>())
    .values()
  );

  const total = uniqueProblems.length;
  const easy = uniqueProblems.filter((s) => s.difficulty === 'Easy').length;
  const medium = uniqueProblems.filter((s) => s.difficulty === 'Medium').length;
  const hard = uniqueProblems.filter((s) => s.difficulty === 'Hard').length;

  const byLanguage: Record<string, number> = {};
  const byTopic: Record<string, number> = {};
  const groupedSubmissions: Record<string, import('@shared/types/submission').StoredSubmission[]> = {};

  // Count languages from ALL synced submissions (not just unique problems)
  for (const sub of synced) {
    byLanguage[sub.language] = (byLanguage[sub.language] ?? 0) + 1;
  }

  // Group UNIQUE problems by topic for the dashboard
  for (const sub of uniqueProblems) {
    const topic = sub.tags[0] || 'General';
    byTopic[topic] = (byTopic[topic] ?? 0) + 1;
    
    if (!groupedSubmissions[topic]) groupedSubmissions[topic] = [];
    groupedSubmissions[topic].push(sub);
  }

  const dates = synced.map((s) => new Date(s.syncedAt).toISOString());
  const { current: currentStreak, longest: longestStreak } = computeStreak(dates);

  const sorted = uniqueProblems.sort((a, b) => b.syncedAt - a.syncedAt);
  const lastSolved = sorted.length > 0
    ? {
        title: sorted[0].title,
        date: new Date(sorted[0].syncedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        difficulty: sorted[0].difficulty,
      }
    : undefined;

  const stats: StatsPayload = {
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

  await setStatsCache(stats);
  return stats;
}
