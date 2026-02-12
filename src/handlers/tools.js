/**
 * Tools Handler
 *
 * Utility tools inspired by Python-Scripts repository
 */

/**
 * Check password strength
 * Inspired by Python-Scripts/bin/password-strength-checker.py
 */
function checkPasswordStrength(password) {
  const result = {
    score: 0,
    strength: 'weak',
    feedback: [],
    checks: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false
    }
  };

  if (!password) {
    result.feedback.push('Password is required');
    return result;
  }

  // Length check
  if (password.length >= 10) {
    result.checks.length = true;
    result.score += 20;
  } else if (password.length >= 8) {
    result.score += 10;
    result.feedback.push('Use at least 10 characters for a stronger password');
  } else {
    result.feedback.push('Password should be at least 8 characters');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    result.checks.uppercase = true;
    result.score += 20;
  } else {
    result.feedback.push('Add uppercase letters');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    result.checks.lowercase = true;
    result.score += 20;
  } else {
    result.feedback.push('Add lowercase letters');
  }

  // Numbers check
  if (/\d/.test(password)) {
    result.checks.numbers = true;
    result.score += 20;
  } else {
    result.feedback.push('Add numbers');
  }

  // Special characters check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    result.checks.special = true;
    result.score += 20;
  } else {
    result.feedback.push('Add special characters (!@#$%^&*...)');
  }

  // Determine strength
  if (result.score >= 80) {
    result.strength = 'strong';
  } else if (result.score >= 60) {
    result.strength = 'good';
  } else if (result.score >= 40) {
    result.strength = 'fair';
  } else {
    result.strength = 'weak';
  }

  if (result.score === 100) {
    result.feedback = ['Excellent! Your password is very strong'];
  }

  return result;
}

/**
 * Caesar cipher encryption/decryption
 * Inspired by Python-Scripts/bin/caesar_cipher.py
 */
function caesarCipher(text, shift, decrypt = false) {
  const key = 'abcdefghijklmnopqrstuvwxyz';
  const actualShift = decrypt ? -shift : shift;
  let result = '';

  for (const char of text.toLowerCase()) {
    const index = key.indexOf(char);
    if (index !== -1) {
      const newIndex = ((index + actualShift) % 26 + 26) % 26;
      result += key[newIndex];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Base64 encode/decode
 * Inspired by Python-Scripts/bin/image_encoder.py
 */
function base64Encode(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    throw new Error('Failed to encode text');
  }
}

function base64Decode(encoded) {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch (e) {
    throw new Error('Invalid base64 string');
  }
}

/**
 * Handle password strength check requests
 */
export async function handlePasswordCheck(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const result = checkPasswordStrength(password || '');

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Caesar cipher requests
 */
export async function handleCaesarCipher(request) {
  try {
    const body = await request.json();
    const { text, shift, mode } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const shiftAmount = parseInt(shift) || 3;
    const decrypt = mode === 'decrypt';
    const result = caesarCipher(text, shiftAmount, decrypt);

    return new Response(JSON.stringify({
      input: text,
      output: result,
      shift: shiftAmount,
      mode: decrypt ? 'decrypt' : 'encrypt'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Base64 encode/decode requests
 */
export async function handleBase64(request) {
  try {
    const body = await request.json();
    const { text, mode } = body;

    if (!text) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let result;
    try {
      if (mode === 'decode') {
        result = base64Decode(text);
      } else {
        result = base64Encode(text);
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      input: text,
      output: result,
      mode: mode === 'decode' ? 'decode' : 'encode'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
