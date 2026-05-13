import { useState, useEffect, useCallback } from 'react';
import { MessageType } from '@shared/types/messages';
import type { SyncStatusPayload } from '@shared/types/messages';

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusPayload | null>(null);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.type === MessageType.SYNC_STATUS_UPDATE) {
        setSyncStatus(message.payload);
      } else if (message.type === MessageType.SYNC_COMPLETE || message.type === MessageType.SYNC_FAILED) {
        setSyncStatus(null);
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const triggerManualSync = useCallback(async () => {
    // Optimistically set a pending status if we want, or just let background update us
    await chrome.runtime.sendMessage({ type: MessageType.MANUAL_SYNC });
  }, []);

  const isSyncing = syncStatus !== null && 
    ['pending', 'in_progress', 'committing'].includes(syncStatus.status);

  return {
    syncStatus,
    isSyncing,
    triggerManualSync,
  };
}

