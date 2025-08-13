// Content script for redacting sensitive information
let redactionEnabled = false;
let redactionWords = [];
let observer = null;

// Listen for messages from popup
browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'enableRedaction') {
    redactionEnabled = true;
    redactionWords = message.words || [];
    startRedaction();
  } else if (message.action === 'disableRedaction') {
    redactionEnabled = false;
    stopRedaction();
  }
});

// Load saved state on page load
browser.storage.local.get(['redactionEnabled', 'redactionWords']).then(function(result) {
  redactionEnabled = result.redactionEnabled || false;
  redactionWords = result.redactionWords || [];
  if (redactionEnabled) {
    startRedaction();
  }
});

function startRedaction() {
  if (observer) {
    observer.disconnect();
  }
  
  // Redact existing content
  redactPageContent();
  
  // Set up observer for dynamic content
  observer = new MutationObserver(function(mutations) {
    if (redactionEnabled) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.TEXT_NODE) {
              redactTextNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              redactElement(node);
            }
          });
        } else if (mutation.type === 'characterData') {
          redactTextNode(mutation.target);
        }
      });
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
}

function stopRedaction() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

function redactPageContent() {
  redactElement(document.body);
}

function redactElement(element) {
  if (!element || !redactionEnabled || redactionWords.length === 0) {
    return;
  }
  
  // Skip certain elements that shouldn't be redacted
  if (element.tagName === 'SCRIPT' || 
      element.tagName === 'STYLE' || 
      element.tagName === 'NOSCRIPT' ||
      element.contentEditable === 'true') {
    return;
  }
  
  // Process text nodes
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script and style content
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  textNodes.forEach(redactTextNode);
}

function redactTextNode(textNode) {
  if (!textNode || !textNode.textContent || !redactionEnabled || redactionWords.length === 0) {
    return;
  }
  
  let text = textNode.textContent;
  let originalText = text;
  
  // Create case-insensitive regex patterns for each word
  redactionWords.forEach(word => {
    if (word.trim()) {
      const regex = new RegExp('\\b' + escapeRegExp(word) + '\\b', 'gi');
      text = text.replace(regex, '<redacted>');
    }
  });
  
  // Only update if text changed
  if (text !== originalText) {
    textNode.textContent = text;
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Handle page load completion
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    if (redactionEnabled) {
      startRedaction();
    }
  });
} else {
  if (redactionEnabled) {
    startRedaction();
  }
} 