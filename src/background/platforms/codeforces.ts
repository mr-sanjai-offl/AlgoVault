import type { IPlatformAdapter } from './core';
import type { ExtractedSubmission } from '@shared/types/submission';
import { getUserConfig } from '../storage/configStore';

const CF_API = 'https://codeforces.com/api';

export const CodeforcesAdapter: IPlatformAdapter = {
  id: 'codeforces',
  name: 'Codeforces',

  async isConnected(): Promise<boolean> {
    const config = await getUserConfig();
    return !!config.codeforcesHandle;
  },

  async getUsername(): Promise<string> {
    const config = await getUserConfig();
    if (!config.codeforcesHandle) {
      throw new Error('Codeforces handle not configured');
    }
    return config.codeforcesHandle;
  },

  async fetchSubmissionDetails(submissionId: string): Promise<ExtractedSubmission> {
    // Codeforces public API doesn't have a single submission endpoint, 
    // nor does it expose source code. 
    // This is a stub that will be filled if we scrape instead of using API.
    throw new Error('Direct submission fetching via API is not supported on Codeforces without scraping.');
  },

  async *fetchAllPastSubmissions(): AsyncGenerator<ExtractedSubmission[], void, unknown> {
    const handle = await this.getUsername();
    
    // Fetch all submissions for the user
    const response = await fetch(`${CF_API}/user.status?handle=${handle}`);
    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Codeforces API error: ${data.comment}`);
    }

    const submissions = data.result;
    
    // Filter for accepted submissions
    const accepted = submissions.filter((s: any) => s.verdict === 'OK');
    
    // We'll yield in batches of 50
    const batchSize = 50;
    for (let i = 0; i < accepted.length; i += batchSize) {
      const batch = accepted.slice(i, i + batchSize);
      
      const extractedBatch: ExtractedSubmission[] = batch.map((sub: any) => ({
        questionId: sub.problem.contestId ? `${sub.problem.contestId}${sub.problem.index}` : sub.problem.name,
        title: sub.problem.name,
        titleSlug: sub.problem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        difficulty: sub.problem.rating ? sub.problem.rating.toString() : 'Unknown',
        description: 'Codeforces problem description not available via API.',
        examples: '',
        constraints: '',
        tags: sub.problem.tags || ['General'],
        language: sub.programmingLanguage,
        solutionCode: '// Source code not accessible via Codeforces public API.',
        runtime: `${sub.timeConsumedMillis} ms`,
        memory: `${(sub.memoryConsumedBytes / (1024 * 1024)).toFixed(2)} MB`,
        url: sub.problem.contestId 
          ? `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`
          : `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
        timestamp: new Date(sub.creationTimeSeconds * 1000).toISOString(),
      }));

      yield extractedBatch;
    }
  }
};
