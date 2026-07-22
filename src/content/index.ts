import { startObserver } from './observer';
import { startCodeforcesObserver } from './codeforces';

// Content script entry point — runs in ISOLATED world
if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
  const init = () => {
    if (window.location.hostname.includes('leetcode.com')) {
      startObserver();
    } else if (window.location.hostname.includes('codeforces.com')) {
      startCodeforcesObserver();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
