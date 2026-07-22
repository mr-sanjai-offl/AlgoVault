import type { StatsPayload } from '@shared/types/messages';
import { DASHBOARD_MARKERS } from '@shared/constants';

export function buildDashboardSection(stats: StatsPayload, platformId?: string): string {
  const topics = Object.keys(stats.groupedSubmissions).sort();
  
  const topicSections = topics.map(topic => {
    const problems = stats.groupedSubmissions[topic].sort((a, b) => {
      const idA = parseInt(a.questionId);
      const idB = parseInt(b.questionId);
      if (!isNaN(idA) && !isNaN(idB)) return idA - idB;
      return a.questionId.localeCompare(b.questionId);
    });
    const problemRows = problems.map(p => {
      // If we're inside a platform folder, strip the platform folder from the github path
      let relativePath = p.githubPath;
      if (platformId) {
        // p.githubPath is e.g. "LeetCode/Array/Two Sum/"
        // We want to link to "./Array/Two Sum/" since the README is inside "LeetCode/"
        const prefix = `${platformId}/`;
        if (relativePath.toLowerCase().startsWith(prefix.toLowerCase())) {
          relativePath = relativePath.substring(prefix.length);
        }
      }
      
      const folderPath = encodeURI(`./${relativePath}`);
      return `| ${p.questionId || '—'} | [${p.title}](${folderPath}) | ${p.difficulty} |`;
    }).join('\n');

    return `
### ${topic}
<details>
<summary>Click to expand ${topic} problems</summary>

| # | Problem | Difficulty |
|---|---------|------------|
${problemRows}

</details>
`;
  }).join('\n');

  const username = stats.username || 'mr_sanjai_offl';

  let branding = '';
  const ts = Date.now();
  if (platformId === 'leetcode') {
    branding = `
<p align="center">
  <img src="https://github-readme-leetcode-card.romitsagu.com/${username}?theme=tokyonight&show=graph,recent&v=${ts}" width="100%" />
</p>
`;
  } else if (platformId === 'codeforces') {
    branding = `
<p align="center">
  <img src="https://codeforces-stats-vlx.vercel.app/api/card?username=${username}&theme=dark&v=${ts}" width="100%" />
</p>
`;
  }

  const content = `# 🚀 ${platformId ? platformId.charAt(0).toUpperCase() + platformId.slice(1) : 'Data Structures & Algorithms'} Master Repository

A professionally structured collection of topic-wise DSA solutions, optimized coding patterns, and interview-focused problem solving designed for technical excellence, competitive programming, and software engineering career growth.
${branding}
# 📚 Structured Problem Solving Topics

${topicSections}

<p align="center">
Building Technical Excellence Through Consistent Problem Solving.
</p>
`;

  return `${DASHBOARD_MARKERS.START}\n${content}\n${DASHBOARD_MARKERS.END}`;
}

export function mergeDashboard(existingReadme: string, newSection: string): string {
  const startIdx = existingReadme.indexOf(DASHBOARD_MARKERS.START);
  const endIdx = existingReadme.indexOf(DASHBOARD_MARKERS.END);

  if (startIdx === -1 || endIdx === -1) {
    return existingReadme + '\n\n' + newSection;
  }

  const before = existingReadme.slice(0, startIdx);
  const after = existingReadme.slice(endIdx + DASHBOARD_MARKERS.END.length);
  return before + newSection + after;
}

export function buildRootDashboardSection(manifest: any): string {
  const hasLeetCode = !!manifest.platforms.leetcode;
  const hasCodeforces = !!manifest.platforms.codeforces;
  
  const lcUsername = manifest.platforms.leetcode?.username || 'user';
  const cfUsername = manifest.platforms.codeforces?.username || 'user';
  
  const ts = Date.now();
  let analyticsSection = '';
  if (hasLeetCode) {
    analyticsSection += `
<p align="center">
  <img src="https://github-readme-leetcode-card.romitsagu.com/${lcUsername}?theme=tokyonight&show=graph,recent&v=${ts}" width="100%" />
</p>
`;
  }
  
  if (hasCodeforces) {
    if (hasLeetCode) analyticsSection += `\n<br />\n`;
    analyticsSection += `
<p align="center">
  <img src="https://codeforces-stats-vlx.vercel.app/api/card?username=${cfUsername}&theme=dark&v=${ts}" width="100%" />
</p>
`;
  }

  let structureSection = '';
  if (hasLeetCode) {
    structureSection += `- **[LeetCode](./LeetCode)**: Topic-wise FAANG interview preparation and algorithmic challenges.\n`;
  }
  if (hasCodeforces) {
    structureSection += `- **[Codeforces](./Codeforces)**: Competitive programming contest solutions focusing on math, greedies, and advanced data structures.\n`;
  }

  const content = `# 🏆 Ultimate Competitive Programming & DSA Vault

Welcome to my **Master Repository** for Data Structures, Algorithms, and Competitive Programming! 🚀

This repository contains my personal library of highly optimized, strictly tested, and structured solutions to problems across multiple platforms. It is designed to track my progress, document optimal coding patterns, and demonstrate technical excellence in problem-solving.

## 📊 Real-Time Performance Analytics
${analyticsSection}
## 📂 Repository Structure

${structureSection}
---
<p align="center">
  <i>Auto-generated & continuously synced by <b>AlgoVault</b>. Building technical excellence through consistent problem solving.</i>
</p>
`;

  return `${DASHBOARD_MARKERS.START}\n${content}\n${DASHBOARD_MARKERS.END}`;
}
