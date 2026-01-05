/**
 * URL Shortening Handler
 *
 * Creates shortened URLs and stores them in KV
 */

/**
 * Generate a random short code
 * @param {number} length - Length of the short code
 * @returns {string} Random alphanumeric code
 */
function generateShortCode(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Whether the URL is valid
 */
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Handle URL shortening requests
 * @param {Request} request - Incoming request
 * @param {object} env - Environment bindings
 * @returns {Response} JSON response with shortened URL
 */
export async function handleShorten(request, env) {
  try {
    const body = await request.json();
    const { url, customAlias } = body;

    // Validate URL
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isValidUrl(url)) {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate or use custom short code
    let shortCode = customAlias || generateShortCode();

    // Check if custom alias already exists
    if (customAlias) {
      const existing = await env.URLS.get(customAlias);
      if (existing) {
        return new Response(JSON.stringify({ error: 'Alias already in use' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Store URL data
    const urlData = {
      originalUrl: url,
      createdAt: new Date().toISOString(),
      clicks: 0
    };

    // TODO: Add AI categorization here
    // const category = await categorizeUrl(url, env);
    // urlData.category = category;

    await env.URLS.put(shortCode, JSON.stringify(urlData));

    // Build response
    const baseUrl = new URL(request.url).origin;

    return new Response(JSON.stringify({
      shortUrl: `${baseUrl}/${shortCode}`,
      shortCode,
      originalUrl: url,
      createdAt: urlData.createdAt
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
