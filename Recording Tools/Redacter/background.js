// Background script for the Redact Extension

// Handle extension installation
browser.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    // Set default values on first install
    browser.storage.local.set({
      redactionEnabled: false,
      redactionWords: []
    });
  }
});

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Handle any background-level messages here if needed
  return true;
});

// Handle tab updates to ensure content script is properly initialized
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Check if redaction is enabled and send the current state to the content script
    browser.storage.local.get(['redactionEnabled', 'redactionWords']).then(function(result) {
      if (result.redactionEnabled) {
        browser.tabs.sendMessage(tabId, {
          action: 'enableRedaction',
          words: result.redactionWords || []
        }).catch(function(error) {
          // Content script might not be ready yet, which is fine
          console.log('Content script not ready yet:', error);
        });
      }
    });
  }
}); 