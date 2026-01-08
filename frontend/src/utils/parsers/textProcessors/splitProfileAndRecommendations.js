/**
 * Split streamed text into profile and recommendations sections
 * Follows contract: profile ends with ---PROFILE_END---
 * 
 * @param {string} text - The full streamed text
 * @returns {Object} Object with profileAnalysis and recommendations strings
 */
export function splitProfileAndRecommendations(text = "") {
  const SPLIT_TOKEN = "\n\n---PROFILE_END---\n\n";
  const ALT_SPLIT_TOKEN = "---PROFILE_END---";

  let profileAnalysis = "";
  let recommendations = "";

  // Try primary split token first
  if (text.includes(SPLIT_TOKEN)) {
    const parts = text.split(SPLIT_TOKEN);
    profileAnalysis = parts[0]?.trim() || "";
    recommendations = parts.slice(1).join(SPLIT_TOKEN).trim();
  } else if (text.includes(ALT_SPLIT_TOKEN)) {
    // Try alternative format (without newlines)
    const parts = text.split(ALT_SPLIT_TOKEN);
    profileAnalysis = parts[0]?.trim() || "";
    recommendations = parts.slice(1).join(ALT_SPLIT_TOKEN).trim();
  } else {
    // No separator found - try to find recommendation markers
    const recMarkers = [
      "### IDEA_1",
      "### IDEA_",
      "\n\n## SECTION 1:",
      "\n\n## IDEA RESEARCH REPORT",
    ];

    let splitPoint = -1;
    for (const marker of recMarkers) {
      const idx = text.indexOf(marker);
      if (idx > 0 && (splitPoint === -1 || idx < splitPoint)) {
        splitPoint = idx;
      }
    }

    if (splitPoint > 0) {
      profileAnalysis = text.substring(0, splitPoint).trim();
      recommendations = text.substring(splitPoint).trim();
    } else {
      // Can't determine split - treat all as profile (safer)
      profileAnalysis = text;
      recommendations = "";
    }
  }

  return {
    profileAnalysis,
    recommendations
  };
}

