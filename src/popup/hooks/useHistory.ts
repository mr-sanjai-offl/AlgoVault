import { useState, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import type { HistoryPayload } from '@shared/types/messages';

type FilterType = 'all' | 'synced' | 'failed' | 'pending';

export function useHistory() {
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const fetchHistory = useCallback(async (p: number = page, f: FilterType = filter) => {
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: MessageType.GET_HISTORY,
        payload: { page: p, pageSize, filter: f },
      }) as { payload: HistoryPayload };
      setHistory(response.payload);
    } catch {
      // History unavailable
    } finally {
      setIsLoading(false);
    }
  }, [page, filter]);

  const changeFilter = useCallback((f: FilterType) => {
    setFilter(f);
    setPage(1);
    fetchHistory(1, f);
  }, [fetchHistory]);

  const changePage = useCallback((p: number) => {
    setPage(p);
    fetchHistory(p, filter);
  }, [filter, fetchHistory]);

  const retryJob = useCallback(async (jobId: string) => {
    await chrome.runtime.sendMessage({
      type: MessageType.RETRY_JOB,
      payload: { jobId },
    });
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    filter,
    page,
    pageSize,
    fetchHistory,
    changeFilter,
    changePage,
    retryJob,
  };
}
