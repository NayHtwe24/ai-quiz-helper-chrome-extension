# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Chrome browser extension (Manifest V3) that scans web pages for multiple-choice quiz questions and answers them using AI. Supports Claude (Anthropic), GPT-4o-mini (OpenAI), and Gemini 1.5 Flash (Google).

## Development

No build pipeline, package manager, or test framework — this is plain vanilla JavaScript loaded directly as a Chrome extension.

**To load the extension in Chrome:**
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

**To reload after changes:** Click the refresh icon on the extension card in `chrome://extensions/`.

## Architecture

Three-layer messaging architecture:

```
popup.html/popup.js  →  content.js  →  background.js  →  LLM APIs
   (user settings)      (page DOM)     (service worker)
```

- **`popup.js`** — saves API key and model choice to `chrome.storage.local`, sends `scanPage` message to the active tab's content script
- **`content.js`** — extracts page text (strips scripts/styles, truncates to 8000 chars), sends `askAI` message to background, renders the answer panel and toast notifications into the page DOM
- **`background.js`** — receives `askAI`, routes to `callClaude()` / `callOpenAI()` / `callGemini()`, returns structured answer text

All cross-origin API calls must go through `background.js` (service worker) to bypass CORS/CSP restrictions on the host page.

## Key Implementation Details

- API keys live in `chrome.storage.local` (not `chrome.storage.sync`) — not encrypted
- Answer panel injected at z-index 999999; styles scoped in `content.css`
- Claude uses model `claude-sonnet-4-5`; OpenAI uses `gpt-4o-mini`; Gemini uses `gemini-1.5-flash`
- Max tokens: 1500 for Claude and OpenAI; no explicit limit set for Gemini
- The LLM prompt asks for: every question identified, the correct answer letter/option, and a 1–2 sentence explanation
