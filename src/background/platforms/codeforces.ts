import { AlgoVaultError } from '@shared/errors/taxonomy';
import type { ExtractedSubmission } from '@shared/types/submission';
import type { IPlatformAdapter } from './core';

// In-memory cache for problem metadata
let problemsetCache: Record<string, { name: string; tags: string[]; rating: number | string }> | null = null;
async function fetchProblemsetMetadata(): Promise<Record<string, { name: string; tags: string[]; rating: number | string }>> {
  if (problemsetCache) return problemsetCache;

  try {
    const res = await fetch('https://codeforces.com/api/problemset.problems');
    if (!res.ok) throw new Error('API fetch failed');
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('API returned non-OK status');

    const metaMap: Record<string, { name: string; tags: string[]; rating: number | string }> = {};
    for (const p of data.result.problems) {
      const key = `${p.contestId}-${p.index}`;
      metaMap[key] = {
        name: p.name,
        tags: p.tags || [],
        rating: p.rating ?? 'Unrated',
      };
    }
    problemsetCache = metaMap;
    return metaMap;
  } catch (e) {
    console.warn('[AlgoVault] Failed to fetch CF problemset metadata', e);
    return {};
  }
}

function normalizeCodeforcesLanguage(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('c++') || l.includes('g++')) return 'cpp';
  if (l.includes('java') && !l.includes('javascript')) return 'java';
  if (l.includes('python') || l.includes('pypy')) return 'python';
  if (l.includes('c#')) return 'csharp';
  if (l.includes('node') || l.includes('javascript')) return 'javascript';
  if (l.includes('ruby')) return 'ruby';
  if (l.includes('rust')) return 'rust';
  if (l.includes('go')) return 'go';
  if (l.includes('kotlin')) return 'kotlin';
  if (l.includes('swift')) return 'swift';
  if (l.includes('php')) return 'php';
  if (l.includes('scala')) return 'scala';
  if (l.includes('haskell')) return 'haskell';
  if (l.includes('pascal')) return 'pascal';
  if (l.includes('delphi')) return 'delphi';
  return l.replace(/[^a-z0-9]/g, ''); // strip spaces and special chars
}

export const CodeforcesAdapter: IPlatformAdapter = {
  id: 'codeforces',
  name: 'Codeforces',

  async isConnected(): Promise<boolean> {
    try {
      const username = await this.getUsername();
      return !!username;
    } catch {
      return false;
    }
  },

  async getUsername(): Promise<string> {
    try {
      const response = await fetch('https://codeforces.com/');
      const html = await response.text();
      // Match the profile link in the header: <a href="/profile/USERNAME">USERNAME</a>
      const match = html.match(/<a href="\/profile\/([^"]+)">/);
      if (match && match[1]) {
        return match[1];
      }
      throw new Error('Codeforces username not found. Please ensure you are logged in to Codeforces.');
    } catch (e: any) {
      if (e instanceof AlgoVaultError) throw e;
      throw new Error('Failed to fetch Codeforces username.');
    }
  },

  async fetchSubmissionDetails(submissionIdRaw: string, optionalMeta?: { language?: string; runtime?: string; memory?: string; }): Promise<ExtractedSubmission> {
    const parts = submissionIdRaw.split('-');
    let contestId = '', index = '', submissionId = '';
    
    if (parts.length === 3) {
      [contestId, index, submissionId] = parts;
    } else if (parts.length === 2) {
      [contestId, submissionId] = parts;
      index = 'Unknown';
    } else {
      throw new Error('Invalid Codeforces submission ID format.');
    }

    const url = `https://codeforces.com/contest/${contestId}/submission/${submissionId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch submission page from Codeforces.');
    }

    const html = await response.text();
    
    // Extract code
    const codeMatch = html.match(/<pre id="program-source-text"[^>]*>([\s\S]*?)<\/pre>/);
    if (!codeMatch || !codeMatch[1]) {
      throw new Error('Could not extract code from Codeforces submission page.');
    }
    
    // Clean code (CF escapes HTML entities in the <pre> block)
    let code = codeMatch[1];
    code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    
    // Extract problem metadata
    const meta = await fetchProblemsetMetadata();
    const problemMeta = meta[`${contestId}-${index}`] || { name: 'Unknown Problem', tags: [], rating: 'Unrated' };
    
    // Fallback if index wasn't passed via rawId
    if (index === 'Unknown') {
      const problemNameMatch = html.match(/<a href="\/contest\/\d+\/problem\/([^"]+)">([^<]+)<\/a>/);
      index = problemNameMatch ? problemNameMatch[1] : 'Unknown';
      if (problemNameMatch) problemMeta.name = problemNameMatch[2].trim();
    }
    
    const problemName = problemMeta.name;
    
    // Extract Language
    let language = optionalMeta?.language;
    if (!language || language === 'Unknown') {
      const langMatch = html.match(/<td>\s*Language:\s*<\/td>\s*<td>\s*([^<]+)\s*<\/td>/);
      language = langMatch ? langMatch[1].trim() : 'Unknown';
    }
    
    // Extract runtime and memory
    let runtime = optionalMeta?.runtime;
    if (!runtime || runtime === 'N/A') {
      const timeMatch = html.match(/<i class="icon-time"><\/i>\s*([^<]+)<\/td>/);
      runtime = timeMatch ? timeMatch[1].trim() : 'N/A';
    }
    
    let memory = optionalMeta?.memory;
    if (!memory || memory === 'N/A') {
      const memMatch = html.match(/<i class="icon-picture"><\/i>\s*([^<]+)<\/td>/);
      memory = memMatch ? memMatch[1].trim() : 'N/A';
    }

    // Fetch problem statement
    let description = 'Please visit the problem link for the full statement.';
    try {
      const probUrl = `https://codeforces.com/contest/${contestId}/problem/${index}`;
      const probRes = await fetch(probUrl);
      if (probRes.ok) {
        const probHtml = await probRes.text();
        const startIdx = probHtml.indexOf('<div class="problem-statement">');
        if (startIdx !== -1) {
          const endIdx = probHtml.indexOf('<script type="text/javascript">', startIdx);
          if (endIdx !== -1) {
            description = probHtml.substring(startIdx, endIdx);
            description = description.replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/g, '');
            // Strip any embedded script tags
            description = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          } else {
            description = probHtml.substring(startIdx, startIdx + 10000) + '...';
            description = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
          }
        }
      }
    } catch (e) {
       console.warn('Failed to fetch CF problem statement', e);
    }

    return {
      questionId: `${contestId}${index}`,
      title: problemName,
      titleSlug: `${contestId}-${index}`,
      difficulty: problemMeta.rating.toString(),
      description: description,
      examples: '',
      constraints: '',
      tags: problemMeta.tags,
      language: normalizeCodeforcesLanguage(language),
      solutionCode: code,
      runtime: runtime,
      memory: memory,
      url: `https://codeforces.com/contest/${contestId}/problem/${index}`,
      timestamp: new Date().toISOString()
    };
  },

  async *fetchAllPastSubmissions(): AsyncGenerator<ExtractedSubmission[], void, unknown> {
    const username = await this.getUsername();
    if (!username) throw new Error('Not logged in to Codeforces');

    const res = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&count=10000`);
    if (!res.ok) throw new Error('Failed to fetch user submissions from Codeforces API');
    const data = await res.json();
    if (data.status !== 'OK') throw new Error('Codeforces API returned error');

    const acceptedSubmissions = data.result.filter((s: any) => s.verdict === 'OK');
    
    // Deduplicate: only keep newest accepted submission for each problem
    const uniqueByProblem = new Map<string, any>();
    for (const sub of acceptedSubmissions) {
      // Problem uniquely identified by contestId and index
      const key = `${sub.problem.contestId}-${sub.problem.index}-${sub.programmingLanguage}`;
      // Submissions are returned newest first by API
      if (!uniqueByProblem.has(key)) {
        uniqueByProblem.set(key, sub);
      }
    }
    
    const pending = Array.from(uniqueByProblem.values());
    const meta = await fetchProblemsetMetadata();
    
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const chunk = pending.slice(i, i + BATCH_SIZE);
      const batch: ExtractedSubmission[] = [];
      
      for (const sub of chunk) {
        const contestId = sub.problem.contestId;
        const index = sub.problem.index;
        const problemKey = `${contestId}-${index}`;
        const problemMeta = meta[problemKey] || { name: sub.problem.name, tags: [], rating: 'Unrated' };
        
        try {
          // Fetch the submission HTML to get the code
          const url = `https://codeforces.com/contest/${contestId}/submission/${sub.id}`;
          const htmlRes = await fetch(url);
          if (!htmlRes.ok) throw new Error('Fetch failed');
          const html = await htmlRes.text();
          
          const codeMatch = html.match(/<pre id="program-source-text"[^>]*>([\s\S]*?)<\/pre>/);
          if (!codeMatch || !codeMatch[1]) throw new Error('Code not found in HTML');
          
          let code = codeMatch[1];
          code = code.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
          
          // Fetch problem statement
          let description = 'Please visit the problem link for the full statement.';
          try {
            const probUrl = `https://codeforces.com/contest/${contestId}/problem/${index}`;
            const probRes = await fetch(probUrl);
            if (probRes.ok) {
              const probHtml = await probRes.text();
              const startIdx = probHtml.indexOf('<div class="problem-statement">');
              if (startIdx !== -1) {
                // Find a safe end bound, usually scripts start right after the content area
                const endIdx = probHtml.indexOf('<script type="text/javascript">', startIdx);
                if (endIdx !== -1) {
                  description = probHtml.substring(startIdx, endIdx);
                  // Clean up stray closing divs that might have been caught
                  description = description.replace(/<\/div>\s*<\/div>\s*<\/div>\s*$/g, '');
                  // Strip any embedded script tags
                  description = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                } else {
                  description = probHtml.substring(startIdx, startIdx + 10000) + '...';
                  description = description.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                }
              }
            }
          } catch (e) {
             console.warn('Failed to fetch CF problem statement', e);
          }

          batch.push({
            questionId: `${contestId}${index}`,
            title: sub.problem.name,
            titleSlug: `${contestId}-${index}`,
            difficulty: problemMeta.rating.toString(),
            description: description,
            examples: '',
            constraints: '',
            tags: sub.problem.tags || problemMeta.tags,
            language: normalizeCodeforcesLanguage(sub.programmingLanguage),
            solutionCode: code,
            runtime: `${sub.timeConsumedMillis} ms`,
            memory: `${(sub.memoryConsumedBytes / 1024).toFixed(0)} KB`,
            url: `https://codeforces.com/contest/${contestId}/problem/${index}`,
            timestamp: new Date(sub.creationTimeSeconds * 1000).toISOString()
          });
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch (e) {
          console.warn(`[AlgoVault] Failed to fetch Codeforces submission ${sub.id}`, e);
        }
      }
      
      if (batch.length > 0) {
        yield batch;
      }
    }
  }
};
