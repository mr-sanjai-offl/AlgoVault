import { STORAGE_KEYS } from '@shared/constants';
import type { UserConfig, AuthState } from '@shared/types/config';
import { DEFAULT_CONFIG } from '@shared/types/config';

export async function getUserConfig(): Promise<UserConfig> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.USER_CONFIG);
  const config = stored[STORAGE_KEYS.USER_CONFIG] as Partial<UserConfig> | undefined;
  return { ...DEFAULT_CONFIG, ...config };
}

export async function setUserConfig(updates: Partial<UserConfig>): Promise<UserConfig> {
  const current = await getUserConfig();
  const updated = { ...current, ...updates };
  await chrome.storage.local.set({ [STORAGE_KEYS.USER_CONFIG]: updated });
  return updated;
}

export async function getAuthState(): Promise<AuthState | null> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.AUTH_STATE);
  return (stored[STORAGE_KEYS.AUTH_STATE] as AuthState) ?? null;
}

export async function setAuthState(state: AuthState): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.AUTH_STATE]: state });
}

export async function clearAuthState(): Promise<void> {
  await chrome.storage.local.remove([
    STORAGE_KEYS.AUTH_STATE,
    STORAGE_KEYS.GITHUB_TOKEN,
    STORAGE_KEYS.DEVICE_FLOW_STATE,
  ]);
}

export async function getProcessedKeys(): Promise<Record<string, number>> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.PROCESSED_KEYS);
  return (stored[STORAGE_KEYS.PROCESSED_KEYS] as Record<string, number>) ?? {};
}

export async function addProcessedKey(key: string): Promise<void> {
  const keys = await getProcessedKeys();
  keys[key] = Date.now();
  await chrome.storage.local.set({ [STORAGE_KEYS.PROCESSED_KEYS]: keys });
}

export async function cleanExpiredKeys(ttlMs: number): Promise<void> {
  const keys = await getProcessedKeys();
  const now = Date.now();
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(keys)) {
    if (now - v < ttlMs) {
      cleaned[k] = v;
    }
  }
  await chrome.storage.local.set({ [STORAGE_KEYS.PROCESSED_KEYS]: cleaned });
}

export async function getStatsCache<T>(): Promise<T | null> {
  const stored = await chrome.storage.local.get(STORAGE_KEYS.STATS_CACHE);
  return (stored[STORAGE_KEYS.STATS_CACHE] as T) ?? null;
}

export async function setStatsCache<T>(stats: T): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.STATS_CACHE]: stats });
}

export async function invalidateStatsCache(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEYS.STATS_CACHE);
}
