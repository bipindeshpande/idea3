/**
 * Regex patterns and constants for idea parsing
 */

/**
 * Common patterns to exclude from idea parsing
 */
export const EXCLUDE_PATTERNS = [
  'recommendation matrix', 'financial outlook', 'risk radar', 'customer persona',
  'validation questions', '30/60/90', 'roadmap', 'decision checklist',
  'comprehensive recommendation report', 'profile analysis', 'research',
  'business models', 'target segments', 'value propositions', 'revenue models',
  'market opportunities', 'go-to-market strategy', 'pricing strategies',
  'validation frameworks', 'execution plans', 'industry overview', 'trends',
  'competitor', 'competitors', 'competitor landscape', 'competitor insights',
  'skill tags', 'budget bins', 'constraints', 'industry context',
  'startup costs', 'monthly operating', 'revenue potential', 'breakeven',
  'primary', 'secondary', 'days', 'mitigation'
];

/**
 * Check if a title should be excluded from idea parsing
 * @param {string} title - Title to check
 * @returns {boolean} True if should be excluded
 */
export function shouldExcludeTitle(title) {
  if (!title) return true;
  const titleLower = title.toLowerCase().trim();
  return EXCLUDE_PATTERNS.some(pattern => titleLower.includes(pattern));
}

/**
 * Clean summary text by removing common section headers and prefixes
 * @param {string} summary - Summary text to clean
 * @returns {string} Cleaned summary
 */
export function cleanSummaryText(summary) {
  if (!summary) return summary;
  
  return summary
    .replace(/^why\s+it\s+fits\s+now[:\s]*/i, "")
    .replace(/^execution\s+path[:\s]*/i, "")
    .replace(/^[-*]\s*\*\*execution\s+path\*\*[:\s]*/i, "")
    .replace(/^[-*]\s*execution\s+path[:\s]*/i, "")
    .replace(/\*\*execution\s+path\*\*[:\s]*/gi, "")
    .replace(/[-*]\s*\*\*days\s+0[-\s]?30\*\*[:\s]*/gi, "")
    .replace(/[-*]\s*days\s+0[-\s]?30[:\s]*/gi, "")
    .replace(/\*\*days\s+0[-\s]?30\*\*[:\s]*/gi, "")
    .replace(/days\s+0[-\s]?30[:\s]*/gi, "")
    .replace(/^[-*]\s*/g, "")
    .replace(/^#+\s*/g, "")
    .replace(/^\*\*/g, "")
    .replace(/\*\*$/g, "")
    .trim();
}

