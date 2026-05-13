import type { StatsPayload } from '@shared/types/messages';
import { DASHBOARD_MARKERS } from '@shared/constants';

export function buildDashboardSection(stats: StatsPayload): string {
  const topics = Object.keys(stats.groupedSubmissions).sort();
  
  const topicSections = topics.map(topic => {
    const problems = stats.groupedSubmissions[topic].sort((a, b) => parseInt(a.questionId) - parseInt(b.questionId));
    const problemRows = problems.map(p => {
      const folderPath = encodeURI(`./${p.githubPath}`);
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

  const leetcodeUser = stats.username || 'mr_sanjai_offl';

  const content = `# 🚀 Data Structures & Algorithms Master Repository

A professionally structured collection of topic-wise DSA solutions, optimized coding patterns, and interview-focused problem solving designed for technical excellence, competitive programming, and software engineering career growth.

<p align="center">
  <img src="https://leetcard.jacoblin.cool/${leetcodeUser}?theme=dark&font=Poppins&ext=heatmap" width="100%" />
</p>

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
