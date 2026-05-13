import type { SerializedSubmission } from './submission';

export type SyncJobStatus = 'pending' | 'in_progress' | 'success' | 'failed' | 'retrying';

export interface SyncJob {
  id: string;
  dedupKey: string;
  payload: SerializedSubmission;
  status: SyncJobStatus;
  attempts: number;
  lastAttemptAt: number;
  nextRetryAt: number;
  error: string | null;
}
