// Background service worker — handles all LLM API calls
// (content scripts can't always call external APIs reliably due to CORS/CSP)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'askAI') {
    handleAIRequest(request.pageContent).then(sendResponse);
    return true;
  }
  if (request.action === 'extractQuestions') {
    handleExtractQuestions(request.pageContent).then(sendResponse);
    return true;
  }
});

async function handleExtractQuestions(pageContent) {
  const { provider, model, apiKey } = await chrome.storage.local.get(['provider', 'model', 'apiKey']);

  if (!apiKey) return { error: 'No API key set' };

  const prompt = `Extract only the questions from the following page content.
List them clearly and numbered, including all answer options (A, B, C, D etc.) exactly as they appear.
Do NOT include any answers or explanations — questions and options only.

Format:
Q1: [question text]
A) ...
B) ...
C) ...
D) ...

Q2: [question text]
A) ...
...

PAGE CONTENT:
${pageContent}`;

  try {
    let result;
    if (provider === 'claude') result = await callClaude(apiKey, prompt, model);
    else if (provider === 'openai') result = await callOpenAI(apiKey, prompt, model);
    else if (provider === 'gemini') result = await callGemini(apiKey, prompt, model);
    else if (provider === 'groq')   result = await callGroq(apiKey, prompt, model);
    else return { error: 'Unknown provider' };

    if (result.error) return { error: result.error };
    return { questions: result.answer };
  } catch (err) {
    return { error: err.message };
  }
}

async function handleAIRequest(pageContent) {
  const { provider, model, apiKey } = await chrome.storage.local.get(['provider', 'model', 'apiKey']);

  if (!apiKey) return { error: 'No API key set' };

  const prompt = `You are a helpful educational tutor. The following is the text content of a webpage that contains questions (likely multiple choice).

Your task:
1. Identify every question on the page
2. For each, state the answer clearly
3. Briefly explain WHY it's correct (1-2 sentences) so the student learns

Format each answer like this:
Q1: [question summary]
Answer: [letter/option] - [the answer text]
Why: [short explanation]

---

PAGE CONTENT:
${pageContent}`;

  try {
    if (provider === 'claude') return await callClaude(apiKey, prompt, model);
    if (provider === 'openai') return await callOpenAI(apiKey, prompt, model);
    if (provider === 'gemini') return await callGemini(apiKey, prompt, model);
    if (provider === 'groq')   return await callGroq(apiKey, prompt, model);
    return { error: 'Unknown provider' };
  } catch (err) {
    return { error: err.message };
  }
}

async function callClaude(apiKey, prompt, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: model || 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (data.error) return { error: data.error.message };
  return { answer: data.content[0].text };
}

async function callOpenAI(apiKey, prompt, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    })
  });
  const data = await res.json();
  if (data.error) return { error: data.error.message };
  return { answer: data.choices[0].message.content };
}

async function callGroq(apiKey, prompt, model) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: model || 'gemma2-9b-it',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500
    })
  });
  const data = await res.json();
  if (data.error) return { error: data.error.message };
  return { answer: data.choices[0].message.content };
}

async function callGemini(apiKey, prompt, model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash'}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  if (data.error) return { error: data.error.message };
  return { answer: data.candidates[0].content.parts[0].text };
}
