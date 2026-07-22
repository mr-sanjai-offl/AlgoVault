import { MessageType } from '@shared/types/messages';
import { STORAGE_KEYS } from '@shared/constants';

let isZombie = false;

function isInvalidated(): boolean {
  if (isZombie) return true;
  try {
    if (!chrome.runtime?.id) {
      isZombie = true;
      return true;
    }
    return false;
  } catch (e) {
    isZombie = true;
    return true;
  }
}

async function safeSendMessage(message: any): Promise<any> {
  if (isInvalidated()) return null;
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (err) {
    if (String(err).includes('context invalidated')) {
      isZombie = true;
      return null;
    }
    throw err;
  }
}

async function safeGetStorage(keys: any): Promise<any> {
  if (isInvalidated()) return {};
  try {
    return await chrome.storage.local.get(keys);
  } catch (err) {
    if (String(err).includes('context invalidated')) {
      isZombie = true;
      return {};
    }
    throw err;
  }
}

let lastProcessedSubmissionId = '';
let inFlightSubmissionId = '';

function checkCodeforcesSubmissions() {
  if (isInvalidated() || inFlightSubmissionId) return;

  // We are on a status page e.g. /contest/*/my or /problemset/status
  // CF table has class "status-frame-datatable"
  const table = document.querySelector('.status-frame-datatable');
  if (!table) return;

  const rows = table.querySelectorAll('tr[data-submission-id]');
  for (const row of Array.from(rows)) {
    const submissionId = row.getAttribute('data-submission-id');
    if (!submissionId || submissionId === lastProcessedSubmissionId) continue;

    // Check verdict
    const verdictCell = row.querySelector('.status-verdict-cell');
    if (!verdictCell) continue;
    const verdictText = verdictCell.textContent?.trim().toLowerCase() || '';

    // If accepted
    if (verdictText.includes('accepted')) {
      // Find the contest ID from the problem link or page URL
      const problemLink = row.querySelector('a[href*="/problem/"]');
      if (!problemLink) continue;
      
      const href = problemLink.getAttribute('href') || '';
      // href looks like /contest/123/problem/A
      const match = href.match(/\/contest\/(\d+)\/problem\/([^/]+)/);
      if (match) {
        const contestId = match[1];
        
        // Final raw submission ID for the adapter: contestId-submissionId
        const rawSubmissionId = `${contestId}-${submissionId}`;
        
        triggerSync(rawSubmissionId);
        break; // Only process one at a time
      }
    }
  }
}

async function triggerSync(rawSubmissionId: string) {
  if (isInvalidated() || inFlightSubmissionId === rawSubmissionId) return;

  // Get autoSync preference
  let config: any = { autoSync: false };
  try {
    const response = await safeSendMessage({ type: MessageType.GET_CONFIG });
    if (response?.payload) {
      config = response.payload;
    }
  } catch (err) {
    console.warn('[AlgoVault] Failed to get config', err);
    return;
  }

  if (!config.autoSync) return;

  // Check if recently processed
  const storage = await safeGetStorage(STORAGE_KEYS.PROCESSED_KEYS);
  const processed = storage[STORAGE_KEYS.PROCESSED_KEYS] || {};
  
  if (processed[rawSubmissionId]) {
    return;
  }

  inFlightSubmissionId = rawSubmissionId;
  lastProcessedSubmissionId = rawSubmissionId.split('-')[1];

  try {
    await safeSendMessage({
      type: MessageType.SYNC_BY_ID,
      payload: { submissionId: rawSubmissionId, platformId: 'codeforces' },
    });
  } catch (err) {
    console.error('[AlgoVault] Codeforces sync failed', err);
  } finally {
    setTimeout(() => {
      inFlightSubmissionId = '';
    }, 5000);
  }
}

export function startCodeforcesObserver(): void {
  if (isInvalidated()) return;
  
  // Initial check
  checkCodeforcesSubmissions();
  
  // Observe for DOM changes (Codeforces sometimes updates the table via AJAX for running submissions)
  const observer = new MutationObserver(() => {
    checkCodeforcesSubmissions();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}
