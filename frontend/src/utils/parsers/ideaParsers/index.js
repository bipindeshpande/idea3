/**
 * Idea parsers - unified export
 * Combines structured and markdown parsers
 */

import { parseStructuredIdeas } from './parseStructuredIdeas.js';
import { parseMarkdownIdeas } from './parseMarkdownIdeas.js';
import { fixConcatenatedText } from '../helpers/textHelpers.js';

/**
 * Unified parser for IDEA blocks from streamed text or markdown
 * Tries structured format first (PRIORITY 1-2), then falls back to markdown patterns (PRIORITY 3-7)
 * 
 * @param {string} text - The streamed text or markdown containing IDEA blocks
 * @param {number} limit - Maximum number of ideas to return (default: no limit)
 * @returns {Array} Array of parsed IDEA objects
 */
export function parseStructuredIdeasUnified(text = "", limit = null) {
  if (!text) return [];

  // Fix concatenated text before parsing (done once here)
  text = fixConcatenatedText(text);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('[parseStructuredIdeas] Text preview:', text.substring(0, 500));
  }

  // Try structured format first (PRIORITY 1-2)
  // Skip preprocessing since we already did it above
  const structuredIdeas = parseStructuredIdeas(text, limit, true);
  if (structuredIdeas.length > 0) {
    return structuredIdeas;
  }

  // Fall back to markdown patterns (PRIORITY 3-7)
  // parseMarkdownIdeas doesn't do preprocessing, so we pass the already-fixed text
  return parseMarkdownIdeas(text, limit);
}

// Re-export for backward compatibility
export { parseStructuredIdeas } from './parseStructuredIdeas.js';
export { parseMarkdownIdeas } from './parseMarkdownIdeas.js';

