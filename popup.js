const MODELS = {
  claude: [
    // Claude 4 family
    { id: 'claude-opus-4-5',     label: 'Claude Opus 4.5' },
    { id: 'claude-sonnet-4-5',   label: 'Claude Sonnet 4.5' },
    { id: 'claude-haiku-4-5',    label: 'Claude Haiku 4.5' },
    // Claude 3.7 family
    { id: 'claude-sonnet-3-7',   label: 'Claude Sonnet 3.7' },
    // Claude 3.5 family
    { id: 'claude-opus-3-5',     label: 'Claude Opus 3.5' },
    { id: 'claude-sonnet-3-5',   label: 'Claude Sonnet 3.5' },
    { id: 'claude-haiku-3-5',    label: 'Claude Haiku 3.5' },
  ],
  openai: [
    // o-series (reasoning)
    { id: 'o3',                  label: 'o3' },
    { id: 'o3-mini',             label: 'o3 Mini' },
    { id: 'o1',                  label: 'o1' },
    { id: 'o1-mini',             label: 'o1 Mini' },
    // GPT-4o family
    { id: 'gpt-4o',              label: 'GPT-4o' },
    { id: 'gpt-4o-mini',         label: 'GPT-4o Mini' },
    // GPT-4 family
    { id: 'gpt-4-turbo',         label: 'GPT-4 Turbo' },
    { id: 'gpt-4',               label: 'GPT-4' },
    // GPT-3.5 family
    { id: 'gpt-3.5-turbo',       label: 'GPT-3.5 Turbo' },
  ],
  gemini: [
    // Gemini 2.5 family
    { id: 'gemini-2.5-pro',           label: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash',         label: 'Gemini 2.5 Flash' },
    // Gemini 2.0 family
    { id: 'gemini-2.0-flash',         label: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite',    label: 'Gemini 2.0 Flash Lite' },
    // Gemini 1.5 family
    { id: 'gemini-1.5-pro',           label: 'Gemini 1.5 Pro' },
    { id: 'gemini-1.5-flash',         label: 'Gemini 1.5 Flash' },
    // Gemma family (free via AI Studio)
    { id: 'gemma-4-it',               label: 'Gemma 4 (Free)' },
    { id: 'gemma-3-27b-it',           label: 'Gemma 3 27B (Free)' },
    { id: 'gemma-3-12b-it',           label: 'Gemma 3 12B (Free)' },
    { id: 'gemma-3-4b-it',            label: 'Gemma 3 4B (Free)' },
  ],
  groq: [
    // Llama family
    { id: 'llama-3.3-70b-versatile',        label: 'Llama 3.3 70B (Free)' },
    { id: 'llama-3.1-70b-versatile',        label: 'Llama 3.1 70B (Free)' },
    { id: 'llama-3.1-8b-instant',           label: 'Llama 3.1 8B (Free)' },
    // Gemma family
    { id: 'gemma2-9b-it',                   label: 'Gemma 2 9B (Free)' },
    // Mixtral family
    { id: 'mixtral-8x7b-32768',             label: 'Mixtral 8x7B (Free)' },
    // DeepSeek family
    { id: 'deepseek-r1-distill-llama-70b',  label: 'DeepSeek R1 70B (Free)' },
    // Qwen family
    { id: 'qwen-qwq-32b',                   label: 'Qwen QwQ 32B (Free)' },
  ],
};

const API_KEY_URLS = {
  claude: 'https://console.anthropic.com/settings/keys',
  openai: 'https://platform.openai.com/api-keys',
  gemini: 'https://aistudio.google.com/apikey',
  groq:   'https://console.groq.com/keys',
};

function updateApiKeyLink(provider) {
  const link = document.getElementById('getApiKeyLink');
  link.href = API_KEY_URLS[provider] || '#';
}

function populateModelDropdown(provider, selectedModel) {
  const modelSelect = document.getElementById('modelSelect');
  modelSelect.innerHTML = '';
  for (const m of MODELS[provider] || []) {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label;
    if (m.id === selectedModel) opt.selected = true;
    modelSelect.appendChild(opt);
  }
}

// Load saved settings when popup opens
document.addEventListener('DOMContentLoaded', async () => {
  const { provider, model, apiKey } = await chrome.storage.local.get(['provider', 'model', 'apiKey']);
  const savedProvider = provider || 'claude';
  document.getElementById('providerSelect').value = savedProvider;
  populateModelDropdown(savedProvider, model);
  updateApiKeyLink(savedProvider);
  if (apiKey) document.getElementById('apiKey').value = apiKey;
});

document.getElementById('providerSelect').addEventListener('change', () => {
  const provider = document.getElementById('providerSelect').value;
  populateModelDropdown(provider, null);
  updateApiKeyLink(provider);
});

// Save settings
document.getElementById('saveBtn').addEventListener('click', async () => {
  const provider = document.getElementById('providerSelect').value;
  const model = document.getElementById('modelSelect').value;
  const apiKey = document.getElementById('apiKey').value.trim();

  if (!apiKey) {
    showStatus('Please enter an API key', 'error');
    return;
  }

  await chrome.storage.local.set({ provider, model, apiKey });
  showStatus('Settings saved!', 'success');
});

// Scan questions button
document.getElementById('copyQuestionsBtn').addEventListener('click', async () => {
  const { apiKey } = await chrome.storage.local.get(['apiKey']);
  if (!apiKey) {
    showStatus('Please save your API key first', 'error');
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const btn = document.getElementById('copyQuestionsBtn');

  btn.disabled = true;
  btn.textContent = '⏳ Scanning...';
  showStatus('Scanning all questions on page...', 'success');

  try {
    const result = await chrome.tabs.sendMessage(tab.id, { action: 'copyQuestions' });
    if (result && result.error) {
      showStatus('Error: ' + result.error, 'error');
    } else {
      showStatus('Questions panel opened on page.', 'success');
      setTimeout(() => window.close(), 1200);
    }
  } catch (err) {
    showStatus('Could not reach page. Reload the page first, then try again.', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '📋 Scan Questions from Page';
  }
});

function showStatus(msg, type) {
  const status = document.getElementById('status');
  status.textContent = msg;
  status.className = 'status ' + type;
  if (type !== 'error') {
    setTimeout(() => { status.className = 'status'; }, 3000);
  }
}
