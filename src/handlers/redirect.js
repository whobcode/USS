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

    // TODO: Add safety check before redirect
    // const isSafe = await checkUrlSafety(urlData.originalUrl, env);
    // if (!isSafe) {
    //   return new Response('Warning: This URL may be unsafe', { status: 403 });
    // }

    // Update KV with new analytics
    await env.URLS.put(shortCode, JSON.stringify(urlData));

    // Perform redirect
    return Response.redirect(urlData.originalUrl, 302);

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
