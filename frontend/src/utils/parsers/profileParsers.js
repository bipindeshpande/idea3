import { extractProfileJSON } from "./index.js";

/**
 * Format text as bullet points
 * @param {string} text - Text to format
 * @returns {Array<string>} Array of bullet point strings
 */
function formatAsBullets(text) {
  if (!text) return [];

  // If already formatted as bullets, split by newlines
  if (text.includes("- ") || text.includes("* ") || text.includes("• ")) {
    return text.split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Normalize bullet format
        line = line.replace(/^[*•]\s+/, "- ");
        if (!line.startsWith("- ")) {
          line = "- " + line;
        }
        return line;
      });
  }

  // Split by newlines, periods, semicolons, or commas
  const lines = text
    .split(/[\n.;]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.map(line => {
    line = line.replace(/\.$/, ""); // Remove trailing period
    return `- ${line}`;
  });
}

/**
 * Parse profile analysis text into structured sections
 * 
 * @param {string} text - Profile analysis text (may contain JSON delimiters)
 * @returns {Array<Object>} Array of section objects with title, level, content, subsections
 */
export function parseProfileSections(text = "") {
  if (!text) return [];

  // Check if text is too short to contain complete profile data
  const MIN_PROFILE_LENGTH = 100; // Minimum reasonable length for profile JSON
  if (text.length < MIN_PROFILE_LENGTH) {
    // Data is incomplete - don't show error, just return empty
    return [];
  }

  // Use contract-compliant parser to extract profile JSON
  const profileData = extractProfileJSON(text);
  
  if (!profileData) {
    // Only log warning if we have enough data but parsing failed
    if (text.length >= MIN_PROFILE_LENGTH) {
      console.warn("parseProfileSections - Could not extract profile JSON", {
        textLength: text.length,
        hasStartDelimiter: text.includes("---PROFILE_ANALYSIS_START---"),
        hasEndDelimiter: text.includes("---PROFILE_ANALYSIS_END---"),
      });
    }
    return [];
  }

  // Render the six fields as text sections
  const sections = [];

  if (profileData.core_motivations) {
    sections.push({
      title: "Core Motivations",
      level: 2,
      content: formatAsBullets(profileData.core_motivations),
      subsections: [],
    });
  }

  if (profileData.operating_constraints) {
    sections.push({
      title: "Operating Constraints",
      level: 2,
      content: formatAsBullets(profileData.operating_constraints),
      subsections: [],
    });
  }

  if (profileData.strengths_and_capabilities) {
    sections.push({
      title: "Strengths and Capabilities",
      level: 2,
      content: formatAsBullets(profileData.strengths_and_capabilities),
      subsections: [],
    });
  }

  if (profileData.strategic_considerations) {
    sections.push({
      title: "Strategic Considerations",
      level: 2,
      content: formatAsBullets(profileData.strategic_considerations),
      subsections: [],
    });
  }

  if (profileData.viability_red_flags) {
    sections.push({
      title: "Viability Red Flags",
      level: 2,
      content: formatAsBullets(profileData.viability_red_flags),
      subsections: [],
    });
  }

  if (profileData.pathway_recommendation) {
    sections.push({
      title: "Pathway Recommendation",
      level: 2,
      content: formatAsBullets(profileData.pathway_recommendation),
      subsections: [],
    });
  }

  return sections;
}
