/**
 * URL Shortener Service - Cloudflare Worker
 *
 * An intelligent URL shortening service with AI-powered link categorization,
 * safety analysis, and click analytics.
 */

import { handleShorten } from './handlers/shorten.js';
import { handleRedirect } from './handlers/redirect.js';
import { handleAnalytics } from './handlers/analytics.js';
import { handlePreview } from './handlers/preview.js';
import { handleQRCode } from './handlers/qrcode.js';
import { handleUI } from './handlers/ui.js';

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

      if (path.startsWith('/api/preview/')) {
        const shortCode = path.replace('/api/preview/', '');
        return handlePreview(shortCode, env);
      }

      if (path.startsWith('/api/qr/')) {
        const shortCode = path.replace('/api/qr/', '');
        return handleQRCode(shortCode, env, request);
      }

      // Health check
      if (path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // API documentation endpoint
      if (path === '/api') {
        return new Response(JSON.stringify({
          service: 'URL Shortener Service',
          version: '1.0.0',
          features: [
            'AI-powered URL categorization',
            'Phishing/malware detection',
            'Page preview generation',
            'Click analytics with geographic data',
            'Smart alias suggestions',
            'QR code generation'
          ],
          endpoints: {
            'POST /api/shorten': 'Create a shortened URL (body: {url, customAlias?, generatePreview?, suggestAliases?})',
            'GET /:shortCode': 'Redirect to original URL',
            'GET /api/analytics/:shortCode': 'Get click analytics',
            'GET /api/preview/:shortCode': 'Get/generate page preview',
            'GET /api/qr/:shortCode': 'Get QR code (query: ?size=200&dark=#000&light=#fff&format=svg|json)'
          }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Redirect handler for short codes
      if (path.length > 1) {
        const shortCode = path.slice(1);
        return handleRedirect(shortCode, env, request);
      }

      // Root path - Web UI
      return handleUI();

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
