// Listen for scan command from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanPage') {
    scanAndAnswer().then(sendResponse);
    return true;
  }
  if (request.action === 'copyQuestions') {
    extractAndShowQuestions().then(sendResponse);
    return true;
  }
});

async function scanAndAnswer() {
  showToast('🔍 Extracting page content...');

  const pageText = extractPageText(8000);

  if (!pageText || pageText.length < 20) {
    const msg = 'Could not find enough content on this page';
    showToast('❌ ' + msg, 'error');
    return { error: msg };
  }

  showToast('🤖 Asking the AI...');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'askAI',
      pageContent: pageText
    });

    if (response.error) {
      showToast('❌ ' + response.error, 'error');
      return { error: response.error };
    }

    showAnswerPanel(response.answer);
    return { success: true };
  } catch (err) {
    showToast('❌ Error: ' + err.message, 'error');
    return { error: err.message };
  }
}

async function extractAndShowQuestions() {
  // Use a higher char limit so all questions on the page are captured
  const pageText = extractPageText(30000);

  if (!pageText || pageText.length < 20) {
    return { error: 'Could not find enough content on this page' };
  }

  showToast('🔍 Scanning all questions...');

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'extractQuestions',
      pageContent: pageText
    });

    if (response.error) {
      showToast('❌ ' + response.error, 'error');
      return { error: response.error };
    }

    const toast = document.getElementById('qh-toast');
    if (toast) toast.style.display = 'none';

    showQuestionsPanel(response.questions);
    return { success: true };
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
    return { error: err.message };
  }
}

function copyText(text) {
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

function extractPageText(limit = 8000) {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('script, style, noscript').forEach(el => el.remove());
  let text = clone.innerText || '';
  if (text.length > limit) text = text.slice(0, limit);
  return text;
}

function showToast(msg, type = 'info') {
  let toast = document.getElementById('qh-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'qh-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'qh-toast ' + type;
  toast.style.display = 'block';
  if (type !== 'info') {
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  }
}

function showQuestionsPanel(questions) {
  const existing = document.getElementById('qh-questions-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'qh-questions-panel';
  panel.innerHTML = `
    <div class="qh-header">
      <span>📋 Questions Found</span>
      <div class="qh-header-actions">
        <button id="qh-copy-questions">Copy All</button>
        <button id="qh-close-questions">✕</button>
      </div>
    </div>
    <div class="qh-subheader">Review questions, then get AI answers or copy.</div>
    <div class="qh-body"></div>
    <div class="qh-footer">
      <button id="qh-get-answers">🤖 Get AI Answers</button>
    </div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('.qh-body');
  body.textContent = questions;

  document.getElementById('qh-close-questions').onclick = () => panel.remove();

  const copyBtn = document.getElementById('qh-copy-questions');
  copyBtn.onclick = () => {
    copyText(questions);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy All'; }, 2000);
  };

  const answersBtn = document.getElementById('qh-get-answers');
  answersBtn.onclick = async () => {
    answersBtn.disabled = true;
    answersBtn.textContent = '⏳ Asking AI...';

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'askAI',
        pageContent: questions
      });

      if (response.error) {
        answersBtn.disabled = false;
        answersBtn.textContent = '🤖 Get AI Answers';
        showToast('❌ ' + response.error, 'error');
        return;
      }

      showAnswerPanel(response.answer);
    } catch (err) {
      showToast('❌ ' + err.message, 'error');
    } finally {
      answersBtn.disabled = false;
      answersBtn.textContent = '🤖 Get AI Answers';
    }
  };
}

function showAnswerPanel(answer) {
  const existing = document.getElementById('qh-panel');
  if (existing) existing.remove();

  const panel = document.createElement('div');
  panel.id = 'qh-panel';
  panel.innerHTML = `
    <div class="qh-header">
      <span>🎓 AI Answers</span>
      <div class="qh-header-actions">
        <button id="qh-copy">Copy</button>
        <button id="qh-close">✕</button>
      </div>
    </div>
    <div class="qh-body"></div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('.qh-body');
  body.textContent = answer;

  document.getElementById('qh-close').onclick = () => panel.remove();

  const copyBtn = document.getElementById('qh-copy');
  copyBtn.onclick = () => {
    copyText(answer);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  };

  const toast = document.getElementById('qh-toast');
  if (toast) toast.style.display = 'none';
}
