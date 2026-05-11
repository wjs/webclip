// Background service worker for WebClip extension

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  // Try to send message to already-loaded content script first
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SHOW_OVERLAY' });
    if (response?.ok) return; // content script already loaded, overlay shown
  } catch {
    // Content script not loaded yet — inject it
  }

  // First-time: inject content script (CSS is handled by the content script itself)
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['assets/content.js'],
    });
    // The content script mounts immediately on load
  } catch (err) {
    console.error('WebClip: Failed to inject content script', err);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'REQUEST_SCREENSHOT') {
    chrome.tabs.captureVisibleTab(undefined as unknown as number, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true;
  }
});