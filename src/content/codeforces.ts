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
    if (verdictText.includes('accepted') || verdictText.includes('pretests passed')) {
      console.log(`[AlgoVault] Found accepted CF submission: ${submissionId}`);
      // Find the contest ID from the problem link or page URL
      const problemLink = row.querySelector('a[href*="/problem/"]');
      if (!problemLink) {
        console.warn(`[AlgoVault] No problem link found for submission ${submissionId}`);
        continue;
      }
      
      const href = problemLink.getAttribute('href') || '';
      const match = href.match(/\/contest\/(\d+)\/problem\/([^/]+)/) || href.match(/\/problemset\/problem\/(\d+)\/([^/]+)/);
      if (match) {
        const contestId = match[1];
        const index = match[2];
        
        // Extract language, runtime, memory
        let language = 'Unknown';
        let runtime = 'N/A';
        let memory = 'N/A';
        
        const tds = Array.from(row.querySelectorAll('td'));
        const vIndex = tds.findIndex(td => td.classList.contains('status-verdict-cell'));
        if (vIndex !== -1) {
           if (vIndex > 0) language = tds[vIndex - 1].textContent?.trim() || 'Unknown';
           if (vIndex + 1 < tds.length) runtime = tds[vIndex + 1].textContent?.trim() || 'N/A';
           if (vIndex + 2 < tds.length) memory = tds[vIndex + 2].textContent?.trim() || 'N/A';
        }

        const rawSubmissionId = `${contestId}-${index}-${submissionId}`;
        console.log(`[AlgoVault] Triggering sync for ${rawSubmissionId} with lang=${language}`);
        triggerSync(rawSubmissionId, language, runtime, memory);
        break; // Only process one at a time
      } else {
        console.warn(`[AlgoVault] Could not extract contest ID from ${href}`);
      }
    }
  }
}

async function triggerSync(rawSubmissionId: string, language: string, runtime: string, memory: string) {
  if (isInvalidated() || inFlightSubmissionId === rawSubmissionId) return;

  inFlightSubmissionId = rawSubmissionId;
  const parts = rawSubmissionId.split('-');
  lastProcessedSubmissionId = parts[parts.length - 1];

  // Get autoSync preference
  let config: any = { autoSync: false };
  try {
    const response = await safeSendMessage({ type: MessageType.GET_CONFIG });
    if (response?.payload) {
      config = response.payload;
    }
  } catch (err) {
    console.warn('[AlgoVault] Failed to get config', err);
    inFlightSubmissionId = '';
    return;
  }

  if (!config.autoSync) {
    console.log('[AlgoVault] Codeforces auto-sync is disabled in settings.');
    inFlightSubmissionId = '';
    return;
  }

  // Check if recently processed
  const storage = await safeGetStorage(STORAGE_KEYS.PROCESSED_KEYS);
  const processed = storage[STORAGE_KEYS.PROCESSED_KEYS] || {};
  
  if (processed[rawSubmissionId]) {
    inFlightSubmissionId = '';
    return;
  }

  try {
    await safeSendMessage({
      type: MessageType.SYNC_BY_ID,
      payload: { 
        submissionId: rawSubmissionId, 
        platformId: 'codeforces',
        language,
        runtime,
        memory
      },
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
