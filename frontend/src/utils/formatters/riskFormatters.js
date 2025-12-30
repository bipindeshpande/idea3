import { personalizeCopy } from "./textFormatters.js";
import { extractListFromText } from "./textFormatters.js";

/**
 * Parse risk rows from section text
 */
export function parseRiskRows(sectionText = "") {
  if (!sectionText) return [];
  
  // First, check if this is a markdown table format
  const tableRows = sectionText.match(/\|.*\|/g);
  if (tableRows && tableRows.length >= 2) {
    // Skip header row and separator row
    const dataRows = tableRows.slice(2);
    const results = [];
    
    for (const row of dataRows) {
      const cells = row.split("|").map(cell => cell.trim()).filter(cell => cell);
      
      if (cells.length >= 3) {
        // Table format: [Risk Category, Risk Description, Mitigation Strategies]
        const riskCategory = cells[0] || "";
        const riskDescription = cells[1] || "";
        const mitigation = cells[2] || "";
        
        // Combine category and description for the risk text
        let riskText = riskCategory;
        if (riskDescription && riskDescription !== riskCategory) {
          riskText = riskCategory ? `${riskCategory}: ${riskDescription}` : riskDescription;
        }
        
        // Try to extract severity from the risk text or description
        let severity = "MEDIUM";
        const severityMatch =
          (riskText + " " + riskDescription).match(/\b(severe|critical|extreme|high)\b/i) ||
          (riskText + " " + riskDescription).match(/\b(medium|moderate)\b/i) ||
          (riskText + " " + riskDescription).match(/\b(low|minor)\b/i);
        if (severityMatch) {
          const severityText = severityMatch[0].toLowerCase();
          if (severityText.match(/\b(severe|critical|extreme|high)\b/i)) {
            severity = "HIGH";
          } else if (severityText.match(/\b(low|minor)\b/i)) {
            severity = "LOW";
          }
        }
        
        results.push({
          risk: personalizeCopy(riskText.replace(/\*\*/g, "").trim()),
          severity,
          mitigation: personalizeCopy(mitigation.replace(/\*\*/g, "").trim() || "Create a mitigation experiment to reduce this risk within the next sprint."),
        });
      } else if (cells.length === 2) {
        // Two-column format: [Risk, Mitigation]
        const riskText = cells[0] || "";
        const mitigation = cells[1] || "";
        
        // Try to extract severity
        let severity = "MEDIUM";
        const severityMatch =
          riskText.match(/\b(severe|critical|extreme|high)\b/i) ||
          riskText.match(/\b(medium|moderate)\b/i) ||
          riskText.match(/\b(low|minor)\b/i);
        if (severityMatch) {
          const severityText = severityMatch[0].toLowerCase();
          if (severityText.match(/\b(severe|critical|extreme|high)\b/i)) {
            severity = "HIGH";
          } else if (severityText.match(/\b(low|minor)\b/i)) {
            severity = "LOW";
          }
        }
        
        results.push({
          risk: personalizeCopy(riskText.replace(/\*\*/g, "").trim()),
          severity,
          mitigation: personalizeCopy(mitigation.replace(/\*\*/g, "").trim() || "Create a mitigation experiment to reduce this risk within the next sprint."),
        });
      }
    }
    
    if (results.length > 0) {
      return results;
    }
  }
  
  // Fall back to list format parsing
  const items = extractListFromText(sectionText);
  return items.map((item) => {
    // Clean up the item - remove markdown bold markers
    let cleaned = item.replace(/\*\*/g, "").trim();
    
    // Try to parse format: "Risk Name (Severity severity): Mitigation"
    // Example: "Market saturation (Medium severity): Focus on a specific niche"
    const severityInParensMatch = cleaned.match(/\(([^)]*severity[^)]*)\)/i);
    let severity = "MEDIUM";
    let riskText = cleaned;
    let mitigation = "";
    
    if (severityInParensMatch) {
      // Extract severity from parentheses
      const severityText = severityInParensMatch[1];
      if (severityText.match(/\b(severe|critical|extreme|high)\b/i)) {
        severity = "HIGH";
      } else if (severityText.match(/\b(medium|moderate)\b/i)) {
        severity = "MEDIUM";
      } else if (severityText.match(/\b(low|minor)\b/i)) {
        severity = "LOW";
      }
      
      // Split on the severity parentheses to get risk and mitigation
      const parts = cleaned.split(/\([^)]*severity[^)]*\)/i);
      if (parts.length >= 2) {
        riskText = parts[0].trim();
        mitigation = parts.slice(1).join(":").replace(/^:\s*/, "").trim();
      }
    } else {
      // Try to find severity in the text without parentheses
      const severityMatch =
        cleaned.match(/\b(severe|critical|extreme|high)\b/i) ||
        cleaned.match(/\b(medium|moderate)\b/i) ||
        cleaned.match(/\b(low|minor)\b/i);
      severity = severityMatch ? severityMatch[0].toUpperCase() : "MEDIUM";
      
      // Try to find mitigation with colon separator
      const colonIndex = cleaned.indexOf(":");
      if (colonIndex > 0) {
        riskText = cleaned.slice(0, colonIndex).trim();
        mitigation = cleaned.slice(colonIndex + 1).trim();
      } else {
        // Try em dash or regular dash
        if (cleaned.includes("—") || cleaned.includes("–")) {
          const split = cleaned.split(/[—–]/u);
          riskText = split[0].trim();
          mitigation = split.slice(1).join("—").trim();
        } else if (cleaned.includes(" - ")) {
          const split = cleaned.split(" - ");
          riskText = split[0].trim();
          mitigation = split.slice(1).join(" - ").trim();
        } else {
          // Try mitigation keyword
          const mitigationMatch = cleaned.match(/mitigation[:\-]?\s*(.+)$/i);
          if (mitigationMatch) {
            riskText = cleaned.slice(0, mitigationMatch.index).trim().replace(/[—–-]\s*$/u, "");
            mitigation = mitigationMatch[1].trim();
          } else {
            riskText = cleaned;
          }
        }
      }
    }
    
    // Clean up risk text - remove any remaining markdown or extra formatting
    riskText = riskText.replace(/^\*\*|\*\*$/g, "").replace(/^[-•]\s*/, "").trim();
    
    // If no mitigation found, provide default
    if (!mitigation || mitigation.length === 0) {
      mitigation = "Create a mitigation experiment to reduce this risk within the next sprint.";
    }
    
    // Clean up mitigation text
    mitigation = mitigation.replace(/^:\s*/, "").trim();

    return {
      risk: personalizeCopy(riskText),
      severity,
      mitigation: personalizeCopy(mitigation),
    };
  });
}
