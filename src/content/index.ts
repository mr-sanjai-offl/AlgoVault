import { startObserver } from './observer';

// Content script entry point — runs in ISOLATED world on LeetCode pages
if (window.location.hostname.includes('leetcode.com')) {
  // Defensive check for extension context invalidation
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver);
    } else {
      startObserver();
    }
  }
}
