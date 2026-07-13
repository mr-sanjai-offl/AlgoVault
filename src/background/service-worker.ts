// Polyfill window and document for Vite dynamic imports in Service Worker
if (typeof self !== 'undefined' && typeof (self as any).window === 'undefined') {
  (self as any).window = self;
  (self as any).document = {
    getElementsByTagName: () => [],
    querySelector: () => null,
    createElement: () => ({}),
  };
}

import { ALARM_NAMES, RETRY } from '@shared/constants';
import { handleMessage, processQueue } from './messageHandler';
import { pollForToken } from './auth/deviceFlow';
import { cleanExpiredKeys } from './storage/configStore';
import { MessageType } from '@shared/types/messages';
import type { ExtensionMessage } from '@shared/types/messages';

// Register message listener
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true; // Keep channel open for async response
  },
);

// Register alarm listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.PROCESS_QUEUE) {
    await cleanExpiredKeys(RETRY.PROCESSED_KEYS_TTL_MS);
    await processQueue();
  }

  if (alarm.name === ALARM_NAMES.DEVICE_FLOW_POLL) {
    try {
      const result = await pollForToken();
      if (result.complete && result.username) {
        chrome.runtime.sendMessage({
          type: MessageType.AUTH_COMPLETE,
          payload: { username: result.username, avatarUrl: result.avatarUrl ?? '' },
        }).catch(() => {});
      }
    } catch (error) {
      chrome.runtime.sendMessage({
        type: MessageType.AUTH_FAILED,
        payload: { error: String(error) },
      }).catch(() => {});
    }
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_NAMES.PROCESS_QUEUE, { periodInMinutes: 5 });
});

