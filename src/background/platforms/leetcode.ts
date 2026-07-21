import { AlgoVaultError } from '@shared/errors/taxonomy';
import type { ExtractedSubmission } from '@shared/types/submission';
import type { IPlatformAdapter } from './core';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';
const LEETCODE_API_URL = 'https://leetcode.com/api/submissions/';

// In-memory cache for question metadata to avoid redundant GraphQL queries during bulk sync
const questionMetadataCache: Record<string, {
  questionId: string;
  difficulty: string;
  description: string;
  tags: string[];
}> = {};

async function fetchQuestionMetadata(titleSlug: string, csrfToken: string): Promise<any> {
  if (questionMetadataCache[titleSlug]) {
    return questionMetadataCache[titleSlug];
  }

  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionFrontendId
        difficulty
        content
        topicTags {
          name
        }
      }
    }
  `;

  const response = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
      'Referer': 'https://leetcode.com',
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug },
    }),
  });

  const result = await response.json();
  const q = result.data?.question;
  if (!q) {
    throw AlgoVaultError.leetCodeApiError(`Failed to fetch metadata for ${titleSlug}`);
  }

  const metadata = {
    questionId: q.questionFrontendId,
    difficulty: q.difficulty,
    description: q.content || '',
    tags: q.topicTags.map((t: any) => t.name),
  };

  questionMetadataCache[titleSlug] = metadata;
  return metadata;
}

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

    const csrfToken = csrfCookie?.value || '';
    let offset = 0;
    const limit = 20;
    let hasNext = true;
    const seenSubmissions = new Set<string>();

    while (hasNext) {
      const response = await fetch(`${LEETCODE_API_URL}?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
          'Referer': 'https://leetcode.com',
        },
      });

      if (!response.ok) {
        throw AlgoVaultError.leetCodeApiError('Failed to fetch from LeetCode REST API.');
      }

      const result = await response.json();
      const list = result.submissions_dump || [];
      hasNext = result.has_next;

      if (list.length === 0) {
        break;
      }

      const batch: ExtractedSubmission[] = [];
      for (const item of list) {
        if (item.status_display !== 'Accepted') {
          continue;
        }

        // Deduplicate by problem and language. Since the API returns newest first, 
        // we only process the most recent accepted submission for a given problem in a given language.
        const dedupKey = `${item.title_slug}-${item.lang}`;
        if (seenSubmissions.has(dedupKey)) {
          continue;
        }
        seenSubmissions.add(dedupKey);

        try {
          const metadata = await fetchQuestionMetadata(item.title_slug, csrfToken);
          
          batch.push({
            questionId: metadata.questionId,
            title: item.title,
            titleSlug: item.title_slug,
            difficulty: metadata.difficulty,
            description: metadata.description,
            examples: '',
            constraints: '',
            tags: metadata.tags,
            language: item.lang,
            solutionCode: item.code,
            // The REST API 'time' field is actually "time ago" (e.g. "2 months, 1 week").
            // If runtime isn't explicitly provided in the payload, we use 'N/A'
            runtime: item.runtime || 'N/A',
            memory: item.memory || 'N/A',
            url: `https://leetcode.com/problems/${item.title_slug}/`,
            timestamp: new Date(item.timestamp * 1000).toISOString()
          });
        } catch (e) {
          console.warn(`Failed to process bulk submission for ${item.title_slug}`, e);
        }
      }
      
      if (batch.length > 0) {
        yield batch;
      }
      
      offset += limit;
    }
  }
};
