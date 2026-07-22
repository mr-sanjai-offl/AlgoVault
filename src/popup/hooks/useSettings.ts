import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import type { ConfigPayload, RepoInfo } from '@shared/types/messages';

export function useSettings() {
  const [config, setConfig] = useState<ConfigPayload | null>(null);
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_CONFIG,
      }) as { payload: ConfigPayload } | undefined;
      if (response?.payload) {
        setConfig(response.payload);
      }
    } catch {
      // Config unavailable
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRepos = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_REPOS,
      }) as { payload: { repos: RepoInfo[] } } | undefined;
      if (response?.payload) {
        setRepos(response.payload.repos);
      }
    } catch {
      // Repos unavailable
    }
  }, []);

  useEffect(() => {
    fetchConfig();
    fetchRepos();
  }, [fetchConfig, fetchRepos]);

  const updateConfig = useCallback(async (updates: Partial<ConfigPayload>) => {
    setIsSaving(true);
    try {
      await chrome.runtime.sendMessage({
        type: MessageType.SET_CONFIG,
        payload: updates,
      });
      await fetchConfig();
    } finally {
      setIsSaving(false);
    }
  }, [fetchConfig]);

  const exportData = useCallback(async () => {
    const response = await chrome.runtime.sendMessage({
      type: MessageType.EXPORT_DATA,
    }) as { payload: Record<string, unknown> } | undefined;
    if (response?.payload) {
      const blob = new Blob([JSON.stringify(response.payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algovault-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const clearData = useCallback(async () => {
    await chrome.runtime.sendMessage({ type: MessageType.CLEAR_DATA });
    await fetchConfig();
  }, [fetchConfig]);

  const triggerBulkSync = useCallback(async (platformId: string) => {
    await chrome.runtime.sendMessage({
      type: MessageType.START_BULK_SYNC,
      payload: { platformId }
    });
  }, []);

  const createRepo = useCallback(async (name: string, isPrivate: boolean) => {
    setIsSaving(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.CREATE_REPO,
        payload: { name, isPrivate }
      }) as { success?: boolean, error?: string };
      
      if (response?.error) {
        throw new Error(response.error);
      }
      
      await fetchRepos();
      await fetchConfig();
    } finally {
      setIsSaving(false);
    }
  }, [fetchRepos, fetchConfig]);

  return {
    config,
    repos,
    isLoading,
    isSaving,
    updateConfig,
    exportData,
    clearData,
    fetchRepos,
    triggerBulkSync,
    createRepo,
  };
}
