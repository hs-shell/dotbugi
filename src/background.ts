chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.action === 'getAuthToken') {
    chrome.identity.getAuthToken({ interactive: message.interactive ?? true }, (token) => {
      if (chrome.runtime.lastError || !token) {
        sendResponse({ token: null, error: chrome.runtime.lastError?.message });
      } else {
        sendResponse({ token });
      }
    });
    return true;
  } else if (message.action === 'removeCachedAuthToken') {
    chrome.identity.removeCachedAuthToken({ token: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: 'https://hs-shell.github.io/dotbugi/' });
  } else if (details.reason === 'update' && chrome.runtime.getManifest().version === '5.0.0') {
    chrome.tabs.create({ url: 'https://hs-shell.github.io/dotbugi/' });
  }
});

chrome.action.onClicked.addListener(() => {
  const BASE_URL = 'https://hs-shell.github.io/dotbugi/';
  const LANG_PATHS: Record<string, string> = { en: 'en/', ja: 'ja/', zh: 'zh/' };

  chrome.storage.local.get('language', (result) => {
    const langPath = LANG_PATHS[result.language] ?? '';
    chrome.tabs.create({ url: BASE_URL + langPath });
  });
});
