/**
 * QR Code Generator
 *
 * Pure JavaScript QR code generation for Cloudflare Workers
 * Based on QR Code specification ISO/IEC 18004
 */

// QR Code constants
const EC_LEVEL = { L: 0, M: 1, Q: 2, H: 3 };
const MODE = { NUMERIC: 1, ALPHANUMERIC: 2, BYTE: 4 };

// Alphanumeric character set
const ALPHANUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';

// Error correction codewords and block info for versions 1-10
const EC_BLOCKS = {
  1: { L: [7, 1, 19], M: [10, 1, 16], Q: [13, 1, 13], H: [17, 1, 9] },
  2: { L: [10, 1, 34], M: [16, 1, 28], Q: [22, 1, 22], H: [28, 1, 16] },
  3: { L: [15, 1, 55], M: [26, 1, 44], Q: [18, 2, 17], H: [22, 2, 13] },
  4: { L: [20, 1, 80], M: [18, 2, 32], Q: [26, 2, 24], H: [16, 4, 9] },
  5: { L: [26, 1, 108], M: [24, 2, 43], Q: [18, 2, 15, 2, 16], H: [22, 2, 11, 2, 12] },
};

/**
 * Simple QR Code generator - creates a basic QR code matrix
 * Uses a simplified approach suitable for short URLs
 */
function createQRMatrix(data) {
  // Encode data to binary
  const bits = encodeData(data);

  // Determine version (size) needed
  const version = getMinVersion(bits.length);
  const size = version * 4 + 17;

  // Create matrix
  const matrix = Array(size).fill(null).map(() => Array(size).fill(null));

  // Add finder patterns
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, size - 7, 0);
  addFinderPattern(matrix, 0, size - 7);

  // Add timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = matrix[i][6] = i % 2 === 0;
  }

  // Add alignment pattern for version >= 2
  if (version >= 2) {
    const pos = getAlignmentPosition(version);
    addAlignmentPattern(matrix, pos, pos);
  }

  // Add format info
  addFormatInfo(matrix, size);

  // Add data
  addData(matrix, bits, size);

  // Apply mask
  applyMask(matrix, size);

  return matrix;
}

function encodeData(data) {
  const bits = [];

  // Mode indicator (byte mode = 0100)
  bits.push(0, 1, 0, 0);

  // Character count (8 bits for version 1-9)
  const len = data.length;
  for (let i = 7; i >= 0; i--) {
    bits.push((len >> i) & 1);
  }

  // Data
  for (let i = 0; i < data.length; i++) {
    const byte = data.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((byte >> j) & 1);
    }
  }

  // Terminator
  bits.push(0, 0, 0, 0);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Add padding bytes
  const padBytes = [236, 17];
  let padIndex = 0;
  const capacity = getDataCapacity(getMinVersion(bits.length));
  while (bits.length < capacity * 8) {
    const pad = padBytes[padIndex % 2];
    for (let i = 7; i >= 0; i--) {
      bits.push((pad >> i) & 1);
    }
    padIndex++;
  }

  return bits;
}

function getMinVersion(bitLength) {
  const capacities = [152, 272, 440, 640, 864]; // Data bits for versions 1-5, EC level M
  for (let v = 0; v < capacities.length; v++) {
    if (bitLength <= capacities[v]) return v + 1;
  }
  return 5;
}

function getDataCapacity(version) {
  const capacities = [16, 28, 44, 64, 86];
  return capacities[version - 1] || capacities[4];
}

function getAlignmentPosition(version) {
  const positions = [0, 18, 22, 26, 30];
  return positions[version - 1] || positions[4];
}

function addFinderPattern(matrix, row, col) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isBlack = r === 0 || r === 6 || c === 0 || c === 6 ||
                      (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      matrix[row + r][col + c] = isBlack;
    }
  }

  // Separator
  for (let i = 0; i < 8; i++) {
    if (row + 7 < matrix.length && col + i < matrix.length) {
      matrix[row + 7][col + i] = false;
    }
    if (col + 7 < matrix.length && row + i < matrix.length) {
      matrix[row + i][col + 7] = false;
    }
    if (row > 0 && row - 1 < matrix.length && col + i < matrix.length) {
      matrix[row - 1][col + i] = false;
    }
    if (col > 0 && row + i < matrix.length && col - 1 >= 0) {
      matrix[row + i][col - 1] = false;
    }
  }
}

function addAlignmentPattern(matrix, row, col) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBlack = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
      if (matrix[row + r]?.[col + c] === null) {
        matrix[row + r][col + c] = isBlack;
      }
    }
  }
}

function addFormatInfo(matrix, size) {
  // Simplified format info for mask 0, EC level M
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  // Around top-left finder
  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 0; i < 6; i++) matrix[5 - i][8] = formatBits[9 + i] === 1;

  // Around other finders
  for (let i = 0; i < 7; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  matrix[size - 8][8] = true; // Dark module
  for (let i = 0; i < 8; i++) matrix[8][size - 8 + i] = formatBits[7 + i] === 1;
}

function addData(matrix, bits, size) {
  let bitIndex = 0;
  let upward = true;
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--; // Skip timing column

    for (let row = upward ? size - 1 : 0;
         upward ? row >= 0 : row < size;
         upward ? row-- : row++) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;
        if (matrix[row][currentCol] === null) {
          matrix[row][currentCol] = bitIndex < bits.length ? bits[bitIndex++] === 1 : false;
        }
      }
    }
    upward = !upward;
    col -= 2;
  }
}

function applyMask(matrix, size) {
  // Mask pattern 0: (row + col) % 2 === 0
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix[row][col] !== null && !isReserved(row, col, size)) {
        if ((row + col) % 2 === 0) {
          matrix[row][col] = !matrix[row][col];
        }
      }
    }
  }
}

function isReserved(row, col, size) {
  // Finder patterns
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= size - 8) return true;
  if (row >= size - 8 && col < 9) return true;
  // Timing patterns
  if (row === 6 || col === 6) return true;
  return false;
}

/**
 * Generate QR code as SVG string
 * @param {string} data - Data to encode
 * @param {object} options - Options {size, darkColor, lightColor}
 * @returns {string} SVG string
 */
export function generateQRCodeSVG(data, options = {}) {
  const {
    size = 200,
    darkColor = '#000000',
    lightColor = '#ffffff',
    margin = 4
  } = options;

  const matrix = createQRMatrix(data);
  const moduleCount = matrix.length;
  const moduleSize = size / (moduleCount + margin * 2);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="100%" height="100%" fill="${lightColor}"/>`;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * moduleSize;
        const y = (row + margin) * moduleSize;
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`;
      }
    }
  }

  svg += '</svg>';
  return svg;
}

/**
 * Generate QR code as PNG data URL (base64)
 * Uses SVG-to-canvas approach
 * @param {string} data - Data to encode
 * @param {object} options - Options
 * @returns {string} Data URL
 */
export function generateQRCodeDataURL(data, options = {}) {
  // For Workers, we return SVG data URL as PNG requires canvas
  const svg = generateQRCodeSVG(data, options);
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
