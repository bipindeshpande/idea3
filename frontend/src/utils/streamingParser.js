/**
 * Streaming Parser for SSE Contract
 * 
 * This parser strictly follows the SSE streaming contract:
 * - Profile markers are complete chunks
 * - IDEA headers (### IDEA_N) are complete chunks
 * - Field:value pairs are complete chunks
 * - Profile JSON is extracted from between markers
 */

// Generate UUID v4 for unique idea IDs
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Deep clone an object to prevent reference reuse
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
}

// Filter out duplicate ideas based on title and summary
function filterUniqueIdeas(ideas) {
  if (!ideas || ideas.length === 0) return [];
  
  const seenTitles = new Set();
  const seenSummaries = new Set();
  const uniqueIdeas = [];
  
  for (const idea of ideas) {
    // Deep clone to prevent reference reuse
    const ideaCopy = deepClone(idea);
    
    const title = (ideaCopy.title || '').trim().toLowerCase();
    const summary = (ideaCopy.summary || '').trim().toLowerCase();
    
    // Skip if title or summary is empty
    if (!title || !summary) {
      console.warn(`[parseStructuredIdeas] Skipping idea with empty title or summary: id=${ideaCopy.id}`);
      continue;
    }
    
    // Skip if we've seen this exact title or summary before
    if (seenTitles.has(title)) {
      console.warn(`[parseStructuredIdeas] Skipping duplicate title: '${title.substring(0, 50)}...' (id=${ideaCopy.id})`);
      continue;
    }
    
    if (seenSummaries.has(summary)) {
      console.warn(`[parseStructuredIdeas] Skipping duplicate summary: '${summary.substring(0, 50)}...' (id=${ideaCopy.id})`);
      continue;
    }
    
    // Add to unique set
    seenTitles.add(title);
    seenSummaries.add(summary);
    uniqueIdeas.push(ideaCopy);
  }
  
  return uniqueIdeas;
}

/**
 * Parse complete streamed data into structured format
 * Accumulates all chunks and parses profile + ideas when complete
 * 
 * @param {string} buffer - Complete accumulated stream buffer
 * @returns {Object} { profile: {...}, ideas: [...] }
 */
export function parseStreamedData(buffer = "") {
  const result = {
    profile: null,
    ideas: []
  };

  if (!buffer) return result;

  // 1. Parse profile block - only when both markers are present
  const START_DELIMITER = "---PROFILE_ANALYSIS_START---";
  const END_DELIMITER = "---PROFILE_ANALYSIS_END---";
  
  const startIdx = buffer.indexOf(START_DELIMITER);
  const endIdx = buffer.indexOf(END_DELIMITER);
  
  if (startIdx >= 0 && endIdx > startIdx) {
    // Extract JSON string between delimiters
    const delimiterEnd = startIdx + START_DELIMITER.length;
    let jsonText = buffer.substring(delimiterEnd, endIdx).trim();
    
    // Extract JSON object using balanced brace matching
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
    
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      try {
        result.profile = JSON.parse(jsonText);
      } catch (e) {
        console.error("parseStreamedData - Failed to parse profile JSON:", e);
      }
    }
  }

  // 2. Parse IDEA blocks using required regex: /(?=### IDEA_\d+)/g
  // This lookahead keeps headers attached to their block
  const ideaBlocks = buffer.split(/(?=### IDEA_\d+)/g);
  
  for (const block of ideaBlocks) {
    const trimmed = block.trim();
    if (!trimmed || !trimmed.startsWith("### IDEA_")) {
      continue;
    }
    
    // Extract header: /^### IDEA_(\d+)/
    const headerMatch = trimmed.match(/^### IDEA_(\d+)/);
    if (!headerMatch) {
      continue;
    }
    
    const ideaNumber = parseInt(headerMatch[1], 10);
    // Generate unique UUID for each idea
    const idea = {
      id: generateUUID(), // Use UUID instead of ideaNumber
      index: ideaNumber, // Keep index for display/ordering
      title: "",
      summary: "",
      target_market: "",
      revenue_model: "",
      validation_score: "",
      timeline: "",
      why_this_fits: "",
      body: ""
    };
    
    // Extract content after header
    const contentStart = headerMatch[0].length;
    const content = trimmed.substring(contentStart).trim();
    
    // Parse field:value pairs - handle partial chunks
    // Pattern: /^(\w+):\s*(.+)$/ per line
    const lines = content.split(/\n/);
    let currentField = null;
    let currentValue = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Ignore blank lines
      if (!trimmedLine) {
        if (currentField) {
          currentValue.push('');
        }
        continue;
      }
      
      // Check if line starts a new field: /^(\w+):\s*(.+)$/
      const fieldMatch = trimmedLine.match(/^(\w+):\s*(.+)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].toLowerCase();
        const fieldValue = fieldMatch[2].trim();
        
        // Save previous field if any
        if (currentField && currentValue.length > 0) {
          let value = currentValue.join('\n').trim();
          // Remove trailing period if present
          value = value.replace(/\.\s*$/, '').trim();
          if (idea.hasOwnProperty(currentField)) {
            idea[currentField] = value;
          }
        }
        
        // Start new field
        currentField = fieldName;
        currentValue = [fieldValue];
      } else if (currentField) {
        // Continue accumulating current field value (handles multi-line values)
        currentValue.push(trimmedLine);
      }
    }
    
    // Save last field
    if (currentField && currentValue.length > 0) {
      let value = currentValue.join('\n').trim();
      value = value.replace(/\.\s*$/, '').trim();
      if (idea.hasOwnProperty(currentField)) {
        idea[currentField] = value;
      }
    }
    
    // Only add idea if it has at least a title
    if (idea.title) {
      // Deep clone to prevent reference reuse
      result.ideas.push(deepClone(idea));
    }
  }
  
  // Apply uniqueness filter
  result.ideas = filterUniqueIdeas(result.ideas);
  
  // Log results for verification
  console.log(`[parseStreamedData] Parsed ${result.ideas.length} unique ideas`);
  result.ideas.forEach((idea, idx) => {
    console.log(`[parseStreamedData] Idea ${idx + 1}: id=${idea.id}, title=${(idea.title || '').substring(0, 50)}, summary=${(idea.summary || '').substring(0, 50)}`);
  });
  
  return result;
}

/**
 * Parse structured IDEA blocks from streamed text
 * Follows contract format: ### IDEA_N followed by field:value pairs
 * 
 * Contract format:
 * - Header: "### IDEA_1\n" (complete chunk)
 * - Fields: "title: Eco-Friendly Packaging Solutions.\n" (complete chunks)
 * - Fields may be on separate lines or same line
 * 
 * @param {string} text - The streamed text containing IDEA blocks
 * @returns {Array} Array of parsed IDEA objects
 */
export function parseStructuredIdeas(text = "") {
  if (!text) return [];

  const ideas = [];
  
  // Split by IDEA headers using required regex: /(?=### IDEA_\d+)/g
  // This lookahead keeps headers attached to their block
  const ideaBlocks = text.split(/(?=### IDEA_\d+)/g);
  
  // Process each IDEA block
  for (const block of ideaBlocks) {
    const trimmed = block.trim();
    if (!trimmed || !trimmed.startsWith("### IDEA_")) {
      continue;
    }
    
    // Extract header: /^### IDEA_(\d+)/
    const headerMatch = trimmed.match(/^### IDEA_(\d+)/);
    if (!headerMatch) {
      continue;
    }
    
    const ideaNumber = parseInt(headerMatch[1], 10);
    
    // Extract content after header
    const contentStart = headerMatch[0].length;
    const ideaContent = trimmed.substring(contentStart).trim();
    
    // Generate unique UUID for each idea
    const idea = {
      id: generateUUID(), // Use UUID instead of ideaNumber
      index: ideaNumber, // Keep index for display/ordering
      title: "",
      summary: "",
      target_market: "",
      revenue_model: "",
      validation_score: "",
      timeline: "",
      why_this_fits: "",
      body: ""
    };
    
    // Parse field:value pairs from the content
    // Pattern: /^(\w+):\s*(.+)$/ per line
    const lines = ideaContent.split(/\n/);
    let currentField = null;
    let currentValue = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Ignore blank lines
      if (!trimmedLine) {
        if (currentField) {
          currentValue.push('');
        }
        continue;
      }
      
      // Check if line starts a new field: /^(\w+):\s*(.+)$/
      const fieldMatch = trimmedLine.match(/^(\w+):\s*(.+)$/);
      if (fieldMatch) {
        const fieldName = fieldMatch[1].toLowerCase();
        const fieldValue = fieldMatch[2].trim();
        
        // Save previous field if any
        if (currentField && currentValue.length > 0) {
          let value = currentValue.join('\n').trim();
          // Remove trailing period if present
          value = value.replace(/\.\s*$/, '').trim();
          if (idea.hasOwnProperty(currentField)) {
            idea[currentField] = value;
          }
        }
        
        // Start new field
        currentField = fieldName;
        currentValue = [fieldValue];
      } else if (currentField) {
        // Continue accumulating current field value (handles multi-line values and partial chunks)
        currentValue.push(trimmedLine);
      }
    }
    
    // Save last field
    if (currentField && currentValue.length > 0) {
      let value = currentValue.join('\n').trim();
      value = value.replace(/\.\s*$/, '').trim();
      if (idea.hasOwnProperty(currentField)) {
        idea[currentField] = value;
      }
    }
    
    // Only add idea if it has at least a title
    if (idea.title) {
      // Deep clone to prevent reference reuse
      ideas.push(deepClone(idea));
    }
  }
  
  // Apply uniqueness filter
  const uniqueIdeas = filterUniqueIdeas(ideas);
  
  // Log results for verification
  console.log(`[parseStructuredIdeas] Parsed ${ideas.length} ideas, ${uniqueIdeas.length} unique after filtering`);
  uniqueIdeas.forEach((idea, idx) => {
    console.log(`[parseStructuredIdeas] Idea ${idx + 1}: id=${idea.id}, title=${(idea.title || '').substring(0, 50)}, summary=${(idea.summary || '').substring(0, 50)}`);
  });
  
  return uniqueIdeas;
}

/**
 * Extract profile JSON from streamed text
 * Follows contract: ---PROFILE_ANALYSIS_START--- ... JSON ... ---PROFILE_ANALYSIS_END---
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

