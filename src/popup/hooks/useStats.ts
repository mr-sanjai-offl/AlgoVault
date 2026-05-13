import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import type { StatsPayload } from '@shared/types/messages';

export function useStats() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_STATS,
      }) as { payload: StatsPayload } | undefined;
      if (response?.payload) {
        setStats(response.payload);
      }
    } catch {
      // Stats unavailable
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    const listener = (message: { type: MessageType; payload?: unknown }) => {
      if (message.type === MessageType.STATS_UPDATED) {
        setStats(message.payload as StatsPayload);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [fetchStats]);

  return { stats, isLoading, refresh: fetchStats };
}
