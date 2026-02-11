/**
 * TinyURL Handler
 *
 * Wrapper for TinyURL API (inspired by Python-Scripts/bin/shortener.py)
 */

/**
 * Shorten URL using TinyURL API
 * @param {Request} request - Incoming request
 * @returns {Response} JSON response with shortened URL
 */
export async function handleTinyUrl(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate URL
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call TinyURL API (same approach as Python-Scripts/bin/shortener.py)
    const tinyUrlApi = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`;

    const response = await fetch(tinyUrlApi);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: 'TinyURL service unavailable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const shortUrl = await response.text();

    return new Response(JSON.stringify({
      shortUrl: shortUrl.trim(),
      originalUrl: url,
      provider: 'TinyURL',
      createdAt: new Date().toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to shorten URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
