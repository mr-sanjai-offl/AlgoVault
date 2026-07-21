import type { IPlatformAdapter } from './core';
import type { ExtractedSubmission } from '@shared/types/submission';
import { getUserConfig } from '../storage/configStore';

export const HackerRankAdapter: IPlatformAdapter = {
  id: 'hackerrank',
  name: 'HackerRank',

  async isConnected(): Promise<boolean> {
    const cookies = await chrome.cookies.getAll({ domain: 'hackerrank.com' });
    const sessionCookie = cookies.find(c => c.name === '_hrank_session');
    return !!sessionCookie;
  },

  async getUsername(): Promise<string> {
    const config = await getUserConfig();
    // We could fetch this via API, but for now we'll rely on the user config
    if (!config.hackerrankHandle) {
      throw new Error('HackerRank handle not configured');
    }
    return config.hackerrankHandle;
  },

  async fetchSubmissionDetails(submissionId: string): Promise<ExtractedSubmission> {
    throw new Error('Not implemented for HackerRank yet.');
  },

  async *fetchAllPastSubmissions(): AsyncGenerator<ExtractedSubmission[], void, unknown> {
    throw new Error('Not implemented for HackerRank yet.');
  }
};
