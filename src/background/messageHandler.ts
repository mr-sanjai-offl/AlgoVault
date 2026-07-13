import { MessageType } from '@shared/types/messages';
import type { ExtensionMessage, HistoryItem, SyncStatusPayload } from '@shared/types/messages';
import { STORAGE_KEYS, RETRY, SOLUTION_FILE_NAMES, LANGUAGE_FOLDER_NAMES, MANIFEST_PATH } from '@shared/constants';
import { fetchManifest, mergeSubmission, manifestToStats, serializeManifest, cacheManifest } from './manifest/manifestStore';
import { startDeviceFlow, cancelDeviceFlow } from './auth/deviceFlow';
import { 
  getAuthState, 
  clearAuthState, 
  getUserConfig, 
  setUserConfig, 
  invalidateStatsCache 
} from './storage/configStore';
import { getEncrypted, removeEncrypted } from './storage/encryptedStorage';
import { computeStats } from './stats/aggregator';
import { 
  getAllSubmissions, 
  getAllSyncJobs, 
  clearAllData,
  enqueueJob,
  getJob,
  updateJobStatus,
  markSuccess,
  markFailed,
  getPendingJobs,
  getRetryableJobs,
  addSubmission,
  updateSyncJob,
  incrementAttempts
} from './storage/indexedDb';
import { computeDedupKey } from '@shared/utils/hash';
import { getUserRepos, batchCommitFiles, getFileContent } from './github/client';
import { buildReadme } from './markdown/readmeBuilder';
import { buildDashboardSection, mergeDashboard } from './markdown/dashboardBuilder';
import { fetchSubmissionDetails } from './leetcode/api';

type SendResponse = (response: unknown) => void;

// Simple error handling without the complex class
function getErrorMessage(error: any): string {
  if (error?.userMessage) return error.userMessage;
  return error?.message || String(error);
}

function isRetryable(error: any): boolean {
  if (error?.retryable !== undefined) return error.retryable;
  const msg = String(error).toLowerCase();
  return msg.includes('timeout') || msg.includes('network') || msg.includes('conflict') || msg.includes('sha');
}

// --- COMMUNICATION HELPERS ---

async function broadcastStatus(jobId: string, status: SyncStatusPayload['status'], message: string) {
  const payload: SyncStatusPayload = { jobId, status, message };
  // Send to popup
  chrome.runtime.sendMessage({ type: MessageType.SYNC_STATUS_UPDATE, payload }).catch(() => {});
  
  // Send to all LeetCode tabs
  const tabs = await chrome.tabs.query({ url: '*://*.leetcode.com/*' });
  for (const tab of tabs) {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: MessageType.SYNC_STATUS_UPDATE, payload }).catch(() => {});
    }
  }
}

async function showNotification(title: string, message: string, type: 'success' | 'error') {
  const config = await getUserConfig();
  if (!config.notifications) return;

  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
    title: title,
    message: message,
    priority: 2
  });
}

async function notifySyncComplete(jobId: string, title: string, githubUrl: string) {
  const message = { type: MessageType.SYNC_COMPLETE, payload: { jobId, title, githubUrl } };
  chrome.runtime.sendMessage(message).catch(() => {});
  
  const tabs = await chrome.tabs.query({ url: '*://*.leetcode.com/*' });
  for (const tab of tabs) {
    if (tab.id) chrome.tabs.sendMessage(tab.id, message).catch(() => {});
  }
  
  showNotification('AlgoVault: Sync Complete', `Successfully pushed "${title}" to GitHub.`, 'success');
}

async function notifySyncFailed(jobId: string, title: string, error: string) {
  const message = { type: MessageType.SYNC_FAILED, payload: { jobId, title, error } };
  chrome.runtime.sendMessage(message).catch(() => {});

  const tabs = await chrome.tabs.query({ url: '*://*.leetcode.com/*' });
  for (const tab of tabs) {
    if (tab.id) chrome.tabs.sendMessage(tab.id, message).catch(() => {});
  }

  showNotification('AlgoVault: Sync Failed', `Failed to push "${title}": ${error}`, 'error');
}

// --- SYNC LOGIC ---

async function processJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return;
  
  await updateJobStatus(jobId, 'in_progress');
  await broadcastStatus(jobId, 'in_progress', 'Preparing files...');
  
  const sub = job.payload;

  try {
    const config = await getUserConfig();
    if (!config.repoOwner || !config.repoName) {
      throw new Error('GitHub repository not configured. Please visit settings.');
    }

    const topic = sub.tags[0] || 'General';
    const problemName = sub.title;
    const langKey = sub.language.toLowerCase();
    const langFolder = LANGUAGE_FOLDER_NAMES[langKey] || langKey;
    const fileName = SOLUTION_FILE_NAMES[langKey] || 'solution.txt';
    
    // Structure: Topic/Problem Name/language/solution.ext
    const problemPath = `${topic}/${problemName}`;
    const solutionPath = `${problemPath}/${langFolder}/${fileName}`;
    const readmePath = `${problemPath}/README.md`;

    // 1. Add to local DB (for local history/UI)
    await addSubmission({ 
      ...sub, 
      id: job.id, 
      questionId: sub.questionId,
      problemSlug: sub.titleSlug, 
      syncedAt: Date.now(), 
      githubPath: `${problemPath}/`, 
      status: 'synced' 
    });
    
    // 2. Fetch manifest from repo (cross-device source of truth)
    await broadcastStatus(jobId, 'in_progress', 'Syncing manifest...');
    const currentManifest = await fetchManifest(
      config.repoOwner, config.repoName, config.branch
    );

    // 3. Merge this submission into manifest
    const updatedManifest = mergeSubmission(
      currentManifest, sub, `${problemPath}/`, langKey
    );

    // 4. Try to set username if not already in manifest
    if (!updatedManifest.username) {
      try {
        const { fetchLeetCodeUsername } = await import('./leetcode/api');
        updatedManifest.username = await fetchLeetCodeUsername();
      } catch { /* non-critical — username is for stats card only */ }
    }

    // 5. Compute stats from MANIFEST (not local DB)
    const stats = manifestToStats(updatedManifest);

    // 6. Build files
    const problemReadme = buildReadme(sub);
    const dashboardSection = buildDashboardSection(stats);

    // 7. Handle README merging
    await broadcastStatus(jobId, 'in_progress', 'Merging dashboard...');
    const existingReadme = await getFileContent(config.repoOwner, config.repoName, config.branch, 'README.md');
    const finalReadme = existingReadme ? mergeDashboard(existingReadme, dashboardSection) : dashboardSection;

    const files = [
      { path: solutionPath, contents: sub.solutionCode },
      { path: readmePath, contents: problemReadme },
      { path: 'README.md', contents: finalReadme },
      { path: MANIFEST_PATH, contents: serializeManifest(updatedManifest) },
    ];

    await broadcastStatus(jobId, 'committing', 'Pushing to GitHub...');
    const result = await batchCommitFiles(config.repoOwner, config.repoName, config.branch, `feat: Add ${sub.title}`, files);
    
    // 8. Cache manifest locally for popup stats + mark processed
    await cacheManifest(updatedManifest);
    await invalidateStatsCache();

    const processed = await chrome.storage.local.get(STORAGE_KEYS.PROCESSED_KEYS);
    const keys = processed[STORAGE_KEYS.PROCESSED_KEYS] || {};
    const key = sub.titleSlug;
    keys[key] = Date.now();
    await chrome.storage.local.set({ [STORAGE_KEYS.PROCESSED_KEYS]: keys });

    await markSuccess(jobId);
    await notifySyncComplete(jobId, sub.title, result.commitUrl);
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    if (isRetryable(error) && job.attempts < 2) {
      await broadcastStatus(jobId, 'pending', `Retrying... (${job.attempts + 1})`);
      await incrementAttempts(jobId, 2000);
    } else {
      await markFailed(jobId, errorMsg);
      await notifySyncFailed(jobId, sub.title, errorMsg);
    }
  }
}

export async function processQueue() {
  console.log('[AlgoVault] Processing sync queue...');
  const pending = await getPendingJobs();
  const retryable = await getRetryableJobs();
  for (const job of [...pending, ...retryable]) await processJob(job.id);
}

// --- MESSAGE HANDLER ---

export async function handleMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: SendResponse,
): Promise<boolean> {
  const respond = (data: any) => {
    try { sendResponse(data); } catch (e) { /* channel closed */ }
  };

  try {
    switch (message.type) {
      case MessageType.SUBMISSION_DETECTED: {
        const payload = message.payload;
        const dedupKey = await computeDedupKey(payload.titleSlug, payload.language, payload.solutionCode);
        const job = await enqueueJob(dedupKey, payload);
        processJob(job.id);
        respond({ success: true });
        break;
      }

      case MessageType.AUTH_START_DEVICE_FLOW: {
        const result = await startDeviceFlow();
        respond({ type: MessageType.AUTH_DEVICE_CODE, payload: { userCode: result.userCode, verificationUri: result.verificationUri, expiresIn: result.expiresIn } });
        break;
      }

      case MessageType.AUTH_STATUS_REQUEST: {
        const authState = await getAuthState();
        const token = await getEncrypted(STORAGE_KEYS.GITHUB_TOKEN);
        respond({ type: MessageType.AUTH_STATUS_RESPONSE, payload: { isAuthenticated: !!authState && !!token, username: authState?.username, avatarUrl: authState?.avatarUrl } });
        break;
      }

      case MessageType.GET_STATS: {
        const stats = await computeStats();
        respond({ type: MessageType.STATS_UPDATED, payload: stats });
        break;
      }

      case MessageType.GET_HISTORY: {
        const { page, pageSize, filter } = message.payload;
        const all = await getAllSubmissions();
        let items = all.map(s => ({ ...s }));
        if (filter !== 'all') items = items.filter(i => i.status === filter);
        items.sort((a, b) => b.syncedAt - a.syncedAt);
        const start = (page - 1) * pageSize;
        respond({ payload: { items: items.slice(start, start + pageSize), total: items.length, page, pageSize } });
        break;
      }

      case MessageType.GET_CONFIG: {
        const config = await getUserConfig();
        respond({ payload: config });
        break;
      }

      case MessageType.SET_CONFIG: {
        await setUserConfig(message.payload as any);
        respond({ success: true });
        break;
      }

      case MessageType.MANUAL_SYNC: {
        processQueue();
        respond({ success: true });
        break;
      }

      case MessageType.RETRY_JOB: {
        await updateSyncJob(message.payload.jobId, { attempts: 0, error: null });
        processJob(message.payload.jobId);
        respond({ success: true });
        break;
      }

      case MessageType.GET_REPOS: {
        const repos = await getUserRepos();
        respond({ type: MessageType.GET_REPOS, payload: { repos: repos.map(r => ({ fullName: r.full_name, name: r.name, owner: r.owner.login, defaultBranch: r.default_branch, private: r.private })) } });
        break;
      }

      case MessageType.SYNC_BY_ID: {
        const { submissionId } = message.payload;
        const details = await fetchSubmissionDetails(submissionId);
        const payload: any = {
          questionId: details.questionId,
          title: details.title,
          titleSlug: details.titleSlug,
          difficulty: details.difficulty as any,
          description: details.questionContent,
          examples: '',
          constraints: '',
          tags: details.tags,
          language: details.lang,
          solutionCode: details.code,
          runtime: details.runtime,
          memory: details.memory,
          url: `https://leetcode.com/problems/${details.titleSlug}/`,
          timestamp: new Date().toISOString()
        };
        const dedupKey = await computeDedupKey(payload.titleSlug, payload.language, payload.solutionCode);
        const job = await enqueueJob(dedupKey, payload);
        processJob(job.id);
        respond({ success: true });
        break;
      }

      case MessageType.AUTH_LOGOUT: {
        await clearAuthState();
        respond({ success: true });
        break;
      }

      case MessageType.EXPORT_DATA: {
        const config = await getUserConfig();
        const auth = await getAuthState();
        const submissions = await getAllSubmissions();
        const queue = await getAllSyncJobs();
        respond({ payload: { config, auth, submissions, queue, exportedAt: Date.now() } });
        break;
      }

      case MessageType.CLEAR_DATA: {
        await clearAllData();
        await clearAuthState();
        await invalidateStatsCache();
        respond({ success: true });
        break;
      }

      default:
        respond({ error: 'Unknown message' });
    }
  } catch (error) {
    respond({ error: getErrorMessage(error) });
  }
  return true;
}
