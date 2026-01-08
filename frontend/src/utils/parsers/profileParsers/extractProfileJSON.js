/**
 * Extract profile JSON from streamed text
 * Standard function for extracting profile analysis JSON from delimited text
 * Follows contract: ---PROFILE_ANALYSIS_START--- ... JSON ... ---PROFILE_ANALYSIS_END---
 * 
 * This is the standard approach used across the frontend.
 * Backend uses a similar function (extract_profile_json) in text_cleaner.py for consistency.
 * 
 * @param {string} text - The streamed text containing profile markers
 * @returns {Object|null} Parsed profile JSON object or null if not found
 */
export function extractProfileJSON(text = "") {
  if (!text) return null;

  const START_DELIMITER = "---PROFILE_ANALYSIS_START---";
  const END_DELIMITER = "---PROFILE_ANALYSIS_END---";

  // Check if text is too short to contain both delimiters
  const minLength = START_DELIMITER.length + END_DELIMITER.length + 10; // 10 chars for minimal JSON
  if (text.length < minLength) {
    return null;
  }

  const startIdx = text.indexOf(START_DELIMITER);
  const endIdx = text.indexOf(END_DELIMITER);

  // Both delimiters must be present
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
    return null;
  }

  // Extract JSON string between delimiters
  const delimiterEnd = startIdx + START_DELIMITER.length;
  let jsonText = text.substring(delimiterEnd, endIdx).trim();

  // Use balanced brace matching to extract the complete JSON object
  let braceCount = 0;
  let jsonStart = -1;
  let jsonEnd = -1;

  for (let i = 0; i < jsonText.length; i++) {
    if (jsonText[i] === '{') {
      if (braceCount === 0) {
        jsonStart = i;
      }
      braceCount++;
    } else if (jsonText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && jsonStart >= 0) {
        jsonEnd = i;
        break;
      }
    }
  }

  if (jsonStart < 0 || jsonEnd <= jsonStart) {
    // Fallback: try simple first/last brace approach
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
      return null;
    }
  } else {
    jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
  }

  // Parse JSON
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("extractProfileJSON - Failed to parse JSON:", e);
    return null;
  }
}

