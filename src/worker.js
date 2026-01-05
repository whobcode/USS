/**
 * URL Shortener Service - Cloudflare Worker
 *
 * An intelligent URL shortening service with AI-powered link categorization,
 * safety analysis, and click analytics.
 */

import { handleShorten } from './handlers/shorten.js';
import { handleRedirect } from './handlers/redirect.js';
import { handleAnalytics } from './handlers/analytics.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // API Routes
      if (path === '/api/shorten' && request.method === 'POST') {
        return handleShorten(request, env);
      }

      if (path.startsWith('/api/analytics/')) {
        const shortCode = path.replace('/api/analytics/', '');
        return handleAnalytics(shortCode, env);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Redirect handler for short codes
      if (path.length > 1) {
        const shortCode = path.slice(1);
        return handleRedirect(shortCode, env, request);
      }

      // Root path - API documentation
      return new Response(JSON.stringify({
        service: 'URL Shortener Service',
        version: '1.0.0',
        endpoints: {
          'POST /api/shorten': 'Create a shortened URL',
          'GET /:shortCode': 'Redirect to original URL',
          'GET /api/analytics/:shortCode': 'Get click analytics'
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
