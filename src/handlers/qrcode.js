/**
 * QR Code Handler
 *
 * Generates QR codes for shortened URLs
 */

import { generateQRCodeSVG } from '../utils/qrcode.js';

/**
 * Handle QR code requests
 * @param {string} shortCode - The short code to generate QR for
 * @param {object} env - Environment bindings
 * @param {Request} request - Original request for options
 * @returns {Response} SVG image response
 */
export async function handleQRCode(shortCode, env, request) {
  try {
    const data = await env.URLS.get(shortCode);

    if (!data) {
      return new Response(JSON.stringify({ error: 'Short URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse query params for customization
    const url = new URL(request.url);
    const size = parseInt(url.searchParams.get('size')) || 200;
    const darkColor = url.searchParams.get('dark') || '#000000';
    const lightColor = url.searchParams.get('light') || '#ffffff';
    const format = url.searchParams.get('format') || 'svg';

    // Build the full short URL
    const baseUrl = url.origin;
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Generate QR code
    const svg = generateQRCodeSVG(shortUrl, {
      size: Math.min(Math.max(size, 100), 1000), // Clamp between 100-1000
      darkColor,
      lightColor
    });

    if (format === 'json') {
      return new Response(JSON.stringify({
        shortCode,
        shortUrl,
        qrCode: `data:image/svg+xml;base64,${btoa(svg)}`,
        size,
        darkColor,
        lightColor
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return SVG image
    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400'
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
