import { API, STORAGE_KEYS } from '@shared/constants';
import { AlgoVaultError } from '@shared/errors/taxonomy';
import { ErrorCode } from '@shared/types/errors';
import { getEncrypted } from '../storage/encryptedStorage';

// --- REST CLIENT LOGIC ---

interface GitHubRepoResponse {
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
}

async function getToken(): Promise<string> {
  const token = await getEncrypted(STORAGE_KEYS.GITHUB_TOKEN);
  if (!token) throw AlgoVaultError.authExpired();
  return token;
}

async function githubFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  const url = path.startsWith('http') ? path : `${API.GITHUB_API}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 401) throw AlgoVaultError.authExpired();
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    if (rateLimitRemaining === '0') {
      const resetAt = Number(response.headers.get('X-RateLimit-Reset') ?? 0);
      const retryAfter = Math.max(resetAt - Math.floor(Date.now() / 1000), 60);
      throw AlgoVaultError.githubRateLimited(retryAfter);
    }
    throw AlgoVaultError.githubPermissionDenied();
  }
  
  if (response.status === 404) throw AlgoVaultError.githubRepoNotFound(path);

  return response;
}

export async function getUserRepos(): Promise<GitHubRepoResponse[]> {
  const allRepos: GitHubRepoResponse[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await githubFetch(
      `/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`,
    );
    const repos = (await response.json()) as GitHubRepoResponse[];
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
    if (page > 10) break;
  }
  return allRepos;
}

export async function createRepository(name: string, description: string, isPrivate: boolean): Promise<GitHubRepoResponse> {
  const response = await githubFetch('/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: true
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create repository');
  }
  
  return await response.json() as GitHubRepoResponse;
}

export async function setRepoTopics(owner: string, repo: string, topics: string[]): Promise<void> {
  const response = await githubFetch(`/repos/${owner}/${repo}/topics`, {
    method: 'PUT',
    body: JSON.stringify({ names: topics })
  });
  
  if (!response.ok) {
    console.warn(`[AlgoVault] Failed to set topics for ${owner}/${repo}`);
  }
}

export async function getRef(owner: string, repo: string, branch: string): Promise<string> {
  const response = await githubFetch(
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}?t=${Date.now()}`,
  );
  const data = (await response.json()) as { object?: { sha: string } };
  if (!data.object?.sha) throw AlgoVaultError.githubRepoNotFound(repo);
  return data.object.sha;
}

export async function getFileContent(owner: string, repo: string, branch: string, path: string): Promise<string | null> {
  try {
    const response = await githubFetch(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
    const data = await response.json();
    if (data.content) {
      // GitHub returns base64 with newlines, need to remove them before decoding
      return decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
    }
    return null;
  } catch (error) {
    if (error instanceof AlgoVaultError && error.code === ErrorCode.GITHUB_REPO_NOT_FOUND) return null;
    return null;
  }
}

// --- GRAPHQL CLIENT LOGIC ---

interface FileAddition {
  path: string;
  contents: string;
}

export async function batchCommitFiles(
  owner: string,
  repo: string,
  branch: string,
  message: string,
  files: FileAddition[],
  retryCount = 0
): Promise<{ commitUrl: string }> {
  try {
    const headOid = await getRef(owner, repo, branch);
    const token = await getToken();

    const fileChanges = {
      additions: files.map((f) => ({
        path: f.path,
        contents: b64EncodeUnicode(f.contents),
      })),
    };

    const mutation = `
      mutation CreateCommitOnBranch($input: CreateCommitOnBranchInput!) {
        createCommitOnBranch(input: $input) {
          commit { url }
        }
      }
    `;

    const response = await fetch(API.GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            branch: { repositoryNameWithOwner: `${owner}/${repo}`, branchName: branch },
            message: { headline: message },
            fileChanges,
            expectedHeadOid: headOid,
          },
        },
      }),
    });

    const result = await response.json();
    if (result.errors?.length) {
      const msg = result.errors[0].message;
      if (msg.includes('SHA') || msg.includes('conflict') || msg.includes('expected')) {
        throw new AlgoVaultError(ErrorCode.GITHUB_CONFLICT, msg, true);
      }
      throw new Error(msg);
    }

    return { commitUrl: result.data.createCommitOnBranch.commit.url };
  } catch (error) {
    if (error instanceof AlgoVaultError && error.code === ErrorCode.GITHUB_CONFLICT && retryCount < 2) {
      await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
      return batchCommitFiles(owner, repo, branch, message, files, retryCount + 1);
    }
    throw error;
  }
}

function b64EncodeUnicode(str: string) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  ));
}
