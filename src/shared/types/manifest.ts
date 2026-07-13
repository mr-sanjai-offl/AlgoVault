export interface ManifestSolution {
  syncedAt: number;
  runtime: string;
  memory: string;
  githubPath: string;
}

export interface ManifestProblem {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  solutions: Record<string, ManifestSolution>; // keyed by language
}

export interface Manifest {
  version: 1;
  lastUpdated: string; // ISO timestamp
  username?: string; // LeetCode username for stats card
  submissions: Record<string, ManifestProblem>; // keyed by titleSlug
}

export function createEmptyManifest(): Manifest {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    submissions: {},
  };
}
