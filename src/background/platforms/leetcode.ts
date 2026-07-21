import { AlgoVaultError } from '@shared/errors/taxonomy';
import type { ExtractedSubmission } from '@shared/types/submission';
import type { IPlatformAdapter } from './core';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

export const LeetCodeAdapter: IPlatformAdapter = {
  id: 'leetcode',
  name: 'LeetCode',

  async isConnected(): Promise<boolean> {
    const cookies = await chrome.cookies.getAll({ domain: 'leetcode.com' });
    const sessionCookie = cookies.find(c => c.name === 'LEETCODE_SESSION');
    return !!sessionCookie;
  },

  async getUsername(): Promise<string> {
    const cookies = await chrome.cookies.getAll({ domain: 'leetcode.com' });
    const csrfCookie = cookies.find(c => c.name === 'csrftoken');

    const query = `
      query globalData {
        userStatus {
          username
        }
      }
    `;

    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfCookie?.value || '',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    const username = result.data?.userStatus?.username;

    if (!username) {
      throw AlgoVaultError.leetCodeApiError('Failed to fetch LeetCode username. Please ensure you are logged in.');
    }

    return username;
  },

  async fetchSubmissionDetails(submissionId: string): Promise<ExtractedSubmission> {
    const cookies = await chrome.cookies.getAll({ domain: 'leetcode.com' });
    const sessionCookie = cookies.find(c => c.name === 'LEETCODE_SESSION');
    const csrfCookie = cookies.find(c => c.name === 'csrftoken');

    if (!sessionCookie) {
      throw AlgoVaultError.leetCodeNotLoggedIn();
    }

    const query = `
      query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          runtimeDisplay
          memoryDisplay
          code
          lang {
            name
          }
          question {
            questionFrontendId
            title
            titleSlug
            content
            difficulty
            topicTags {
              name
            }
          }
        }
      }
    `;

    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfCookie?.value || '',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { submissionId: parseInt(submissionId, 10) },
      }),
    });

    const result = await response.json();
    const data = result.data?.submissionDetails;

    if (!data) {
      throw AlgoVaultError.leetCodeApiError('Failed to fetch submission details from LeetCode.');
    }

    return {
      questionId: data.question.questionFrontendId,
      title: data.question.title,
      titleSlug: data.question.titleSlug,
      difficulty: data.question.difficulty,
      description: data.question.content || '',
      examples: '',
      constraints: '',
      tags: data.question.topicTags.map((t: any) => t.name),
      language: data.lang.name,
      solutionCode: data.code,
      runtime: data.runtimeDisplay,
      memory: data.memoryDisplay,
      url: `https://leetcode.com/problems/${data.question.titleSlug}/`,
      timestamp: new Date().toISOString()
    };
  },

  async *fetchAllPastSubmissions(): AsyncGenerator<ExtractedSubmission[], void, unknown> {
    const cookies = await chrome.cookies.getAll({ domain: 'leetcode.com' });
    const sessionCookie = cookies.find(c => c.name === 'LEETCODE_SESSION');
    const csrfCookie = cookies.find(c => c.name === 'csrftoken');

    if (!sessionCookie) {
      throw AlgoVaultError.leetCodeNotLoggedIn();
    }

    let offset = 0;
    const limit = 20;
    let hasNext = true;

    while (hasNext) {
      const query = `
        query recentAcSubmissions($offset: Int!, $limit: Int!) {
          recentAcSubmissionList(offset: $offset, limit: $limit) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `;
      // Note: LeetCode's recentAcSubmissionList doesn't return full details,
      // so this is a placeholder. For actual bulk fetch, we'd need to fetch 
      // the list, then fetch details for each, or rely on a different API.
      // I will implement a simplified version for now that throws not implemented 
      // or just fetches the list and yields it.
      
      const response = await fetch(LEETCODE_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfCookie?.value || '',
          'Referer': 'https://leetcode.com',
        },
        body: JSON.stringify({
          query,
          variables: { offset, limit },
        }),
      });

      const result = await response.json();
      const list = result.data?.recentAcSubmissionList || [];
      
      if (list.length === 0) {
        hasNext = false;
        break;
      }

      // We have to fetch details for each to get the code... this is slow.
      // We yield them in batches.
      const batch: ExtractedSubmission[] = [];
      for (const item of list) {
        try {
          const details = await this.fetchSubmissionDetails(item.id);
          batch.push(details);
        } catch (e) {
          // ignore failed fetches
        }
      }
      
      yield batch;
      offset += limit;
    }
  }
};
