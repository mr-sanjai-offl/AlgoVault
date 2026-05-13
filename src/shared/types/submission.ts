export interface ExtractedSubmission {
  questionId: string;
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: string;
  constraints: string;
  tags: string[];
  language: string;
  solutionCode: string;
  runtime: string;
  memory: string;
  url: string;
  timestamp: string;
}

export interface StoredSubmission {
  id: string;
  questionId: string;
  problemSlug: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  tags: string[];
  runtime: string;
  memory: string;
  syncedAt: number;
  githubPath: string;
  status: 'synced' | 'failed' | 'pending';
}

export interface SerializedSubmission extends ExtractedSubmission {
  dedupKey: string;
}
