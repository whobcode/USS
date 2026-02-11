/**
 * Redirect Handler
 *
 * Handles redirects for shortened URLs and tracks analytics
 */

/**
 * Handle redirect requests
 * @param {string} shortCode - The short code to look up
 * @param {object} env - Environment bindings
 * @param {Request} request - Original request for analytics
 * @returns {Response} Redirect response or 404
 */
export async function handleRedirect(shortCode, env, request) {
  try {
    const data = await env.URLS.get(shortCode);

    if (!data) {
      return new Response(JSON.stringify({ error: 'Short URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const urlData = JSON.parse(data);

    // Update click count and analytics
    urlData.clicks = (urlData.clicks || 0) + 1;
    urlData.lastClickedAt = new Date().toISOString();

    // Extract analytics data from request
    const analyticsEntry = {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('User-Agent') || 'Unknown',
      referer: request.headers.get('Referer') || 'Direct',
      country: request.cf?.country || 'Unknown',
      city: request.cf?.city || 'Unknown'
    };

    // Store click in analytics (append to clicks array)
    if (!urlData.clickHistory) {
      urlData.clickHistory = [];
    }

    // Keep last 100 clicks for analytics
    urlData.clickHistory.push(analyticsEntry);
    if (urlData.clickHistory.length > 100) {
      urlData.clickHistory = urlData.clickHistory.slice(-100);
    }

    // Update KV with new analytics
    await env.URLS.put(shortCode, JSON.stringify(urlData));

    // Safety check before redirect
    if (urlData.safety && !urlData.safety.safe) {
      // Show warning page for unsafe URLs
      const warningHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Safety Warning - URL Shortener</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .warning-card { background: #16213e; border-radius: 16px; padding: 40px; max-width: 500px; text-align: center; border: 2px solid #e94560; }
    .warning-icon { font-size: 64px; margin-bottom: 20px; }
    h1 { color: #e94560; margin-bottom: 16px; }
    p { color: #aaa; margin-bottom: 24px; line-height: 1.6; }
    .url { background: #0f0f23; padding: 12px; border-radius: 8px; word-break: break-all; font-family: monospace; font-size: 14px; margin-bottom: 24px; color: #888; }
    .flags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-bottom: 24px; }
    .flag { background: #e94560; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
    .score { font-size: 24px; font-weight: bold; color: #e94560; margin-bottom: 8px; }
    .buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
    .btn-danger { background: #e94560; color: white; }
    .btn-danger:hover { background: #ff6b6b; }
    .btn-safe { background: #333; color: #aaa; border: 1px solid #444; }
    .btn-safe:hover { background: #444; color: #fff; }
  </style>
</head>
<body>
  <div class="warning-card">
    <div class="warning-icon">⚠️</div>
    <h1>Security Warning</h1>
    <p>This link has been flagged as potentially unsafe. Proceed with caution.</p>
    <div class="score">Safety Score: ${urlData.safety.score}/100</div>
    <p>${urlData.safety.analysis || 'This URL may pose security risks.'}</p>
    <div class="url">${urlData.originalUrl}</div>
    ${urlData.safety.flags?.length ? `<div class="flags">${urlData.safety.flags.map(f => `<span class="flag">${f.replace(/_/g, ' ')}</span>`).join('')}</div>` : ''}
    <div class="buttons">
      <a href="/" class="btn btn-safe">Go Back</a>
      <a href="${urlData.originalUrl}" class="btn btn-danger" rel="nofollow noopener">Continue Anyway</a>
    </div>
  </div>
</body>
</html>`;
      return new Response(warningHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Perform redirect for safe URLs
    return Response.redirect(urlData.originalUrl, 302);

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
