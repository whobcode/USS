/**
 * URL Shortening Handler
 *
 * Creates shortened URLs and stores them in KV
 */

import { categorizeUrl, checkUrlSafety, summarizeUrl, generateSmartAliases } from '../utils/ai.js';

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
    const { url, customAlias, generatePreview, suggestAliases } = body;

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

    // Build list of AI tasks to run in parallel
    const aiTasks = [
      categorizeUrl(url, env),
      checkUrlSafety(url, env)
    ];

    // Optionally add preview generation
    if (generatePreview) {
      aiTasks.push(summarizeUrl(url, env));
    }

    // Optionally add alias suggestions
    if (suggestAliases && !customAlias) {
      aiTasks.push(generateSmartAliases(url, env));
    }

    // Run all AI tasks in parallel
    const results = await Promise.all(aiTasks);
    const [categoryResult, safetyResult] = results;

    urlData.category = categoryResult.category;
    urlData.categoryConfidence = categoryResult.confidence;
    urlData.safety = {
      safe: safetyResult.safe,
      score: safetyResult.score,
      flags: safetyResult.flags,
      analysis: safetyResult.analysis
    };

    // Add preview if requested
    let preview = null;
    let aliasIndex = 2;
    if (generatePreview) {
      preview = results[aliasIndex];
      urlData.preview = preview;
      aliasIndex++;
    }

    // Get suggested aliases if requested
    let suggestedAliases = [];
    if (suggestAliases && !customAlias) {
      suggestedAliases = results[aliasIndex] || [];
    }

    await env.URLS.put(shortCode, JSON.stringify(urlData));

    // Build response
    const baseUrl = new URL(request.url).origin;

    const response = {
      shortUrl: `${baseUrl}/${shortCode}`,
      shortCode,
      originalUrl: url,
      createdAt: urlData.createdAt,
      category: urlData.category,
      categoryConfidence: urlData.categoryConfidence,
      safety: urlData.safety
    };

    if (preview) {
      response.preview = preview;
    }

    if (suggestedAliases.length > 0) {
      response.suggestedAliases = suggestedAliases;
    }

    return new Response(JSON.stringify(response), {
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
