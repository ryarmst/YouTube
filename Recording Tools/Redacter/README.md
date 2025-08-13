# Redact Browser Extension

A Firefox extension that helps you redact sensitive information while recording videos. It replaces words you specify with `<redacted>` text on any webpage.

WARNING: code was largely LLM generated. Use at own risk.

## What it does

- Replaces sensitive words with `<redacted>` on web pages
- Works with both existing content and new content that loads dynamically
- Saves your word list so you don't have to re-enter everything
- Simple on/off toggle

## Installation

### Quick install (for testing)
1. Open Firefox and go to `about:debugging`
2. Click "This Firefox" on the left
3. Click "Load Temporary Add-on"
4. Pick the `manifest.json` file from this folder

### Permanent install
1. Open Firefox and go to `about:addons`
2. Click the gear icon → "Install Add-on From File..."
3. Select the `manifest.json` file
4. Click "Add"

## How to use it

1. Click the extension icon in your toolbar
2. Type a word you want to redact and click "Add Word"
3. Click "Enable Redaction"
4. Go to any webpage - your words will show as `<redacted>`

### Loading words from a file

If you have a list of words in a text file (one word per line):
1. Click "Load from Text File" in the extension
2. Pick your text file
3. The words get added to your list

## Testing

Open `test_page.html` in Firefox after installing the extension to see it in action.