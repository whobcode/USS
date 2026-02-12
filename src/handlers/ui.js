/**
 * UI Handler
 *
 * Serves the web user interface
 */

export function getUIHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USS - URL Shortener Service</title>
  <style>
    :root {
      --bg-primary: #0f0f1a;
      --bg-secondary: #1a1a2e;
      --bg-card: #16213e;
      --accent: #4f46e5;
      --accent-hover: #6366f1;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --text-primary: #f1f5f9;
      --text-secondary: #94a3b8;
      --border: #334155;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }

    .logo {
      font-size: 48px;
      font-weight: 800;
      background: linear-gradient(135deg, var(--accent), #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
    }

    .tagline {
      color: var(--text-secondary);
      font-size: 18px;
    }

    .features {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .feature-badge {
      background: var(--bg-card);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }

    .card {
      background: var(--bg-card);
      border-radius: 16px;
      padding: 32px;
      margin-bottom: 24px;
      border: 1px solid var(--border);
    }

    .card-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--text-secondary);
    }

    input[type="text"], input[type="url"] {
      width: 100%;
      padding: 14px 16px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 16px;
      transition: all 0.2s;
    }

    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
    }

    .checkbox-group {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--accent);
    }

    .provider-toggle {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .provider-option {
      cursor: pointer;
    }

    .provider-option input {
      display: none;
    }

    .provider-card {
      display: block;
      padding: 16px;
      background: var(--bg-secondary);
      border: 2px solid var(--border);
      border-radius: 10px;
      transition: all 0.2s;
    }

    .provider-option input:checked + .provider-card {
      border-color: var(--accent);
      background: rgba(79, 70, 229, 0.1);
    }

    .provider-name {
      display: block;
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .provider-desc {
      display: block;
      font-size: 12px;
      color: var(--text-secondary);
    }

    .btn {
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: var(--accent);
      color: white;
    }

    .btn-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background: var(--bg-secondary);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--border);
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }

    .result {
      display: none;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }

    .result.show {
      display: block;
    }

    .short-url-display {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: 10px;
      margin-bottom: 20px;
    }

    .short-url {
      flex: 1;
      font-size: 18px;
      font-weight: 600;
      color: var(--accent);
      word-break: break-all;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .meta-item {
      background: var(--bg-secondary);
      padding: 16px;
      border-radius: 10px;
    }

    .meta-label {
      font-size: 12px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 16px;
      font-weight: 500;
    }

    .safety-score {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-bar {
      flex: 1;
      height: 8px;
      background: var(--bg-primary);
      border-radius: 4px;
      overflow: hidden;
    }

    .score-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .score-fill.safe { background: var(--success); }
    .score-fill.warning { background: var(--warning); }
    .score-fill.danger { background: var(--danger); }

    .qr-container {
      text-align: center;
      padding: 20px;
      background: white;
      border-radius: 12px;
      display: inline-block;
    }

    .flags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }

    .flag {
      background: var(--danger);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      text-transform: uppercase;
    }

    .preview-card {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 10px;
      margin-top: 16px;
    }

    .preview-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .preview-summary {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .suggestions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .suggestion {
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 6px 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion:hover {
      border-color: var(--accent);
      color: var(--accent);
    }

    .loading {
      display: none;
      text-align: center;
      padding: 20px;
    }

    .loading.show {
      display: block;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--danger);
      color: var(--danger);
      padding: 16px;
      border-radius: 10px;
      margin-top: 16px;
      display: none;
    }

    .error.show {
      display: block;
    }

    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }

    .tab {
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.2s;
    }

    .tab:hover {
      color: var(--text-primary);
      background: var(--bg-secondary);
    }

    .tab.active {
      background: var(--accent);
      color: white;
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .analytics-input {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .analytics-input input {
      flex: 1;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: var(--bg-secondary);
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--accent);
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: 4px;
    }

    footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 14px;
    }

    footer a {
      color: var(--accent);
      text-decoration: none;
    }

    footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 600px) {
      .container { padding: 20px; }
      .card { padding: 20px; }
      .logo { font-size: 36px; }
      .stats-grid { grid-template-columns: 1fr; }
      .checkbox-group { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">USS</div>
      <p class="tagline">URL Shortener Service with AI-Powered Intelligence</p>
      <div class="features">
        <span class="feature-badge">AI Categorization</span>
        <span class="feature-badge">Phishing Detection</span>
        <span class="feature-badge">Page Previews</span>
        <span class="feature-badge">QR Codes</span>
        <span class="feature-badge">Analytics</span>
      </div>
    </header>

    <div class="tabs">
      <div class="tab active" data-tab="shorten">Shorten URL</div>
      <div class="tab" data-tab="analytics">Analytics</div>
      <div class="tab" data-tab="tools">Tools</div>
    </div>

    <div id="shorten-tab" class="tab-content active">
      <div class="card">
        <h2 class="card-title">Shorten a URL</h2>
        <form id="shorten-form">
          <div class="form-group">
            <label for="url">Enter your long URL</label>
            <input type="url" id="url" name="url" placeholder="https://example.com/very/long/url/that/needs/shortening" required>
          </div>
          <div class="form-group">
            <label>Provider</label>
            <div class="provider-toggle">
              <label class="provider-option">
                <input type="radio" name="provider" value="uss" checked>
                <span class="provider-card">
                  <span class="provider-name">USS</span>
                  <span class="provider-desc">AI-powered with analytics, safety checks, QR codes</span>
                </span>
              </label>
              <label class="provider-option">
                <input type="radio" name="provider" value="tinyurl">
                <span class="provider-card">
                  <span class="provider-name">TinyURL</span>
                  <span class="provider-desc">Simple & fast, no tracking or AI features</span>
                </span>
              </label>
            </div>
          </div>
          <div id="uss-options">
            <div class="form-group">
              <label for="alias">Custom alias (optional)</label>
              <input type="text" id="alias" name="alias" placeholder="my-custom-link" pattern="[a-zA-Z0-9_-]+">
            </div>
            <div class="form-group">
              <label>Options</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" id="generatePreview" checked>
                  Generate page preview
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" id="suggestAliases">
                  Suggest smart aliases
                </label>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" id="submit-btn">Shorten URL</button>
        </form>

        <div class="loading" id="loading">
          <div class="spinner"></div>
          <p>Analyzing URL with AI...</p>
        </div>

        <div class="error" id="error"></div>

        <div class="result" id="result">
          <h3 class="card-title">Your shortened URL</h3>
          <div class="short-url-display">
            <span class="short-url" id="short-url"></span>
            <button class="btn btn-secondary btn-sm" id="copy-btn">Copy</button>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Category</div>
              <div class="meta-value" id="category">-</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Safety Score</div>
              <div class="safety-score">
                <span id="safety-score">-</span>
                <div class="score-bar">
                  <div class="score-fill" id="score-fill"></div>
                </div>
              </div>
              <div class="flags" id="safety-flags"></div>
            </div>
          </div>

          <div id="preview-section" style="display: none;">
            <h4 style="margin-bottom: 12px; color: var(--text-secondary);">Page Preview</h4>
            <div class="preview-card">
              <div class="preview-title" id="preview-title"></div>
              <div class="preview-summary" id="preview-summary"></div>
            </div>
          </div>

          <div id="suggestions-section" style="display: none; margin-top: 20px;">
            <h4 style="margin-bottom: 12px; color: var(--text-secondary);">Suggested Aliases</h4>
            <div class="suggestions" id="suggestions"></div>
          </div>

          <div style="margin-top: 24px; text-align: center;">
            <h4 style="margin-bottom: 12px; color: var(--text-secondary);">QR Code</h4>
            <div class="qr-container" id="qr-container"></div>
          </div>
        </div>
      </div>
    </div>

    <div id="analytics-tab" class="tab-content">
      <div class="card">
        <h2 class="card-title">URL Analytics</h2>
        <div class="analytics-input">
          <input type="text" id="analytics-code" placeholder="Enter short code (e.g., abc123)">
          <button class="btn btn-primary" id="analytics-btn">View Analytics</button>
        </div>

        <div class="loading" id="analytics-loading">
          <div class="spinner"></div>
          <p>Loading analytics...</p>
        </div>

        <div class="error" id="analytics-error"></div>

        <div id="analytics-result" style="display: none;">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value" id="total-clicks">0</div>
              <div class="stat-label">Total Clicks</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="analytics-category">-</div>
              <div class="stat-label">Category</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" id="analytics-safety">-</div>
              <div class="stat-label">Safety Score</div>
            </div>
          </div>

          <div class="meta-item" style="margin-bottom: 16px;">
            <div class="meta-label">Original URL</div>
            <div class="meta-value" id="analytics-url" style="word-break: break-all;"></div>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Created</div>
              <div class="meta-value" id="created-at">-</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Last Clicked</div>
              <div class="meta-value" id="last-clicked">-</div>
            </div>
          </div>

          <h4 style="margin: 24px 0 12px; color: var(--text-secondary);">Clicks by Country</h4>
          <div id="country-stats" class="meta-item"></div>

          <h4 style="margin: 24px 0 12px; color: var(--text-secondary);">Recent Clicks</h4>
          <div id="recent-clicks"></div>
        </div>
      </div>
    </div>

    <div id="tools-tab" class="tab-content">
      <div class="card">
        <h2 class="card-title">Utility Tools</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px;">Inspired by <a href="https://github.com/whobcode/Python-Scripts" target="_blank" style="color: var(--accent);">Python-Scripts</a> repository</p>

        <div class="tool-section">
          <h3 style="margin-bottom: 16px;">Password Strength Checker</h3>
          <div class="form-group">
            <input type="password" id="password-input" placeholder="Enter password to check" style="width: 100%;">
          </div>
          <button class="btn btn-primary btn-sm" id="check-password-btn">Check Strength</button>
          <div id="password-result" style="margin-top: 16px; display: none;">
            <div class="meta-item">
              <div class="meta-label">Strength</div>
              <div class="meta-value" id="password-strength">-</div>
              <div class="score-bar" style="margin-top: 8px;">
                <div class="score-fill" id="password-score-fill"></div>
              </div>
              <div id="password-feedback" style="margin-top: 12px; font-size: 14px; color: var(--text-secondary);"></div>
            </div>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border); margin: 24px 0;">

        <div class="tool-section">
          <h3 style="margin-bottom: 16px;">Caesar Cipher</h3>
          <div class="form-group">
            <input type="text" id="caesar-input" placeholder="Enter text to encrypt/decrypt" style="width: 100%;">
          </div>
          <div class="form-group" style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <label style="margin: 0;">Shift:</label>
            <input type="number" id="caesar-shift" value="3" min="1" max="25" style="width: 80px;">
            <select id="caesar-mode" style="padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
              <option value="encrypt">Encrypt</option>
              <option value="decrypt">Decrypt</option>
            </select>
            <button class="btn btn-primary btn-sm" id="caesar-btn">Go</button>
          </div>
          <div id="caesar-result" style="margin-top: 16px; display: none;">
            <div class="meta-item">
              <div class="meta-label">Result</div>
              <div class="meta-value" id="caesar-output" style="font-family: monospace; word-break: break-all;"></div>
            </div>
          </div>
        </div>

        <hr style="border: none; border-top: 1px solid var(--border); margin: 24px 0;">

        <div class="tool-section">
          <h3 style="margin-bottom: 16px;">Base64 Encoder/Decoder</h3>
          <div class="form-group">
            <textarea id="base64-input" placeholder="Enter text to encode/decode" rows="3" style="width: 100%; padding: 14px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 10px; color: var(--text-primary); font-size: 16px; resize: vertical;"></textarea>
          </div>
          <div class="form-group" style="display: flex; gap: 12px;">
            <button class="btn btn-primary btn-sm" id="base64-encode-btn">Encode</button>
            <button class="btn btn-secondary btn-sm" id="base64-decode-btn">Decode</button>
          </div>
          <div id="base64-result" style="margin-top: 16px; display: none;">
            <div class="meta-item">
              <div class="meta-label">Result</div>
              <div class="meta-value" id="base64-output" style="font-family: monospace; word-break: break-all;"></div>
              <button class="btn btn-secondary btn-sm" id="base64-copy-btn" style="margin-top: 8px;">Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer>
      <p>Powered by <a href="https://workers.cloudflare.com" target="_blank">Cloudflare Workers</a> &amp; <a href="https://developers.cloudflare.com/workers-ai/" target="_blank">Workers AI</a></p>
    </footer>
  </div>

  <script>
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
      });
    });

    const form = document.getElementById('shorten-form');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const result = document.getElementById('result');
    const ussOptions = document.getElementById('uss-options');
    const loadingText = loading.querySelector('p');

    // Toggle USS options based on provider selection
    document.querySelectorAll('input[name="provider"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const isUss = document.querySelector('input[name="provider"]:checked').value === 'uss';
        ussOptions.style.display = isUss ? 'block' : 'none';
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('url').value;
      const provider = document.querySelector('input[name="provider"]:checked').value;

      error.classList.remove('show');
      result.classList.remove('show');
      loading.classList.add('show');
      loadingText.textContent = provider === 'uss' ? 'Analyzing URL with AI...' : 'Shortening with TinyURL...';
      document.getElementById('submit-btn').disabled = true;

      try {
        let response, data;

        if (provider === 'tinyurl') {
          response = await fetch('/api/tinyurl', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
          data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to shorten URL');

          // Display TinyURL result (simpler output)
          document.getElementById('short-url').textContent = data.shortUrl;
          document.getElementById('category').textContent = 'N/A (TinyURL)';
          document.getElementById('safety-score').textContent = 'N/A';
          document.getElementById('score-fill').style.width = '0%';
          document.getElementById('safety-flags').innerHTML = '';
          document.getElementById('preview-section').style.display = 'none';
          document.getElementById('suggestions-section').style.display = 'none';
          document.getElementById('qr-container').innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">QR codes only available with USS provider</p>';
        } else {
          const customAlias = document.getElementById('alias').value;
          const generatePreview = document.getElementById('generatePreview').checked;
          const suggestAliases = document.getElementById('suggestAliases').checked;

          response = await fetch('/api/shorten', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, customAlias, generatePreview, suggestAliases })
          });
          data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to shorten URL');

          document.getElementById('short-url').textContent = data.shortUrl;
          document.getElementById('category').textContent = data.category || 'Unknown';

          const safetyScore = data.safety?.score ?? 100;
          document.getElementById('safety-score').textContent = safetyScore + '/100';
          const scoreFill = document.getElementById('score-fill');
          scoreFill.style.width = safetyScore + '%';
          scoreFill.className = 'score-fill ' + (safetyScore >= 80 ? 'safe' : safetyScore >= 50 ? 'warning' : 'danger');

          const flagsContainer = document.getElementById('safety-flags');
          flagsContainer.innerHTML = '';
          if (data.safety?.flags?.length) {
            data.safety.flags.forEach(flag => {
              const span = document.createElement('span');
              span.className = 'flag';
              span.textContent = flag.replace(/_/g, ' ');
              flagsContainer.appendChild(span);
            });
          }

          const previewSection = document.getElementById('preview-section');
          if (data.preview) {
            document.getElementById('preview-title').textContent = data.preview.title || 'No title';
            document.getElementById('preview-summary').textContent = data.preview.summary || 'No summary available';
            previewSection.style.display = 'block';
          } else {
            previewSection.style.display = 'none';
          }

          const suggestionsSection = document.getElementById('suggestions-section');
          const suggestionsContainer = document.getElementById('suggestions');
          if (data.suggestedAliases?.length) {
            suggestionsContainer.innerHTML = '';
            data.suggestedAliases.forEach(alias => {
              const span = document.createElement('span');
              span.className = 'suggestion';
              span.textContent = alias;
              span.onclick = () => document.getElementById('alias').value = alias;
              suggestionsContainer.appendChild(span);
            });
            suggestionsSection.style.display = 'block';
          } else {
            suggestionsSection.style.display = 'none';
          }

          const qrContainer = document.getElementById('qr-container');
          qrContainer.innerHTML = '<img src="/api/qr/' + data.shortCode + '?size=200" alt="QR Code" style="width: 200px; height: 200px;">';
        }

        result.classList.add('show');
      } catch (err) {
        error.textContent = err.message;
        error.classList.add('show');
      } finally {
        loading.classList.remove('show');
        document.getElementById('submit-btn').disabled = false;
      }
    });

    document.getElementById('copy-btn').addEventListener('click', async () => {
      const url = document.getElementById('short-url').textContent;
      await navigator.clipboard.writeText(url);
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });

    const analyticsBtn = document.getElementById('analytics-btn');
    const analyticsLoading = document.getElementById('analytics-loading');
    const analyticsError = document.getElementById('analytics-error');
    const analyticsResult = document.getElementById('analytics-result');

    analyticsBtn.addEventListener('click', async () => {
      const code = document.getElementById('analytics-code').value.trim();
      if (!code) return;
      analyticsError.classList.remove('show');
      analyticsResult.style.display = 'none';
      analyticsLoading.classList.add('show');

      try {
        const response = await fetch('/api/analytics/' + code);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch analytics');

        document.getElementById('total-clicks').textContent = data.totalClicks || 0;
        document.getElementById('analytics-category').textContent = data.category || '-';
        document.getElementById('analytics-safety').textContent = data.safety?.score ? data.safety.score + '/100' : '-';
        document.getElementById('analytics-url').textContent = data.originalUrl;
        document.getElementById('created-at').textContent = data.createdAt ? new Date(data.createdAt).toLocaleString() : '-';
        document.getElementById('last-clicked').textContent = data.lastClickedAt ? new Date(data.lastClickedAt).toLocaleString() : 'Never';

        const countryStats = document.getElementById('country-stats');
        const countries = data.analytics?.byCountry || {};
        if (Object.keys(countries).length) {
          countryStats.innerHTML = Object.entries(countries).sort((a, b) => b[1] - a[1]).map(([country, count]) => '<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);"><span>' + country + '</span><span>' + count + ' clicks</span></div>').join('');
        } else {
          countryStats.innerHTML = '<p style="color: var(--text-secondary);">No click data yet</p>';
        }

        const recentClicks = document.getElementById('recent-clicks');
        const clicks = data.recentClicks || [];
        if (clicks.length) {
          recentClicks.innerHTML = clicks.map(click => '<div class="meta-item" style="margin-bottom: 8px;"><div style="display: flex; justify-content: space-between;"><span>' + (click.country || 'Unknown') + '</span><span style="color: var(--text-secondary);">' + new Date(click.timestamp).toLocaleString() + '</span></div><div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">' + click.referer + '</div></div>').join('');
        } else {
          recentClicks.innerHTML = '<p class="meta-item" style="color: var(--text-secondary);">No clicks recorded yet</p>';
        }
        analyticsResult.style.display = 'block';
      } catch (err) {
        analyticsError.textContent = err.message;
        analyticsError.classList.add('show');
      } finally {
        analyticsLoading.classList.remove('show');
      }
    });

    document.getElementById('analytics-code').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') analyticsBtn.click();
    });

    // Tools - Password Strength Checker
    document.getElementById('check-password-btn').addEventListener('click', async () => {
      const password = document.getElementById('password-input').value;
      const resultDiv = document.getElementById('password-result');

      try {
        const response = await fetch('/api/tools/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        const data = await response.json();

        document.getElementById('password-strength').textContent = data.strength.toUpperCase();
        const scoreFill = document.getElementById('password-score-fill');
        scoreFill.style.width = data.score + '%';
        scoreFill.className = 'score-fill ' + (data.score >= 80 ? 'safe' : data.score >= 50 ? 'warning' : 'danger');

        const feedbackDiv = document.getElementById('password-feedback');
        feedbackDiv.innerHTML = data.feedback.map(f => '<div>• ' + f + '</div>').join('');

        resultDiv.style.display = 'block';
      } catch (err) {
        alert('Error checking password');
      }
    });

    // Tools - Caesar Cipher
    document.getElementById('caesar-btn').addEventListener('click', async () => {
      const text = document.getElementById('caesar-input').value;
      const shift = document.getElementById('caesar-shift').value;
      const mode = document.getElementById('caesar-mode').value;

      if (!text) return;

      try {
        const response = await fetch('/api/tools/caesar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, shift, mode })
        });
        const data = await response.json();

        document.getElementById('caesar-output').textContent = data.output;
        document.getElementById('caesar-result').style.display = 'block';
      } catch (err) {
        alert('Error processing cipher');
      }
    });

    // Tools - Base64
    async function handleBase64(mode) {
      const text = document.getElementById('base64-input').value;
      if (!text) return;

      try {
        const response = await fetch('/api/tools/base64', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, mode })
        });
        const data = await response.json();

        if (data.error) {
          alert(data.error);
          return;
        }

        document.getElementById('base64-output').textContent = data.output;
        document.getElementById('base64-result').style.display = 'block';
      } catch (err) {
        alert('Error processing base64');
      }
    }

    document.getElementById('base64-encode-btn').addEventListener('click', () => handleBase64('encode'));
    document.getElementById('base64-decode-btn').addEventListener('click', () => handleBase64('decode'));
    document.getElementById('base64-copy-btn').addEventListener('click', async () => {
      const text = document.getElementById('base64-output').textContent;
      await navigator.clipboard.writeText(text);
      const btn = document.getElementById('base64-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
  </script>
</body>
</html>`;
}

/**
 * Handle UI requests
 * @returns {Response} HTML response
 */
export function handleUI() {
  return new Response(getUIHtml(), {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
