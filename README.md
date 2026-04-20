# AI Quiz Helper

> A Chrome extension that scans web pages for multiple-choice questions and answers them using AI — built for self-study and educational purposes only.

**License:** MIT · **Purpose:** Education only

---

## About

AI Quiz Helper is an open-source Chrome extension designed to help students learn and review course material. It extracts multiple-choice questions from any web page, lets you review them, and uses your chosen AI model to provide answers with explanations — so you understand *why* an answer is correct, not just what it is.

This project is intended strictly for personal study, practice quizzes, and educational use. It is not intended to facilitate academic dishonesty on graded assessments.

---

## Features

- **Scan Questions** — extracts all questions and answer options from any page
- **Review Panel** — shows extracted questions so you can verify before proceeding
- **Get AI Answers** — sends the extracted questions to your chosen AI model and displays answers with explanations
- **Copy All** — copies the extracted questions to your clipboard in a clean, numbered format
- **Multi-provider support** — switch between Claude, ChatGPT, Gemini, and Groq with per-provider model selection
- **Get API Key link** — one-click link to each provider's key page, updates per provider
- **Error display** — API errors are shown directly in the popup so you can read and copy them

---

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. The 🎓 icon will appear in your Chrome toolbar

To apply any code changes, click the **refresh icon** on the extension card in `chrome://extensions/`.

---

## Setup

1. Click the 🎓 toolbar icon to open the popup
2. Choose an **AI Provider** and **Model**
3. Click **Get API Key →** to open the provider's console and create a key
4. Paste the key into the **API Key** field
5. Click **Save Settings**

### Getting a free API key

| Provider | Free tier | Console |
|---|---|---|
| **Groq** | Yes — no credit card needed | [console.groq.com/keys](https://console.groq.com/keys) |
| **Gemini** | Yes — rate-limited, no billing needed | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **Claude** | Paid — requires Anthropic credits | [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) |
| **ChatGPT** | Paid — separate from ChatGPT Plus | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

> **Recommended for free testing:** Select **Groq** as the provider and **Llama 3.3 70B** or **Gemma 2 9B** as the model.

---

## Usage

### Scan questions and get AI answers

1. Navigate to any page with multiple-choice questions
2. Click the 🎓 icon → **Scan Questions from Page**
3. A **Questions panel** appears on the page showing all extracted questions
4. Review the list to confirm all questions were captured
5. Click **🤖 Get AI Answers** at the bottom of the panel
6. An **Answers panel** appears with each answer and a short explanation

### Copy questions to clipboard

1. Follow steps 1–4 above
2. Click **Copy All** in the Questions panel header
3. Paste anywhere — questions are formatted as:

```
Q1: What is the capital of France?
A) London
B) Paris
C) Berlin
D) Rome

Q2: ...
```

---

## Available Models

### Claude — Anthropic
API key: [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) · Paid

| Family | Model ID | Notes |
|---|---|---|
| **Claude 4** | `claude-opus-4-5` | Most capable |
| | `claude-sonnet-4-5` | Balanced speed & quality |
| | `claude-haiku-4-5` | Fastest, lowest cost |
| **Claude 3.7** | `claude-sonnet-3-7` | Extended thinking |
| **Claude 3.5** | `claude-opus-3-5` | Previous gen, high quality |
| | `claude-sonnet-3-5` | Widely used, balanced |
| | `claude-haiku-3-5` | Previous gen, fast |

### ChatGPT — OpenAI
API key: [platform.openai.com/api-keys](https://platform.openai.com/api-keys) · Paid (separate from ChatGPT Plus)

| Family | Model ID | Notes |
|---|---|---|
| **o3 (reasoning)** | `o3` | Most powerful reasoning |
| | `o3-mini` | Fast reasoning |
| **o1 (reasoning)** | `o1` | Advanced reasoning |
| | `o1-mini` | Lightweight reasoning |
| **GPT-4o** | `gpt-4o` | Multimodal, fast |
| | `gpt-4o-mini` | Cheapest GPT-4 class |
| **GPT-4** | `gpt-4-turbo` | Fast GPT-4 |
| | `gpt-4` | Original GPT-4 |
| **GPT-3.5** | `gpt-3.5-turbo` | Budget option |

### Gemini — Google
API key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey) · Free tier available

| Family | Model ID | Notes |
|---|---|---|
| **Gemini 2.5** | `gemini-2.5-pro` | Most capable Gemini |
| | `gemini-2.5-flash` | Fast, efficient |
| **Gemini 2.0** | `gemini-2.0-flash` | Fast, free tier |
| | `gemini-2.0-flash-lite` | Lightest, free tier |
| **Gemini 1.5** | `gemini-1.5-pro` | Large context window |
| | `gemini-1.5-flash` | Previous gen, fast |
| **Gemma (open)** | `gemma-4-it` | Google open model, free |
| | `gemma-3-27b-it` | Large open model, free |
| | `gemma-3-12b-it` | Medium open model, free |
| | `gemma-3-4b-it` | Small open model, free |

### Groq — Groq Cloud
API key: [console.groq.com/keys](https://console.groq.com/keys) · **Completely free** (no credit card)

| Family | Model ID | Notes |
|---|---|---|
| **Llama (Meta)** | `llama-3.3-70b-versatile` | Best quality on Groq |
| | `llama-3.1-70b-versatile` | High quality |
| | `llama-3.1-8b-instant` | Fastest response |
| **Gemma (Google)** | `gemma2-9b-it` | Efficient, accurate |
| **Mixtral (Mistral)** | `mixtral-8x7b-32768` | Long context (32k) |
| **DeepSeek** | `deepseek-r1-distill-llama-70b` | Strong reasoning |
| **Qwen (Alibaba)** | `qwen-qwq-32b` | Strong reasoning |

---

## Project Structure

```
my-quiz-helper/
├── manifest.json       # Chrome extension config (Manifest V3)
├── background.js       # Service worker — handles all AI API calls
├── content.js          # Injected into pages — extracts questions, shows panels
├── content.css         # Styles for the questions and answers panels
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic — settings, model selection
├── popup.css           # Popup styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Troubleshooting

**"Reload the page first, then try again"**
The content script hasn't loaded on the current tab. Refresh the page and try again.

**"Quota exceeded" / API errors**
Your API key has hit its usage limit. Check your billing/quota on the provider's dashboard. Switch to Groq for free usage.

**Questions are missing or incomplete**
The page may load questions dynamically. Scroll through the entire page first so all content is rendered, then scan.

**Gemini model not found error**
The model ID may have changed. Check [aistudio.google.com/models](https://aistudio.google.com/models) for the current model ID and update it in `popup.js`.

---

## Privacy

- Your API key is stored only in Chrome's local storage on your device and is never transmitted anywhere except directly to the selected AI provider's API.
- Page content is sent to the selected AI provider to generate answers. Do not use this extension on pages containing sensitive or confidential information.

---

## License

MIT License — see [LICENSE](./LICENSE) for full text.

This project is provided for **educational purposes only**. Users are solely responsible for ensuring their use complies with the terms of service of any platform they use this extension on, as well as any applicable academic integrity policies.
