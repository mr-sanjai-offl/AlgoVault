export interface UserConfig {
  repoFullName: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  autoSync: boolean;
  notifications: boolean;
  theme: 'light' | 'dark';
  codeforcesHandle?: string;
}

export interface AuthState {
  username: string;
  avatarUrl: string;
}

export const DEFAULT_CONFIG: UserConfig = {
  repoFullName: '',
  repoOwner: '',
  repoName: '',
  branch: 'main',
  autoSync: true,
  notifications: true,
  theme: 'dark',
  codeforcesHandle: '',
};
