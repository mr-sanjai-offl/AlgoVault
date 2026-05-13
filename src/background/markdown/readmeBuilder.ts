import type { ExtractedSubmission } from '@shared/types/submission';

export function buildReadme(
  submission: ExtractedSubmission,
): string {
  const diffColor =
    submission.difficulty === 'Easy' ? '22c55e' :
    submission.difficulty === 'Medium' ? 'eab308' : 'ef4444';

  const lines: string[] = [
    `# ${submission.questionId ? submission.questionId + '. ' : ''}${submission.title}`,
    '',
    `[![LeetCode Link](https://img.shields.io/badge/LeetCode-Problem_Link-FFA116?style=flat-square&logo=leetcode)](${submission.url})`,
    `![Difficulty](https://img.shields.io/badge/Difficulty-${submission.difficulty}-${diffColor}?style=flat-square)`,
    '',
    '## Problem Statement',
    '',
    submission.description || 'See problem description on LeetCode.',
    '',
  ];

  if (submission.examples && submission.examples.trim()) {
    lines.push('## Examples');
    lines.push('');
    lines.push('```');
    lines.push(submission.examples.trim());
    lines.push('```');
    lines.push('');
  }

  if (submission.constraints && submission.constraints.trim()) {
    lines.push('## Constraints');
    lines.push('');
    const constraintList = submission.constraints
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => `- ${l.trim()}`)
      .join('\n');
    lines.push(constraintList);
    lines.push('');
  }

  lines.push('---');
  lines.push('*Synced automatically with [AlgoVault](https://github.com/mr-sanjai-offl/AlgoVault)*');

  return lines.join('\n');
}
