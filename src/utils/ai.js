/**
 * AI Utilities
 *
 * Handles AI-powered features using Workers AI
 */

const CATEGORIES = [
  'News',
  'Shopping',
  'Social Media',
  'Entertainment',
  'Education',
  'Business',
  'Technology',
  'Health',
  'Finance',
  'Travel',
  'Food',
  'Sports',
  'Other'
];

/**
 * Categorize a URL using Workers AI
 * @param {string} url - The URL to categorize
 * @param {object} env - Environment bindings with AI
 * @returns {Promise<{category: string, confidence: number}>}
 */
export async function categorizeUrl(url, env) {
  if (!env.AI) {
    return { category: 'Other', confidence: 0 };
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const path = parsedUrl.pathname;

    const prompt = `Classify this URL into exactly one category.

URL: ${url}
Domain: ${domain}
Path: ${path}

Categories: ${CATEGORIES.join(', ')}

Respond with ONLY the category name, nothing else.`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 20,
      temperature: 0.1
    });

    const result = response.response?.trim() || 'Other';

    // Match against known categories (case-insensitive)
    const matchedCategory = CATEGORIES.find(
      cat => result.toLowerCase().includes(cat.toLowerCase())
    ) || 'Other';

    return {
      category: matchedCategory,
      confidence: matchedCategory !== 'Other' ? 0.8 : 0.5
    };
  } catch (error) {
    console.error('AI categorization error:', error);
    return { category: 'Other', confidence: 0 };
  }
}

/**
 * Get all available categories
 * @returns {string[]}
 */
export function getCategories() {
  return CATEGORIES;
}

// Known suspicious TLDs and patterns
const SUSPICIOUS_TLDS = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click', '.link', '.buzz'];
const TRUSTED_DOMAINS = [
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
  'linkedin.com', 'github.com', 'amazon.com', 'apple.com', 'microsoft.com',
  'wikipedia.org', 'reddit.com', 'netflix.com', 'spotify.com', 'dropbox.com'
];

/**
 * Check URL safety using pattern analysis and AI
 * @param {string} url - The URL to check
 * @param {object} env - Environment bindings with AI
 * @returns {Promise<{safe: boolean, score: number, flags: string[], analysis: string}>}
 */
export async function checkUrlSafety(url, env) {
  const flags = [];
  let score = 100; // Start with perfect score

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.toLowerCase();
    const fullUrl = url.toLowerCase();

    // Check for trusted domains (quick pass)
    const baseDomain = domain.replace(/^www\./, '');
    if (TRUSTED_DOMAINS.some(trusted => baseDomain === trusted || baseDomain.endsWith('.' + trusted))) {
      return {
        safe: true,
        score: 100,
        flags: [],
        analysis: 'Trusted domain'
      };
    }

    // Pattern-based checks
    // 1. Suspicious TLDs
    if (SUSPICIOUS_TLDS.some(tld => domain.endsWith(tld))) {
      flags.push('suspicious_tld');
      score -= 20;
    }

    // 2. IP address instead of domain
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain)) {
      flags.push('ip_address');
      score -= 30;
    }

    // 3. Excessive subdomains
    const subdomainCount = domain.split('.').length - 2;
    if (subdomainCount > 2) {
      flags.push('excessive_subdomains');
      score -= 15;
    }

    // 4. Suspicious keywords in URL
    const suspiciousKeywords = ['login', 'signin', 'verify', 'account', 'secure', 'update', 'confirm', 'banking', 'password'];
    const foundKeywords = suspiciousKeywords.filter(kw => fullUrl.includes(kw));
    if (foundKeywords.length > 1) {
      flags.push('suspicious_keywords');
      score -= 15;
    }

    // 5. Typosquatting detection (common brand misspellings)
    const brandTypos = [
      { brand: 'google', typos: ['googel', 'gogle', 'g00gle', 'googIe'] },
      { brand: 'facebook', typos: ['faceb00k', 'facebok', 'faceboook'] },
      { brand: 'amazon', typos: ['amaz0n', 'amazom', 'arnazon'] },
      { brand: 'paypal', typos: ['paypa1', 'paypai', 'paypaI'] },
      { brand: 'apple', typos: ['app1e', 'appIe', 'apple-id'] }
    ];
    for (const { brand, typos } of brandTypos) {
      if (typos.some(typo => domain.includes(typo)) && !domain.includes(brand + '.')) {
        flags.push('possible_typosquatting');
        score -= 40;
        break;
      }
    }

    // 6. URL length check
    if (url.length > 200) {
      flags.push('excessive_length');
      score -= 10;
    }

    // 7. Encoded characters in suspicious places
    if (parsedUrl.pathname.includes('%') && parsedUrl.pathname.match(/%[0-9a-f]{2}/gi)?.length > 5) {
      flags.push('excessive_encoding');
      score -= 10;
    }

    // AI-powered analysis for edge cases
    let aiAnalysis = '';
    if (env.AI && score < 90 && score > 30) {
      try {
        const prompt = `Analyze this URL for potential phishing or security risks. Be brief.

URL: ${url}
Domain: ${domain}
Detected flags: ${flags.join(', ') || 'none'}

Is this URL likely safe or suspicious? Respond in one sentence.`;

        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          prompt,
          max_tokens: 50,
          temperature: 0.1
        });

        aiAnalysis = response.response?.trim() || '';

        // Adjust score based on AI response
        const aiLower = aiAnalysis.toLowerCase();
        if (aiLower.includes('suspicious') || aiLower.includes('phishing') || aiLower.includes('malicious')) {
          score -= 15;
          flags.push('ai_flagged');
        } else if (aiLower.includes('safe') || aiLower.includes('legitimate')) {
          score += 10;
        }
      } catch (aiError) {
        console.error('AI safety check error:', aiError);
      }
    }

    // Clamp score
    score = Math.max(0, Math.min(100, score));

    return {
      safe: score >= 50,
      score,
      flags,
      analysis: aiAnalysis || (score >= 80 ? 'URL appears safe' : score >= 50 ? 'Exercise caution' : 'Potentially unsafe')
    };
  } catch (error) {
    console.error('URL safety check error:', error);
    return {
      safe: false,
      score: 0,
      flags: ['parse_error'],
      analysis: 'Could not analyze URL'
    };
  }
}

/**
 * Generate a summary/preview for a URL's destination page
 * @param {string} url - The URL to summarize
 * @param {object} env - Environment bindings with AI
 * @returns {Promise<{title: string, summary: string, fetchedContent: boolean}>}
 */
export async function summarizeUrl(url, env) {
  if (!env.AI) {
    return { title: '', summary: '', fetchedContent: false };
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const path = parsedUrl.pathname;
    const searchParams = parsedUrl.search;

    let pageContent = '';
    let fetchedContent = false;

    // Attempt to fetch page content (with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'USS-Bot/1.0 (URL Shortener Service; Preview Generator)',
          'Accept': 'text/html'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();
        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const metaDesc = descMatch ? descMatch[1].trim() : '';

        // Extract some body text (first 500 chars of visible text)
        const bodyText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 500);

        pageContent = `Title: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}`;
        fetchedContent = true;
      }
    } catch (fetchError) {
      // Fetch failed, continue with URL-based summary
    }

    // Generate summary with AI
    const prompt = fetchedContent
      ? `Generate a brief, helpful preview for this webpage. Include a short title (max 60 chars) and a 1-2 sentence summary.

URL: ${url}
${pageContent}

Respond in this exact format:
TITLE: [title here]
SUMMARY: [summary here]`
      : `Based on this URL, generate a likely preview. Include a short title (max 60 chars) and a 1-2 sentence summary of what this page probably contains.

URL: ${url}
Domain: ${domain}
Path: ${path}
${searchParams ? `Query: ${searchParams}` : ''}

Respond in this exact format:
TITLE: [title here]
SUMMARY: [summary here]`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 150,
      temperature: 0.3
    });

    const result = response.response?.trim() || '';

    // Parse response
    const titleMatch = result.match(/TITLE:\s*(.+?)(?:\n|SUMMARY:|$)/i);
    const summaryMatch = result.match(/SUMMARY:\s*(.+)/is);

    return {
      title: titleMatch ? titleMatch[1].trim().substring(0, 100) : domain,
      summary: summaryMatch ? summaryMatch[1].trim().substring(0, 300) : 'No preview available',
      fetchedContent
    };
  } catch (error) {
    console.error('URL summarization error:', error);
    return {
      title: new URL(url).hostname,
      summary: 'Preview unavailable',
      fetchedContent: false
    };
  }
}

/**
 * Generate a smart alias suggestion based on URL content
 * @param {string} url - The URL to generate alias for
 * @param {object} env - Environment bindings with AI
 * @returns {Promise<string[]>} Array of suggested aliases
 */
export async function generateSmartAliases(url, env) {
  if (!env.AI) {
    return [];
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace('www.', '');
    const path = parsedUrl.pathname;

    const prompt = `Generate 3 short, memorable URL aliases for this link. Each should be 4-8 characters, easy to type and remember.

URL: ${url}
Domain: ${domain}
Path: ${path}

Rules:
- Use only lowercase letters and numbers
- Make them relevant to the content
- Keep them pronounceable when possible

Respond with exactly 3 aliases, one per line, nothing else.`;

    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      prompt,
      max_tokens: 50,
      temperature: 0.7
    });

    const result = response.response?.trim() || '';
    const aliases = result
      .split('\n')
      .map(line => line.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(alias => alias.length >= 3 && alias.length <= 10)
      .slice(0, 3);

    return aliases;
  } catch (error) {
    console.error('Smart alias generation error:', error);
    return [];
  }
}
