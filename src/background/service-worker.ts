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
import { cleanExpiredKeys } from './storage/configStore';
import type { ExtensionMessage } from '@shared/types/messages';

// Register message listener
chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, sender, sendResponse) => {
    handleMessage(message, sender, sendResponse);
    return true; // Keep channel open for async response
  },
);

// Register alarm listener — queue processing only
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.PROCESS_QUEUE) {
    await cleanExpiredKeys(RETRY.PROCESSED_KEYS_TTL_MS);
    await processQueue();
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.alarms.create(ALARM_NAMES.PROCESS_QUEUE, { periodInMinutes: 5 });
});

