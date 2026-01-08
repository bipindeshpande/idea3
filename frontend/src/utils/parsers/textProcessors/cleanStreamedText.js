/**
 * Clean streamed text by removing SSE metadata JSON
 * Removes patterns like {"run_id": "...", "status": "..."}
 * 
 * @param {string} text - The text to clean
 * @returns {string} Cleaned text
 */
export function cleanStreamedText(text = "") {
  if (!text) return text;

  // PROTECT: Don't filter if this contains profile analysis delimiters
  if (text.includes("---PROFILE_ANALYSIS_START---") || 
      text.includes("---PROFILE_ANALYSIS_END---")) {
    return text;
  }

  // Remove JSON objects that look like SSE metadata
  const jsonPattern = /\{[^{}]*"run_id"\s*:\s*"[^"]*"[^{}]*"status"\s*:\s*"[^"]*"[^{}]*\}[-\s]*/g;
  let cleaned = text.replace(jsonPattern, "");

  // Also remove standalone JSON-like objects with run_id
  const runIdPattern = /\{[^{}]*"run_id"\s*:\s*"[^"]*"[^{}]*\}[-\s]*/g;
  cleaned = cleaned.replace(runIdPattern, "");

  // Remove any remaining JSON-like patterns that start with { and contain run_id
  const loosePattern = /\{[^{}]*run_id[^{}]*\}[-\s]*/g;
  cleaned = cleaned.replace(loosePattern, "");

  return cleaned.trim();
}

