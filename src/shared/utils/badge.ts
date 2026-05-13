export function difficultyBadge(difficulty: 'Easy' | 'Medium' | 'Hard'): string {
  const colors: Record<string, { bg: string; fg: string }> = {
    Easy: { bg: '#22c55e', fg: '#ffffff' },
    Medium: { bg: '#eab308', fg: '#000000' },
    Hard: { bg: '#ef4444', fg: '#ffffff' },
  };
  const c = colors[difficulty];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20"><rect rx="3" width="80" height="20" fill="${c.bg}"/><text x="40" y="14" fill="${c.fg}" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold">${difficulty}</text></svg>`;
}

export function languageBadge(language: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${language.length * 8 + 16}" height="20"><rect rx="3" width="${language.length * 8 + 16}" height="20" fill="#6366f1"/><text x="${(language.length * 8 + 16) / 2}" y="14" fill="#fff" text-anchor="middle" font-family="sans-serif" font-size="11">${language}</text></svg>`;
}

export function runtimeBadge(runtime: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${runtime.length * 7 + 24}" height="20"><rect rx="3" width="${runtime.length * 7 + 24}" height="20" fill="#8b5cf6"/><text x="${(runtime.length * 7 + 24) / 2}" y="14" fill="#fff" text-anchor="middle" font-family="sans-serif" font-size="11">⏱ ${runtime}</text></svg>`;
}

export function statsBadge(label: string, value: string | number, color: string): string {
  const w = (label.length + String(value).length) * 7 + 30;
  const lw = label.length * 7 + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20"><rect rx="3" width="${lw}" height="20" fill="#555"/><rect x="${lw}" rx="3" width="${w - lw}" height="20" fill="${color}"/><rect rx="3" width="${w}" height="20" fill="url(#a)"/><text x="${lw / 2}" y="14" fill="#fff" text-anchor="middle" font-family="sans-serif" font-size="11">${label}</text><text x="${lw + (w - lw) / 2}" y="14" fill="#fff" text-anchor="middle" font-family="sans-serif" font-size="11">${value}</text></svg>`;
}
