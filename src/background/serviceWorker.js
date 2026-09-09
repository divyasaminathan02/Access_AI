/**
 * AccessAI - Background Service Worker (Manifest V3)
 */

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open Onboarding Reading Assessment on initial install
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
    sendResponse({ status: 'ok' });
  }
  return true;
});
