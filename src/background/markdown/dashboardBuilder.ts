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
  if (platformId === 'leetcode') {
    branding = `
<p align="center">
  <img src="https://leetcard.jacoblin.cool/${username}?theme=dark&font=Poppins&ext=heatmap" width="100%" />
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
