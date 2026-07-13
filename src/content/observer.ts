import { extractSubmission } from './extractor';
import { MessageType } from '@shared/types/messages';
import { STORAGE_KEYS } from '@shared/constants';

let config = { autoSync: false };
let lastSyncedSubmissionId = '';
let mainObserver: MutationObserver | null = null;
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

function handleInvalidated(): void {
  isZombie = true;
  if (mainObserver) {
    try { mainObserver.disconnect(); } catch (e) {}
    mainObserver = null;
  }
  const pushBtn = document.getElementById('algovault-push-btn') as HTMLButtonElement;
  if (pushBtn) {
    pushBtn.disabled = true;
    pushBtn.style.backgroundColor = '#64748b';
    pushBtn.innerHTML = '↻ Please Refresh Page';
    pushBtn.onclick = () => window.location.reload();
  }
}

// Global safety net for extension context errors
window.addEventListener('unhandledrejection', (event) => {
  const reason = String(event.reason || '');
  if (reason.includes('context invalidated') || reason.includes('Extension context')) {
    event.preventDefault();
    handleInvalidated();
  }
});

const LOGO_SVG = `
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
`;

const RESULT_SELECTORS = [
  '[data-e2e-locator="submission-result"]',
  '.success__3Ai7',
  '#result-state',
  '[class*="result-container"]'
];

function getSubmissionStatus(): string {
  for (const selector of RESULT_SELECTORS) {
    const el = document.querySelector(selector);
    if (el) return el.textContent?.toLowerCase() || '';
  }
  return '';
}

function getSubmissionIdFromUrl(): string {
  const match = window.location.href.match(/\/submissions\/(\d+)\/?/);
  return match ? match[1] : '';
}

let isSyncingInProgress = false;

async function safeSendMessage(message: any): Promise<any> {
  if (isInvalidated()) { handleInvalidated(); return null; }
  try {
    return await chrome.runtime.sendMessage(message);
  } catch (err) {
    if (String(err).includes('context invalidated')) {
      handleInvalidated();
      return null;
    }
    throw err;
  }
}

async function safeGetStorage(keys: any): Promise<any> {
  if (isInvalidated()) { handleInvalidated(); return {}; }
  try {
    return await chrome.storage.local.get(keys);
  } catch (err) {
    if (String(err).includes('context invalidated')) {
      handleInvalidated();
      return {};
    }
    throw err;
  }
}

let lastProcessedSubmissionId = '';
let inFlightSlugs = new Set<string>();

function triggerSync(submissionId?: string): void {
  const id = submissionId || getSubmissionIdFromUrl();
  const slug = window.location.pathname.match(/\/problems\/([^/]+)/)?.[1] || '';

  if (isSyncingInProgress || isInvalidated()) return;
  if (id && id === lastProcessedSubmissionId) return;
  if (slug && inFlightSlugs.has(slug)) return;

  const status = getSubmissionStatus();
  if (status.length > 0 && !status.includes('accepted') && !status.includes('success')) {
    const btn = document.getElementById('algovault-push-btn') as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.style.backgroundColor = '#ef4444';
      btn.innerHTML = '✗ Only Accepted';
      setTimeout(() => {
        btn.disabled = false;
        btn.style.backgroundColor = '#2cbb5d';
        btn.innerHTML = `${LOGO_SVG}<span>Push to GitHub</span>`;
      }, 3000);
    }
    return;
  }

  const pushBtn = document.getElementById('algovault-push-btn') as HTMLButtonElement;
  if (pushBtn) {
    if (pushBtn.disabled && !pushBtn.innerHTML.includes('Synced')) return;
    pushBtn.disabled = true;
    pushBtn.style.backgroundColor = '#1e293b';
    pushBtn.innerHTML = 'Syncing...';
  }

  isSyncingInProgress = true;
  if (id) lastProcessedSubmissionId = id;
  if (slug) inFlightSlugs.add(slug);

  if (id) {
    safeSendMessage({
      type: MessageType.SYNC_BY_ID,
      payload: { submissionId: id },
    }).catch(() => {}).finally(() => { 
      isSyncingInProgress = false; 
      setTimeout(() => { if (slug) inFlightSlugs.delete(slug); }, 5000);
    });
  } else {
    try {
      const submission = extractSubmission();
      safeSendMessage({
        type: MessageType.SUBMISSION_DETECTED,
        payload: submission,
      }).catch((err) => {
        console.error('[AlgoVault] Sync failed', err);
      }).finally(() => {
        isSyncingInProgress = false;
        setTimeout(() => { if (slug) inFlightSlugs.delete(slug); }, 5000);
      });
    } catch (err) {
      console.error('[AlgoVault] Extraction failed', err);
      isSyncingInProgress = false;
      if (slug) inFlightSlugs.delete(slug);
      if (pushBtn) {
        pushBtn.disabled = false;
        pushBtn.style.backgroundColor = '#ef4444';
        pushBtn.innerHTML = 'Extraction Error';
      }
    }
  }
}

function getElementByXPath(path: string): Node | null {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function injectSyncUI(): void {
  if (isInvalidated()) { handleInvalidated(); return; }

  if (document.getElementById('algovault-push-btn')) {
    if (window.location.href !== lastSyncedSubmissionId) {
      checkAutoSync().catch(() => {});
    }
    return;
  }

  const xpathTarget = getElementByXPath('//*[@id="__next"]/div[2]/div/div/div[3]/nav/div[2]');
  const submitBtn = document.querySelector('[data-e2e-locator="console-submit-button"]') ||
    document.querySelector('button.bg-blue-s');

  const target = xpathTarget || (submitBtn?.parentElement);

  if (target) {
    const pushBtn = document.createElement('button');
    pushBtn.id = 'algovault-push-btn';
    pushBtn.type = 'button';
    pushBtn.title = 'Push current code to GitHub';
    pushBtn.innerHTML = `
      ${LOGO_SVG}
      <span>Push to GitHub</span>
    `;

    pushBtn.style.cssText = `
      background-color: #2cbb5d;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 0 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      margin-left: 12px;
      margin-right: 12px;
      height: 28px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      white-space: nowrap;
    `;

    pushBtn.onmouseover = () => { if (!pushBtn.disabled) pushBtn.style.backgroundColor = '#39d353'; };
    pushBtn.onmouseout = () => { if (!pushBtn.disabled) pushBtn.style.backgroundColor = '#2cbb5d'; };

    pushBtn.onclick = (e) => {
      e.stopPropagation();
      triggerSync();
    };

    if (xpathTarget && xpathTarget.parentElement) {
      xpathTarget.parentElement.insertBefore(pushBtn, xpathTarget);
    } else if (submitBtn) {
      submitBtn.parentElement?.insertBefore(pushBtn, submitBtn);
    }
  }

  checkAutoSync().catch(() => {});
}

let isAutoSyncPending = false;

async function checkAutoSync(): Promise<void> {
  if (isInvalidated() || isSyncingInProgress || isAutoSyncPending) return;
  
  if (config && config.autoSync === true) {
    const status = getSubmissionStatus();
    if (status.includes('accepted') || status.includes('success')) {
      const url = window.location.href;
      const slug = window.location.pathname.match(/\/problems\/([^/]+)/)?.[1] || '';
      const submissionId = getSubmissionIdFromUrl();

      if (url === lastSyncedSubmissionId) return;
      if (submissionId && submissionId === lastProcessedSubmissionId) return;
      if (slug && inFlightSlugs.has(slug)) return;
      
      // Synchronously mark as pending to block parallel calls
      isAutoSyncPending = true;
      lastSyncedSubmissionId = url;

      let finalSubId = submissionId;
      if (!finalSubId) {
        const detailLink = document.querySelector('a[href*="/submissions/detail/"]');
        if (detailLink) {
          const match = detailLink.getAttribute('href')?.match(/\/submissions\/detail\/(\d+)\//);
          if (match) finalSubId = match[1];
        }
      }

      const storage = await safeGetStorage(STORAGE_KEYS.PROCESSED_KEYS);
      const processed = storage[STORAGE_KEYS.PROCESSED_KEYS] || {};
      
      if (processed[slug] && (Date.now() - processed[slug] < 60000)) {
        isAutoSyncPending = false;
        return;
      }

      setTimeout(() => {
        isAutoSyncPending = false;
        if (isInvalidated()) return;
        const currentStatus = getSubmissionStatus();
        if (currentStatus.includes('accepted') || currentStatus.includes('success')) {
          triggerSync(finalSubId);
        }
      }, 1000);
    }
  }
}

// Protected Message Listener
chrome.runtime.onMessage.addListener((message) => {
  if (isInvalidated()) { handleInvalidated(); return; }

  try {
    if (message.type === MessageType.SYNC_BY_ID) {
      triggerSync(message.payload.submissionId);
      return;
    }

    const pushBtn = document.getElementById('algovault-push-btn') as HTMLButtonElement;
    if (!pushBtn) return;

    if (message.type === MessageType.SYNC_STATUS_UPDATE) {
      pushBtn.disabled = true;
      pushBtn.style.backgroundColor = '#1e293b';
      pushBtn.innerHTML = `
        ${LOGO_SVG}
        <span>${message.payload.message || 'Syncing...'}</span>
      `;
    } else if (message.type === MessageType.SYNC_COMPLETE) {
      isSyncingInProgress = false;
      pushBtn.style.backgroundColor = '#1a7f37';
      pushBtn.innerHTML = '✓ Synced';
      setTimeout(() => {
        if (isInvalidated()) return;
        pushBtn.disabled = false;
        pushBtn.style.backgroundColor = '#2cbb5d';
        pushBtn.innerHTML = `
          ${LOGO_SVG}
          <span>Push to GitHub</span>
        `;
      }, 5000);
    } else if (message.type === MessageType.SYNC_FAILED) {
      isSyncingInProgress = false;
      pushBtn.disabled = false;
      pushBtn.style.backgroundColor = '#ef4444';
      pushBtn.innerHTML = '✗ Failed';
      setTimeout(() => {
        if (isInvalidated()) return;
        pushBtn.style.backgroundColor = '#2cbb5d';
        pushBtn.innerHTML = `
          ${LOGO_SVG}
          <span>Push to GitHub</span>
        `;
      }, 3000);
    }
  } catch (e) {
    if (isInvalidated()) handleInvalidated();
  }
});

async function loadConfig(): Promise<void> {
  try {
    const response = await safeSendMessage({ type: MessageType.GET_CONFIG });
    if (response?.payload) {
      config = response.payload;
    }
  } catch (err) {
    if (!isInvalidated()) console.warn('[AlgoVault] Config load failed', err);
  }
}

// Protected Storage Listener
chrome.storage.onChanged.addListener((changes, area) => {
  if (isInvalidated()) { handleInvalidated(); return; }
  try {
    if (area === 'local' && changes[STORAGE_KEYS.USER_CONFIG]) {
      config = changes[STORAGE_KEYS.USER_CONFIG].newValue;
    }
  } catch (e) {
    if (isInvalidated()) handleInvalidated();
  }
});

export function startObserver(): void {
  if (isInvalidated()) return;
  loadConfig().catch(() => {}).then(() => {
    if (isInvalidated()) return;
    injectSyncUI();
    mainObserver = new MutationObserver(() => {
      if (isInvalidated()) { handleInvalidated(); return; }
      injectSyncUI();
    });
    mainObserver.observe(document.body, { childList: true, subtree: true });
  }).catch(() => {
    if (isInvalidated()) handleInvalidated();
  });
}
