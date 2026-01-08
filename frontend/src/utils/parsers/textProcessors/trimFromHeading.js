/**
 * Trim markdown from a specific heading onwards
 * @param {string} markdown - Markdown text
 * @param {string} headingStart - Heading to start from (e.g., "###")
 * @returns {string} Trimmed markdown
 */
export function trimFromHeading(markdown = "", headingStart = "###") {
  if (!markdown) return "";
  const idx = markdown.indexOf(headingStart);
  return idx >= 0 ? markdown.slice(idx) : markdown;
}

