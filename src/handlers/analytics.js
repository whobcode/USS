/**
 * Analytics Handler
 *
 * Provides click analytics for shortened URLs
 */

/**
 * Handle analytics requests
 * @param {string} shortCode - The short code to get analytics for
 * @param {object} env - Environment bindings
 * @returns {Response} JSON response with analytics data
 */
export async function handleAnalytics(shortCode, env) {
  try {
    const data = await env.URLS.get(shortCode);

    if (!data) {
      return new Response(JSON.stringify({ error: 'Short URL not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const urlData = JSON.parse(data);

    // Calculate analytics summary
    const clickHistory = urlData.clickHistory || [];

    // Country distribution
    const countryStats = {};
    clickHistory.forEach(click => {
      const country = click.country || 'Unknown';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });

    // Referrer distribution
    const referrerStats = {};
    clickHistory.forEach(click => {
      const referer = click.referer || 'Direct';
      referrerStats[referer] = (referrerStats[referer] || 0) + 1;
    });

    // Clicks over time (last 7 days)
    const now = new Date();
    const clicksByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      clicksByDay[dateStr] = 0;
    }

    clickHistory.forEach(click => {
      const dateStr = click.timestamp.split('T')[0];
      if (clicksByDay.hasOwnProperty(dateStr)) {
        clicksByDay[dateStr]++;
      }
    });

    return new Response(JSON.stringify({
      shortCode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      totalClicks: urlData.clicks || 0,
      lastClickedAt: urlData.lastClickedAt || null,
      analytics: {
        byCountry: countryStats,
        byReferrer: referrerStats,
        clicksByDay
      },
      recentClicks: clickHistory.slice(-10).reverse()
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
