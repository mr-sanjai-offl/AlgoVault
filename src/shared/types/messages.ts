export enum MessageType {
  SUBMISSION_DETECTED = 'SUBMISSION_DETECTED',
  SYNC_STATUS_UPDATE = 'SYNC_STATUS_UPDATE',
  SYNC_COMPLETE = 'SYNC_COMPLETE',
  SYNC_FAILED = 'SYNC_FAILED',
  STATS_UPDATED = 'STATS_UPDATED',
  AUTH_STATUS_REQUEST = 'AUTH_STATUS_REQUEST',
  AUTH_STATUS_RESPONSE = 'AUTH_STATUS_RESPONSE',
  AUTH_START_WEB_FLOW = 'AUTH_START_WEB_FLOW',
  AUTH_COMPLETE = 'AUTH_COMPLETE',
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  GET_STATS = 'GET_STATS',
  GET_HISTORY = 'GET_HISTORY',
  GET_CONFIG = 'GET_CONFIG',
  SET_CONFIG = 'SET_CONFIG',
  RETRY_JOB = 'RETRY_JOB',
  MANUAL_SYNC = 'MANUAL_SYNC',
  EXPORT_DATA = 'EXPORT_DATA',
  CLEAR_DATA = 'CLEAR_DATA',
  GET_REPOS = 'GET_REPOS',
  SYNC_BY_ID = 'SYNC_BY_ID',
  START_BULK_SYNC = 'START_BULK_SYNC',
}

export interface SubmissionDetectedPayload {
  title: string;
  titleSlug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: string;
  constraints: string;
  tags: string[];
  language: string;
  solutionCode: string;
  runtime: string;
  memory: string;
  url: string;
  timestamp: string;
  platformId?: string;
}

export interface SyncStatusPayload {
  jobId: string;
  status: 'pending' | 'in_progress' | 'committing' | 'success' | 'failed';
  message: string;
  progress?: number;
}



export interface AuthStatusPayload {
  isAuthenticated: boolean;
  username?: string;
  avatarUrl?: string;
}

export interface StatsPayload {
  username?: string;
  total: number;
  easy: number;
  medium: number;
  hard: number;
  currentStreak: number;
  longestStreak: number;
  lastSolved?: {
    title: string;
    date: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  };
  byLanguage: Record<string, number>;
  byTopic: Record<string, number>;
  groupedSubmissions: Record<string, import('./submission').StoredSubmission[]>;
}

export interface HistoryPayload {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  status: 'synced' | 'failed' | 'pending';
  syncedAt: number;
  error?: string;
  githubPath?: string;
}

export interface ConfigPayload {
  repoFullName: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  autoSync: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
  codeforcesHandle?: string;
}

export interface RepoInfo {
  fullName: string;
  name: string;
  owner: string;
  defaultBranch: string;
  private: boolean;
}

export type ExtensionMessage =
  | { type: MessageType.SUBMISSION_DETECTED; payload: SubmissionDetectedPayload }
  | { type: MessageType.SYNC_STATUS_UPDATE; payload: SyncStatusPayload }
  | { type: MessageType.SYNC_COMPLETE; payload: { jobId: string; title: string; githubUrl: string } }
  | { type: MessageType.SYNC_FAILED; payload: { jobId: string; title: string; error: string } }
  | { type: MessageType.STATS_UPDATED; payload: StatsPayload }
  | { type: MessageType.AUTH_STATUS_REQUEST }
  | { type: MessageType.AUTH_STATUS_RESPONSE; payload: AuthStatusPayload }
  | { type: MessageType.AUTH_START_WEB_FLOW }
  | { type: MessageType.AUTH_COMPLETE; payload: { username: string; avatarUrl: string } }
  | { type: MessageType.AUTH_FAILED; payload: { error: string } }
  | { type: MessageType.AUTH_LOGOUT }
  | { type: MessageType.GET_STATS }
  | { type: MessageType.GET_HISTORY; payload: { page: number; pageSize: number; filter: 'all' | 'synced' | 'failed' | 'pending' } }
  | { type: MessageType.GET_CONFIG }
  | { type: MessageType.SET_CONFIG; payload: Partial<ConfigPayload> }
  | { type: MessageType.RETRY_JOB; payload: { jobId: string } }
  | { type: MessageType.MANUAL_SYNC }
  | { type: MessageType.EXPORT_DATA }
  | { type: MessageType.CLEAR_DATA }
  | { type: MessageType.GET_REPOS; payload?: { repos: RepoInfo[] } }
  | { type: MessageType.SYNC_BY_ID; payload: { submissionId: string; platformId?: string; language?: string; runtime?: string; memory?: string; } }
  | { type: MessageType.START_BULK_SYNC; payload: { platformId: string } };
