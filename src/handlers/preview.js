/**
 * Preview Handler
 *
 * Generates and returns page previews for shortened URLs
 */

import { summarizeUrl } from '../utils/ai.js';

/**
 * Handle preview requests
 * @param {string} shortCode - The short code to get preview for
 * @param {object} env - Environment bindings
 * @returns {Response} JSON response with preview data
 */
export async function handlePreview(shortCode, env) {
  try {
    const data = await env.URLS.get(shortCode);

    if (!data) {
      return new Response(JSON.stringify({ error: 'Short URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const urlData = JSON.parse(data);

    // Check if preview already exists and is recent (cached for 24 hours)
    if (urlData.preview && urlData.previewGeneratedAt) {
      const previewAge = Date.now() - new Date(urlData.previewGeneratedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (previewAge < maxAge) {
        return new Response(JSON.stringify({
          shortCode,
          originalUrl: urlData.originalUrl,
          preview: urlData.preview,
          cached: true,
          generatedAt: urlData.previewGeneratedAt
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Generate new preview
    const preview = await summarizeUrl(urlData.originalUrl, env);

    // Update KV with new preview
    urlData.preview = preview;
    urlData.previewGeneratedAt = new Date().toISOString();
    await env.URLS.put(shortCode, JSON.stringify(urlData));

    return new Response(JSON.stringify({
      shortCode,
      originalUrl: urlData.originalUrl,
      preview,
      cached: false,
      generatedAt: urlData.previewGeneratedAt
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
