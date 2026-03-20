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

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
