/**
 * Extract highlights (bullet points) from markdown
 * @param {string} markdown - Markdown text
 * @param {number} count - Number of highlights to extract
 * @returns {Array} Array of highlight strings
 */
export function extractHighlights(markdown = "", count = 3) {
  const lines = markdown.split(/\r?\n/);
  const bullets = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      bullets.push(trimmed.replace(/^[\-•]\s*/, ""));
    }
    if (bullets.length === count) {
      break;
    }
  }
  return bullets;
}

