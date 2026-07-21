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
  difficulty: 'Easy' | 'Medium' | 'Hard' | string; // string supports Codeforces ratings
  tags: string[];
  solutions: Record<string, ManifestSolution>; // keyed by language
}

export interface PlatformManifest {
  username?: string;
  submissions: Record<string, ManifestProblem>; // keyed by titleSlug or ID
}

export interface Manifest {
  version: "3.0.0";
  lastUpdated: string; // ISO timestamp
  platforms: {
    leetcode?: PlatformManifest;
    codeforces?: PlatformManifest;
    hackerrank?: PlatformManifest;
  };
}

export function createEmptyManifest(): Manifest {
  return {
    version: "3.0.0",
    lastUpdated: new Date().toISOString(),
    platforms: {},
  };
}
