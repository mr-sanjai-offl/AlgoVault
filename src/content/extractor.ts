import type { ExtractedSubmission } from '@shared/types/submission';

function extractDifficulty(): 'Easy' | 'Medium' | 'Hard' {
  const diffEl = document.querySelector('[diff]');
  if (diffEl) {
    const text = n(diffEl).toLowerCase();
    if (text.includes('easy')) return 'Easy';
    if (text.includes('medium')) return 'Medium';
    if (text.includes('hard')) return 'Hard';
  }

  const badges = document.querySelectorAll(
    '.text-difficulty-easy, .text-olive, [class*="easy"]',
  );
  if (badges.length > 0) return 'Easy';

  const medBadges = document.querySelectorAll(
    '.text-difficulty-medium, .text-yellow, [class*="medium"]',
  );
  if (medBadges.length > 0) return 'Medium';

  const hardBadges = document.querySelectorAll(
    '.text-difficulty-hard, .text-pink, [class*="hard"]',
  );
  if (hardBadges.length > 0) return 'Hard';

  const allText = document.body.innerText;
  if (/\bEasy\b/.test(allText)) return 'Easy';
  if (/\bHard\b/.test(allText)) return 'Hard';
  return 'Medium';
}

function extractQuestionId(): string {
  const titleEl = document.querySelector(
    '[data-cy="question-title"], h4[class*="title"], div[class*="title"] a, span[class*="title"]',
  );
  if (titleEl) {
    const text = n(titleEl);
    const match = text.match(/^(\d+)\./);
    if (match) return match[1];
  }

  const h4 = document.querySelector('h4');
  if (h4) {
    const text = n(h4);
    const match = text.match(/^(\d+)\./);
    if (match) return match[1];
  }

  return '';
}

function extractTitle(): string {
  const titleEl = document.querySelector(
    '[data-cy="question-title"], h4[class*="title"], div[class*="title"] a, span[class*="title"]',
  );
  if (titleEl) {
    const text = n(titleEl).replace(/^\d+\.\s*/, '');
    if (text) return text;
  }

  const h4 = document.querySelector('h4');
  if (h4) {
    const text = n(h4).replace(/^\d+\.\s*/, '');
    if (text) return text;
  }

  const docTitle = document.title.split('-')[0].trim();
  if (docTitle && docTitle !== 'LeetCode') return docTitle;

  const path = window.location.pathname;
  const match = path.match(/\/problems\/([^/]+)/);
  if (match) return match[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return 'Unknown Problem';
}

function n(el: Element | null): string {
  return el?.textContent?.trim() ?? '';
}

function extractTitleSlug(): string {
  const path = window.location.pathname;
  const match = path.match(/\/problems\/([^/]+)/);
  return match ? match[1] : 'unknown-problem';
}

function extractDescription(): string {
  const descEl = document.querySelector(
    '[data-track-load="description_content"], .question-content, div[class*="description"]',
  );
  return descEl ? descEl.textContent?.trim() ?? '' : '';
}

function extractExamples(): string {
  const examples: string[] = [];
  const preElements = document.querySelectorAll('pre');
  preElements.forEach((pre) => {
    const text = pre.textContent?.trim();
    if (text && (text.includes('Input') || text.includes('Output'))) {
      examples.push(text);
    }
  });
  return examples.join('\n\n') || 'See problem description.';
}

function extractConstraints(): string {
  const constraintHeader = Array.from(document.querySelectorAll('p, strong')).find(
    (el) => el.textContent?.includes('Constraints'),
  );
  if (constraintHeader) {
    const list = constraintHeader.closest('div')?.querySelector('ul');
    if (list) {
      return Array.from(list.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter(Boolean)
        .join('\n');
    }
  }
  return '';
}

function extractTags(): string[] {
  const tagEls = document.querySelectorAll(
    'a[href*="/tag/"], div[class*="tag"] a, span[class*="tag"]',
  );
  const tags: string[] = [];
  tagEls.forEach((el) => {
    const text = n(el);
    if (text && !tags.includes(text)) tags.push(text);
  });
  return tags.length > 0 ? tags : ['General'];
}

function extractLanguage(): string {
  const langBtn = document.querySelector(
    'button[id*="lang"], div[class*="lang"] button, [data-cy="lang-btn"]',
  );
  if (langBtn) return n(langBtn).toLowerCase();

  const codeArea = document.querySelector('.monaco-editor, .CodeMirror');
  if (codeArea) {
    const langClass = Array.from(codeArea.classList).find(
      (c) => c.startsWith('language-') || c.startsWith('mode-'),
    );
    if (langClass) return langClass.replace(/^(language-|mode-)/, '');
  }

  return 'python';
}

function extractSolutionCode(): string {
  const monacoLines = document.querySelectorAll('.view-lines .view-line');
  if (monacoLines.length > 0) {
    return Array.from(monacoLines)
      .map((line) => line.textContent ?? '')
      .join('\n');
  }

  const codeEl = document.querySelector('code, pre code, .CodeMirror-code');
  if (codeEl) return codeEl.textContent?.trim() ?? '';

  return '// Code extraction failed — please paste manually';
}

function extractRuntime(): string {
  const resultContainer = document.querySelector(
    '[data-e2e-locator="submission-result"], #result-state',
  );
  if (resultContainer) {
    const text = resultContainer.textContent ?? '';
    const runtimeMatch = text.match(/(\d+)\s*ms/);
    if (runtimeMatch) return `${runtimeMatch[1]} ms`;
  }

  const allText = document.body.innerText;
  const match = allText.match(/Runtime[:\s]*(\d+)\s*ms/i);
  return match ? `${match[1]} ms` : 'N/A';
}

function extractMemory(): string {
  const resultContainer = document.querySelector(
    '[data-e2e-locator="submission-result"], #result-state',
  );
  if (resultContainer) {
    const text = resultContainer.textContent ?? '';
    const memMatch = text.match(/([\d.]+)\s*MB/);
    if (memMatch) return `${memMatch[1]} MB`;
  }

  const allText = document.body.innerText;
  const match = allText.match(/Memory[:\s]*([\d.]+)\s*MB/i);
  return match ? `${match[1]} MB` : 'N/A';
}

export function extractSubmission(): ExtractedSubmission {
  const titleSlug = extractTitleSlug();
  const questionId = extractQuestionId();
  
  return {
    questionId: questionId,
    title: extractTitle(),
    titleSlug: titleSlug,
    difficulty: extractDifficulty(),
    description: extractDescription(),
    examples: extractExamples(),
    constraints: extractConstraints(),
    tags: extractTags(),
    language: extractLanguage(),
    solutionCode: extractSolutionCode(),
    runtime: extractRuntime(),
    memory: extractMemory(),
    url: `https://leetcode.com/problems/${titleSlug}/`,
    timestamp: new Date().toISOString(),
  };
}
