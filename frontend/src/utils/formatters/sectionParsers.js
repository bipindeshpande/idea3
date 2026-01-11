import { logToFile, logSectionToFile } from "../fileLogger.js";
import { personalizeCopy } from "./textFormatters.js";
import { extractListFromText } from "./textFormatters.js";
import { formatSectionHeading } from "./textFormatters.js";
import { truncateText } from "./textFormatters.js";

/**
 * Split idea body into sections
 */
export function splitIdeaSections(body = "") {
  if (!body) {
    const msg = "splitIdeaSections: Empty body provided";
    console.log(msg);
    logToFile(msg, "WARN", "splitIdeaSections");
    return {};
  }
  
  // Fixed section headings mapping (exact match only)
  // FIX #2: Support both lowercase and title case headings from backend
  const FIXED_HEADINGS = {
    "### intro": "intro",
    "### Intro": "intro",
    "### why this idea fits you": "why_fits",
    "### Why this Idea Fits You": "why_fits",
    "### financial snapshot": "financial_snapshot",
    "### Financial Snapshot": "financial_snapshot",
    "### execution path": "execution_path",
    "### Execution Path": "execution_path",
    "### customer persona": "customer_persona",
    "### Customer Persona": "customer_persona",
    "### market opportunity": "market_opportunity",
    "### Market Opportunity": "market_opportunity",
    "### key risks & mitigations": "key_risks",
    "### Key Risks & Mitigations": "key_risks",
    "### validation questions": "validation_questions",
    "### Validation Questions": "validation_questions",
    "### immediate experiments": "immediate_experiments",
    "### Immediate Experiments": "immediate_experiments",
    "### immediate next steps": "immediate_next_steps",
    "### Immediate Next Steps": "immediate_next_steps",
    "### timeline & effort": "timeline_effort",
    "### Timeline & Effort": "timeline_effort",
    "### decision checklist": "decision_checklist",
    "### Decision Checklist": "decision_checklist",
    "### additional insights": "additional_insights",
    "### Additional Insights": "additional_insights",
  };
  
  const parseInfo = `Parsing body, length: ${body.length}\nFirst 500 chars: ${body.substring(0, 500)}`;
  console.log("splitIdeaSections: Parsing body, length:", body.length);
  console.log("splitIdeaSections: First 500 chars:", body.substring(0, 500));
  logToFile(parseInfo, "INFO", "splitIdeaSections");
  
  // Check if body contains section headers (enriched content) vs basic details (no headers)
  // Basic details format: **Summary:**, **Target Market:**, **Revenue Model:**, etc.
  // Enriched content format: ### Market Opportunity, ### Key Risks & Mitigations, etc.
  const hasSectionHeaders = /^###\s+(Market Opportunity|Key Risks|Immediate Experiments|Timeline & Effort|Decision Checklist|Additional Insights|Financial Snapshot|Execution Path|Customer Persona|Validation Questions)/im.test(body);
  const hasBasicDetailsFormat = /^\*\*Summary:\*\*|\*\*Target Market:\*\*|\*\*Revenue Model:\*\*/m.test(body);
  
  // If body contains basic details format but no section headers, don't try to parse sections
  // This is from details_markdown (basic idea info), not enriched content
  if (hasBasicDetailsFormat && !hasSectionHeaders) {
    const msg = "splitIdeaSections: Body contains basic details format (Summary, Target Market, etc.) but no section headers. This is not enriched content - skipping section parsing.";
    console.log(msg);
    logToFile(msg, "INFO", "splitIdeaSections");
    
    const emptyResult = {};
    const parseResult = `Body is basic details (not enriched), no sections to parse. Returning empty result.`;
    logSectionToFile("splitIdeaSections - PARSED RESULT", parseResult, "INFO", "splitIdeaSections");
    return emptyResult; // Return empty object - no sections to parse from basic details
  }
  
  const sections = {};
  let current = null;
  const lines = body.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // FIX #2: Check for exact markdown heading match (### Heading)
    // Support both ### Heading and ###Heading (with or without space)
    const headingMatch = trimmed.match(/^###\s*(.+)$/i);
    if (headingMatch) {
      const headingText = headingMatch[1].trim().toLowerCase();
      const fullHeading = `### ${headingText}`;
      console.log("splitIdeaSections: Found heading:", fullHeading, "| normalized:", headingText);
      logToFile(`Found heading: ${fullHeading}`, "DEBUG", "splitIdeaSections");
      
      // Find matching fixed heading (case-insensitive comparison)
      let found = false;
      for (const [fixedHeading, sectionKey] of Object.entries(FIXED_HEADINGS)) {
        const normalizedFixed = fixedHeading.replace(/^###\s*/i, "").toLowerCase();
        if (headingText === normalizedFixed) {
          current = sectionKey;
          sections[current] = sections[current] || [];
          console.log("splitIdeaSections: ✅ Matched heading to section:", sectionKey, "| heading:", headingText);
          logToFile(`Matched heading to section: ${sectionKey}`, "DEBUG", "splitIdeaSections");
          found = true;
          break;
        }
      }
      // If no match found, log warning and reset current
      if (!found) {
        const warnMsg = `No match for heading: ${headingText}, Available headings: ${Object.keys(FIXED_HEADINGS).join(", ")}`;
        console.warn("splitIdeaSections: ⚠️ No match for heading:", headingText, "| Available headings:", Object.keys(FIXED_HEADINGS));
        logToFile(warnMsg, "WARN", "splitIdeaSections");
        current = null; // Reset so content doesn't go to wrong section
      }
    } else if (trimmed.length > 0 && current) {
      // Add content to current section
      sections[current].push(line.replace(/\*\*/g, ""));
    }
  }
  
  // Convert arrays to strings and personalize
  const result = Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [
      key,
      personalizeCopy(Array.isArray(value) ? value.join("\n").trim() : (value || "").trim())
    ])
  );
  
  const sectionsWithContent = Object.keys(result).filter(k => result[k]);
  console.log("splitIdeaSections: Parsed sections with content:", sectionsWithContent);
  console.log("splitIdeaSections: Result keys:", Object.keys(result));
  
  const parseResult = `Parsed sections with content: ${sectionsWithContent.join(", ")}\nResult keys: ${Object.keys(result).join(", ")}\nFull result: ${JSON.stringify(result, null, 2)}`;
  logSectionToFile("splitIdeaSections - PARSED RESULT", parseResult, "INFO", "splitIdeaSections");
  
  return result;
}

/**
 * Extract why fit items from section text
 */
export function extractWhyFit(sectionText = "") {
  return extractListFromText(sectionText);
}

/**
 * Extract other section content (cleaned)
 */
export function extractOtherSection(sectionText = "") {
  if (!sectionText) return "";
  // Remove "- **Execution Path:** -" pattern and similar empty execution path markers
  let cleaned = sectionText
    .replace(/^-\s*\*\*Execution\s+Path\*\*:\s*-?\s*$/gim, "")
    .replace(/^-\s*\*\*execution\s+path\*\*:\s*-?\s*$/gim, "")
    .replace(/^\*\*Execution\s+Path\*\*:\s*-?\s*$/gim, "")
    .replace(/^\*\*execution\s+path\*\*:\s*-?\s*$/gim, "")
    .trim();
  return personalizeCopy(cleaned);
}

/**
 * Parse profile summary section
 */
export function parseProfileSummary(sectionText = "") {
  if (!sectionText) return [];

  const lines = sectionText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items = lines.length > 0 ? lines : extractListFromText(sectionText);
  const results = [];

  items.forEach((item) => {
    const cleaned = personalizeCopy(item.replace(/\*\*/g, ""));
    const colonIndex = cleaned.indexOf(":");
    if (colonIndex > 0) {
      const label = cleaned.slice(0, colonIndex).trim();
      const value = cleaned.slice(colonIndex + 1).trim();
      results.push({
        label: formatSectionHeading(label),
        value: value || "Not specified",
      });
    } else {
      results.push({
        label: "Insight",
        value: cleaned,
      });
    }
  });

  return results;
}

/**
 * Split full report into sections
 */
export function splitFullReportSections(markdown = "") {
  if (!markdown) return {};
  const sections = {};
  let current = "";
  markdown.split(/\r?\n/).forEach((line) => {
    // Match both ### and #### headings
    const headingMatch = line.trim().match(/^#{3,4}\s+(.+)$/);
    if (headingMatch) {
      current = headingMatch[1].trim().toLowerCase();
      sections[current] = [];
    } else if (current) {
      sections[current].push(line);
    }
  });
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, personalizeCopy(value.join("\n").trim())])
  );
}

/**
 * Helper: Parse matrix attributes from text
 */
function parseMatrixAttributes(attribute, row) {
  const segments = attribute.split(/\s*\|\s*/);
  segments.forEach((segment) => {
    const [rawKey, rawValue] = segment.split(/[:\-–—]/, 2);
    if (!rawKey) return;
    const key = rawKey.trim().toLowerCase();
    const value = rawValue ? rawValue.trim() : "";
    if (key.includes("goal")) {
      row.goal = value || row.goal;
    } else if (key.includes("time")) {
      row.time = value || row.time;
    } else if (key.includes("budget")) {
      row.budget = value || row.budget;
    } else if (key.includes("skill")) {
      row.skill = value || row.skill;
    } else if (key.includes("work")) {
      row.workStyle = value || row.workStyle;
    } else if (!row.notes) {
      row.notes = segment.trim();
    } else {
      row.notes = `${row.notes}; ${segment.trim()}`;
    }
  });
}

/**
 * Helper: Sanitize matrix notes
 */
function sanitizeMatrixNotes(notes = "") {
  if (!notes) return "";
  const stripped = notes
    .replace(/^#+\s+/gm, "") // Remove markdown headings
    .replace(/###\s+30\/60\/90\s+Day\s+Roadmap.*$/gmi, "") // Remove roadmap tables
    .replace(/###\s+Decision\s+Checklist.*$/gmi, "") // Remove decision checklist
    .replace(/\|[\s\-:]+\|/g, "") // Remove table separators
    .replace(/\|/g, " ") // Replace remaining pipes with spaces
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/Days\s*\|\s*Milestones/g, "") // Remove table headers
    .replace(/\d+-\d+\s*\|\s*[^\|]+/g, "") // Remove table rows (e.g., "0-30 | Define business model")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  return personalizeCopy(stripped);
}

/**
 * Parse recommendation matrix from text
 */
export function parseRecommendationMatrix(matrixText = "") {
  if (!matrixText) return [];
  
  const lines = matrixText.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  const rows = [];
  
  // First, try to parse as markdown table (primary format)
  let tableStartIndex = -1;
  let headerLine = null;
  let separatorLine = null;
  
  // Find the table header and separator
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if this looks like a table header (contains | and common column names)
    if (line.includes('|') && (
      line.toLowerCase().includes('idea') || 
      line.toLowerCase().includes('goal') || 
      line.toLowerCase().includes('time') || 
      line.toLowerCase().includes('budget')
    )) {
      headerLine = line;
      // Check if next line is a separator
      if (i + 1 < lines.length && lines[i + 1].match(/^\|[\s\-:]+\|/)) {
        separatorLine = lines[i + 1];
        tableStartIndex = i;
        break;
      }
    }
  }
  
  // If we found a markdown table, parse it
  if (tableStartIndex >= 0 && headerLine) {
    const headerCells = headerLine.split('|').map(c => c.trim()).filter(c => c);
    
    // Find column indices
    const ideaCol = headerCells.findIndex(c => c.toLowerCase().includes('idea'));
    const goalCol = headerCells.findIndex(c => c.toLowerCase().includes('goal') || c.toLowerCase().includes('alignment'));
    const timeCol = headerCells.findIndex(c => c.toLowerCase().includes('time') || c.toLowerCase().includes('commitment'));
    const budgetCol = headerCells.findIndex(c => c.toLowerCase().includes('budget'));
    const skillCol = headerCells.findIndex(c => c.toLowerCase().includes('skill') || c.toLowerCase().includes('fit'));
    const workStyleCol = headerCells.findIndex(c => c.toLowerCase().includes('work') || c.toLowerCase().includes('style'));
    
    // Parse data rows (skip header and separator, stop at empty line or next heading)
    for (let i = tableStartIndex + 2; i < lines.length; i++) {
      const line = lines[i];
      
      // Stop if we hit a new section (heading) or empty line
      if (line.startsWith('#') || line.startsWith('###') || line === '') {
        break;
      }
      
      // Skip separator lines
      if (line.match(/^\|[\s\-:]+\|/)) continue;
      
      // Parse table row
      if (line.includes('|')) {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        
        if (cells.length > 0) {
          const idea = cells[ideaCol] || cells[0] || '';
          const goal = cells[goalCol] || '';
          const time = cells[timeCol] || '';
          const budget = cells[budgetCol] || '';
          const skill = cells[skillCol] || '';
          const workStyle = cells[workStyleCol] || '';
          
          // Extract idea number and name
          const ideaMatch = idea.match(/(\d+)\.\s*(.+)/) || idea.match(/\*\*(\d+)\.\s*(.+?)\*\*/);
          const order = ideaMatch ? parseInt(ideaMatch[1], 10) : rows.length + 1;
          const ideaName = ideaMatch ? ideaMatch[2] : idea.replace(/\*\*/g, '').trim();
          
          rows.push({
            order,
            idea: personalizeCopy(ideaName),
            goal: personalizeCopy(goal.replace(/\*\*/g, '').trim() || 'Strong'),
            time: personalizeCopy(time.replace(/\*\*/g, '').trim() || 'Aligned'),
            budget: personalizeCopy(budget.replace(/\*\*/g, '').trim() || 'Within range'),
            skill: personalizeCopy(skill.replace(/\*\*/g, '').trim() || 'Leverages strengths'),
            workStyle: personalizeCopy(workStyle.replace(/\*\*/g, '').trim() || 'Matches preferences'),
            notes: '', // Notes column not typically in the table
          });
        }
      }
    }
    
    if (rows.length > 0) {
      return rows;
    }
  }
  
  // Fallback: try to parse as bullet list format (legacy)
  let current = null;
  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Stop if we hit a new section
    if (trimmed.startsWith('#') || trimmed.startsWith('###')) {
      if (current) {
        rows.push(current);
        current = null;
      }
      return;
    }
    
    if (/^[-*+]\s*\*\*(.+?)\*\*/.test(trimmed)) {
      if (current) {
        rows.push(current);
      }
      const ideaMatch = trimmed.match(/^[-*+]\s*\*\*(.+?)\*\*\s*[:\-–—]?\s*(.*)$/u);
      const ideaText = ideaMatch ? ideaMatch[1].trim() : trimmed.replace(/^[-*+]\s*/, "").trim();
      const ideaNumMatch = ideaText.match(/(\d+)\.\s*(.+)/);
      const order = ideaNumMatch ? parseInt(ideaNumMatch[1], 10) : rows.length + 1;
      const ideaName = ideaNumMatch ? ideaNumMatch[2] : ideaText;
      
      current = {
        idea: ideaName,
        goal: "",
        time: "",
        budget: "",
        skill: "",
        workStyle: "",
        notes: "",
        order,
      };
      const extra = ideaMatch && ideaMatch[2] ? ideaMatch[2].trim() : "";
      if (extra) {
        parseMatrixAttributes(extra, current);
      }
    } else if (/^[-*+]\s+/.test(trimmed) && current) {
      const attribute = trimmed.replace(/^[-*+]\s+/, "");
      parseMatrixAttributes(attribute, current);
    } else if (trimmed && current && !trimmed.match(/^\|[\s\-:]+\|/)) {
      // Don't add table separators or markdown table content to notes
      if (!trimmed.startsWith('|') || trimmed.split('|').length <= 2) {
        current.notes = current.notes ? `${current.notes} ${trimmed}` : trimmed;
      }
    }
  });

  if (current) {
    rows.push(current);
  }

  return rows.map((row, idx) => ({
    order: row.order ?? idx + 1,
    idea: personalizeCopy(row.idea),
    goal: row.goal || "Strong",
    time: row.time || "Aligned",
    budget: row.budget || "Within range",
    skill: row.skill || "Leverages strengths",
    workStyle: row.workStyle || "Matches preferences",
    notes: truncateText(sanitizeMatrixNotes(row.notes), 160),
  }));
}
