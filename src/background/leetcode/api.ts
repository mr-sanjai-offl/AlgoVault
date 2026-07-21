import { AlgoVaultError } from '@shared/errors/taxonomy';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

export interface LeetCodeSubmission {
  questionId: string;
  code: string;
  lang: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  tags: string[];
  runtime: string;
  memory: string;
  questionContent: string;
}

export async function fetchSubmissionDetails(submissionId: string): Promise<LeetCodeSubmission> {
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
    code: data.code,
    lang: data.lang.name,
    title: data.question.title,
    titleSlug: data.question.titleSlug,
    difficulty: data.question.difficulty,
    tags: data.question.topicTags.map((t: any) => t.name),
    runtime: data.runtimeDisplay,
    memory: data.memoryDisplay,
    questionContent: data.question.content,
  };
}

export async function fetchLeetCodeUsername(): Promise<string> {
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
}
