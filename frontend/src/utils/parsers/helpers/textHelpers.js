/**
 * Text processing utilities
 */

/**
 * Fix concatenated text by adding spaces between words
 * Detects patterns like "HelloWorld" and converts to "Hello World"
 * @param {string} text - Text to fix
 * @returns {string} Fixed text
 */
export function fixConcatenatedText(text) {
  if (!text) return text;

  // Pattern: lowercase letter followed by uppercase letter = word boundary
  let fixed = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');

  // Pattern: number followed by letter = word boundary
  fixed = fixed.replace(/(\d)([A-Za-z])/g, '$1 $2');
  fixed = fixed.replace(/([A-Za-z])(\d)/g, '$1 $2');

  // Pattern: special characters that should have spaces around them
  fixed = fixed.replace(/([a-zA-Z0-9])([:;])([a-zA-Z])/g, '$1$2 $3');

  // Pattern: multiple consecutive capital letters followed by lowercase = acronym
  fixed = fixed.replace(/([A-Z]{2,})([a-z])/g, '$1 $2');

  return fixed;
}

