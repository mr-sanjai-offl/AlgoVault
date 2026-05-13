import { DB_NAME, DB_VERSION, STORE_SUBMISSIONS, STORE_SYNC_QUEUE, STORE_ERROR_LOG } from '@shared/constants';
import type { StoredSubmission } from '@shared/types/submission';
import type { SyncJob } from '@shared/types/sync';
import type { ErrorCode } from '@shared/types/errors';

interface ErrorLogEntry {
  id: string;
  code: ErrorCode;
  message: string;
  context: Record<string, unknown>;
  timestamp: number;
  jobId: string | null;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_SUBMISSIONS)) {
        const subStore = db.createObjectStore(STORE_SUBMISSIONS, { keyPath: 'id' });
        subStore.createIndex('problemSlug', 'problemSlug', { unique: false });
        subStore.createIndex('status', 'status', { unique: false });
        subStore.createIndex('syncedAt', 'syncedAt', { unique: false });
        subStore.createIndex('difficulty', 'difficulty', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('dedupKey', 'dedupKey', { unique: false });
        queueStore.createIndex('nextRetryAt', 'nextRetryAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_ERROR_LOG)) {
        const errorStore = db.createObjectStore(STORE_ERROR_LOG, { keyPath: 'id' });
        errorStore.createIndex('timestamp', 'timestamp', { unique: false });
        errorStore.createIndex('jobId', 'jobId', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onclose = () => { dbInstance = null; };
      resolve(dbInstance);
    };
    request.onerror = () => reject(request.error);
  });
}

function txPromise<T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);
        const req = action(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

function txAllPromise<T>(
  storeName: string,
  indexName: string | null,
  query: IDBValidKey | IDBKeyRange | null,
): Promise<T[]> {
  return openDB().then(
    (db) =>
      new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const source = indexName ? store.index(indexName) : store;
        const req = source.getAll(query);
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      }),
  );
}

// Submissions CRUD
export function addSubmission(submission: StoredSubmission): Promise<IDBValidKey> {
  return txPromise(STORE_SUBMISSIONS, 'readwrite', (s) => s.put(submission));
}

export function getSubmission(id: string): Promise<StoredSubmission | undefined> {
  return txPromise(STORE_SUBMISSIONS, 'readonly', (s) => s.get(id));
}

export function getAllSubmissions(): Promise<StoredSubmission[]> {
  return txAllPromise<StoredSubmission>(STORE_SUBMISSIONS, null, null);
}

export function getSubmissionsByStatus(status: string): Promise<StoredSubmission[]> {
  return txAllPromise<StoredSubmission>(STORE_SUBMISSIONS, 'status', status);
}

export function updateSubmission(id: string, updates: Partial<StoredSubmission>): Promise<IDBValidKey> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SUBMISSIONS, 'readwrite');
        const store = tx.objectStore(STORE_SUBMISSIONS);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const existing = getReq.result as StoredSubmission | undefined;
          if (!existing) { reject(new Error(`Submission ${id} not found`)); return; }
          const updated = { ...existing, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(putReq.result);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      }),
  );
}

// Sync Queue CRUD
export function addSyncJob(job: SyncJob): Promise<IDBValidKey> {
  return txPromise(STORE_SYNC_QUEUE, 'readwrite', (s) => s.put(job));
}

export function getSyncJob(id: string): Promise<SyncJob | undefined> {
  return txPromise(STORE_SYNC_QUEUE, 'readonly', (s) => s.get(id));
}

export const getJob = getSyncJob;

export function getAllSyncJobs(): Promise<SyncJob[]> {
  return txAllPromise<SyncJob>(STORE_SYNC_QUEUE, null, null);
}

export function getSyncJobsByStatus(status: string): Promise<SyncJob[]> {
  return txAllPromise<SyncJob>(STORE_SYNC_QUEUE, 'status', status);
}

export function getSyncJobByDedupKey(dedupKey: string): Promise<SyncJob[]> {
  return txAllPromise<SyncJob>(STORE_SYNC_QUEUE, 'dedupKey', dedupKey);
}

export function updateSyncJob(id: string, updates: Partial<SyncJob>): Promise<IDBValidKey> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_SYNC_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_SYNC_QUEUE);
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const existing = getReq.result as SyncJob | undefined;
          if (!existing) { reject(new Error(`SyncJob ${id} not found`)); return; }
          const updated = { ...existing, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(putReq.result);
          putReq.onerror = () => reject(putReq.error);
        };
        getReq.onerror = () => reject(getReq.error);
      }),
  );
}

export function deleteSyncJob(id: string): Promise<undefined> {
  return txPromise(STORE_SYNC_QUEUE, 'readwrite', (s) => s.delete(id));
}

// Sync Engine Utilities
export async function getPendingJobs(): Promise<SyncJob[]> {
  return txAllPromise<SyncJob>(STORE_SYNC_QUEUE, 'status', 'pending');
}

export async function getRetryableJobs(): Promise<SyncJob[]> {
  const all = await txAllPromise<SyncJob>(STORE_SYNC_QUEUE, 'status', 'failed');
  const now = Date.now();
  return all.filter(job => job.nextRetryAt <= now);
}

export async function updateJobStatus(id: string, status: SyncJob['status']): Promise<void> {
  await updateSyncJob(id, { status });
}

export async function markSuccess(id: string): Promise<void> {
  await updateSyncJob(id, { status: 'success', error: null, nextRetryAt: 0 });
}

export async function markFailed(id: string, error: string): Promise<void> {
  await updateSyncJob(id, { status: 'failed', error });
}

export async function incrementAttempts(id: string, delayMs: number): Promise<void> {
  const job = await getSyncJob(id);
  if (!job) return;
  await updateSyncJob(id, {
    attempts: job.attempts + 1,
    nextRetryAt: Date.now() + delayMs,
    status: 'failed'
  });
}

export async function enqueueJob(dedupKey: string, payload: any): Promise<SyncJob> {
  const existing = await getSyncJobByDedupKey(dedupKey);
  const pending = existing.find(j => j.status === 'pending' || j.status === 'in_progress');
  if (pending) return pending;

  const id = crypto.randomUUID();
  const job: SyncJob = {
    id,
    dedupKey,
    payload,
    status: 'pending',
    attempts: 0,
    lastAttemptAt: 0,
    nextRetryAt: 0,
    error: null
  };
  await addSyncJob(job);
  return job;
}

// Error Log
export function addErrorLog(entry: ErrorLogEntry): Promise<IDBValidKey> {
  return txPromise(STORE_ERROR_LOG, 'readwrite', (s) => s.put(entry));
}

export function getErrorLogs(limit: number = 50): Promise<ErrorLogEntry[]> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_ERROR_LOG, 'readonly');
        const store = tx.objectStore(STORE_ERROR_LOG);
        const index = store.index('timestamp');
        const results: ErrorLogEntry[] = [];
        const req = index.openCursor(null, 'prev');
        req.onsuccess = () => {
          const cursor = req.result;
          if (cursor && results.length < limit) {
            results.push(cursor.value as ErrorLogEntry);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        req.onerror = () => reject(req.error);
      }),
  );
}

export function clearAllData(): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(
          [STORE_SUBMISSIONS, STORE_SYNC_QUEUE, STORE_ERROR_LOG],
          'readwrite',
        );
        tx.objectStore(STORE_SUBMISSIONS).clear();
        tx.objectStore(STORE_SYNC_QUEUE).clear();
        tx.objectStore(STORE_ERROR_LOG).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      }),
  );
}
