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

// Filter out duplicate ideas based on title and summary, and fix duplicate IDs
function filterUniqueIdeas(ideas) {
 if (!ideas || ideas.length === 0) return [];
 
 const seenTitles = new Set();
 const seenSummaries = new Set();
 const seenIds = new Map(); // Track ID occurrences
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
 
 // Handle duplicate IDs by appending suffix
 const originalId = ideaCopy.id;
 if (seenIds.has(originalId)) {
 const count = seenIds.get(originalId);
 seenIds.set(originalId, count + 1);
 ideaCopy.id = `${originalId}-${count + 1}`;
 console.warn(`[parseStructuredIdeas] Duplicate ID detected: ${originalId}, renamed to ${ideaCopy.id}`);
 } else {
 seenIds.set(originalId, 1);
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
 * Fix concatenated text by adding spaces between words
 * Detects patterns like "HelloWorld" and converts to "Hello World"
 */
function fixConcatenatedText(text) {
 if (!text) return text;
 
 // Pattern: lowercase letter followed by uppercase letter = word boundary
 let fixed = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
 
 // Pattern: number followed by letter = word boundary
 fixed = fixed.replace(/(\d)([A-Za-z])/g, '$1 $2');
 fixed = fixed.replace(/([A-Za-z])(\d)/g, '$1 $2');
 
 // Pattern: special characters that should have spaces around them
 fixed = fixed.replace(/([a-zA-Z0-9])([:;])([a-zA-Z])/g, '$1$2 $3');
 
 // Pattern: multiple consecutive capital letters followed by lowercase = acronym
 fixed = fixed.replace(/([A-Z]{2,})([a-z])/g, '$1 $2');
 
 return fixed;
}

/**
 * Unified parser for IDEA blocks from streamed text or markdown
 * Tries structured format first, then falls back to various markdown patterns
 * 
 * @param {string} text - The streamed text or markdown containing IDEA blocks
 * @param {number} limit - Maximum number of ideas to return (default: no limit)
 * @returns {Array} Array of parsed IDEA objects
 */
export function parseStructuredIdeas(text = "", limit = null) {
 if (!text) return [];

 // Fix concatenated text before parsing
 text = fixConcatenatedText(text);

 // Debug logging (only in development)
 if (process.env.NODE_ENV === 'development') {
 console.log('[parseStructuredIdeas] Text preview:', text.substring(0, 500));
 }

 const ideas = [];
 
 // PRIORITY 1: Try structured format (### IDEA_N with field:value pairs)
 // Split by IDEA headers using required regex: /(?=### IDEA_\d+)/g
 const ideaBlocks = text.split(/(?=### IDEA_\d+)/g);

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
 id: generateUUID(),
 index: ideaNumber,
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
 const lines = ideaContent.split(/\n/);
 let currentField = null;
 let currentValue = [];

 for (const line of lines) {
 const trimmedLine = line.trim();

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
 value = value.replace(/\.\s*$/, '').trim();
 if (idea.hasOwnProperty(currentField)) {
 idea[currentField] = value;
 }
 }

 // Start new field
 currentField = fieldName;
 currentValue = [fieldValue];
 } else if (currentField) {
 // Continue accumulating current field value
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
 ideas.push(deepClone(idea));
 }
 }

 // If we found structured ideas, return them (with limit if specified)
 if (ideas.length > 0) {
 const uniqueIdeas = filterUniqueIdeas(ideas);
 if (limit) {
 return uniqueIdeas.slice(0, limit);
 }
 return uniqueIdeas;
 }

 // PRIORITY 2: Try alternative structured format (### IDEA_X with title: and summary: on separate lines)
 let ideaBlockRegex = /###\s*IDEA_(\d+)\s*\n([\s\S]*?)(?=###\s*IDEA_\d+|$)/g;
 let ideaBlockMatches = [...text.matchAll(ideaBlockRegex)];

 if (ideaBlockMatches.length > 0) {
 for (const match of ideaBlockMatches) {
 const index = parseInt(match[1], 10);
 const blockContent = match[2].trim();

 // Extract title and summary from key: value format
 const titleMatch = blockContent.match(/title:\s*(.+?)(?:\n|$)/i);
 const summaryMatch = blockContent.match(/summary:\s*(.+?)(?:\n|$)/i);
 const targetMarketMatch = blockContent.match(/target_market:\s*(.+?)(?:\n|$)/i);
 const revenueModelMatch = blockContent.match(/revenue_model:\s*(.+?)(?:\n|$)/i);

 const title = titleMatch ? titleMatch[1].trim() : '';
 const summary = summaryMatch ? summaryMatch[1].trim() : '';

 if (title) {
 ideas.push({
 id: generateUUID(),
 index,
 title: title,
 summary: summary || title,
 body: blockContent,
 fullText: match[0],
 target_market: targetMarketMatch ? targetMarketMatch[1].trim() : '',
 revenue_model: revenueModelMatch ? revenueModelMatch[1].trim() : '',
 });
 }
 }

 if (ideas.length > 0) {
 const uniqueIdeas = filterUniqueIdeas(ideas);
 if (limit) {
 return uniqueIdeas.slice(0, limit);
 }
 return uniqueIdeas;
 }
 }

 // PRIORITY 3: Fallback to markdown patterns (numbered lists, headers, etc.)
 // Try multiple patterns to find ideas
 let headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*(?:\*\*(.+?)\*\*|([^\n]+))/g;
 let matches = [...text.matchAll(headingRegex)];

 // Pattern 1a: More flexible - allow for extra spaces or formatting
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s+\*\*([^*]+?)\*\*/g;
 matches = [...text.matchAll(headingRegex)];
 }

 // Pattern 1b: Also try with em dash or other separators
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*[-–]\s*(?:\*\*(.+?)\*\*|([^\n]+))/g;
 matches = [...text.matchAll(headingRegex)];
 }

 // Pattern 1c: Try with colon
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*(?:\*\*(.+?)\*\*:|([^:\n]+):)/g;
 matches = [...text.matchAll(headingRegex)];
 }

 // Pattern 2: If no matches, try just numbered: "1. Idea Name" (without bold)
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s+([^\n]+)/g;
 matches = [...text.matchAll(headingRegex)];
 }

 // Pattern 2b: Try numbered with dash
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(?:###\s*)?(\d+)\.\s*[-–]\s+([^\n]+)/g;
 matches = [...text.matchAll(headingRegex)];
 }

 // Pattern 3: Try markdown headers: "### Idea Name" or "## Idea Name"
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)(#{2,3})\s+([^\n]+)/g;
 const headerMatches = [...text.matchAll(headingRegex)];
 // Filter out common non-idea headers
 const filteredHeaders = headerMatches.filter(match => {
 const title = match[2].toLowerCase().trim();
 const excludePatterns = [
 'recommendation matrix', 'financial outlook', 'risk radar', 'customer persona',
 'validation questions', '30/60/90', 'roadmap', 'decision checklist',
 'comprehensive recommendation report', 'profile analysis', 'research'
 ];
 return !excludePatterns.some(pattern => title.includes(pattern));
 });
 // Assign sequential numbers to header-based matches
 matches = filteredHeaders.map((match, idx) => {
 const newMatch = [...match];
 newMatch[1] = String(idx + 1);
 newMatch[2] = match[2];
 newMatch.index = match.index;
 return newMatch;
 });
 }

 // Pattern 4: Try finding any bold text that looks like a title
 if (matches.length === 0) {
 headingRegex = /(?:^|\n)\*\*([^*]+?)\*\*/g;
 const boldMatches = [...text.matchAll(headingRegex)];
 matches = boldMatches
 .filter(match => {
 const title = match[1].trim();
 const titleLower = title.toLowerCase();
 const excludePatterns = [
 'recommendation matrix', 'financial outlook', 'risk radar', 'customer persona',
 'validation questions', '30/60/90', 'roadmap', 'decision checklist',
 'startup costs', 'monthly operating', 'revenue potential', 'breakeven',
 'primary', 'secondary', 'days', 'mitigation'
 ];
 return title.length < 100 && 
 title.length > 3 && 
 !title.match(/^(and|or|the|a|an)\s/i) &&
 !excludePatterns.some(pattern => titleLower.includes(pattern));
 })
 .slice(0, limit || 10)
 .map((match, idx) => {
 const newMatch = [...match];
 newMatch[1] = String(idx + 1);
 newMatch[2] = match[1];
 newMatch.index = match.index;
 return newMatch;
 });
 }

 // Pattern 5: Try to find any lines that look like idea titles
 if (matches.length === 0) {
 const lines = text.split(/\n/);
 const potentialTitles = [];
 for (let i = 0; i < lines.length; i++) {
 const line = lines[i].trim();
 if (
 line.length >= 10 &&
 line.length <= 80 &&
 /^[A-Z]/.test(line) &&
 !line.match(/^(#{1,6}|[-*+]|\d+\.)\s/) &&
 !line.match(/^(The|This|That|These|Those|And|Or|But)\s/i) &&
 lines[i + 1] && lines[i + 1].trim().length > 20
 ) {
 potentialTitles.push({
 index: i,
 title: line,
 matchIndex: text.indexOf(line),
 });
 }
 }

 if (potentialTitles.length > 0) {
 matches = potentialTitles.slice(0, limit || 10).map((item, idx) => {
 const newMatch = [];
 newMatch[1] = String(idx + 1);
 newMatch[2] = item.title;
 newMatch.index = item.matchIndex;
 return newMatch;
 });
 }
 }

 // Pattern 6: Last resort - split by major sections
 if (matches.length === 0 && text.length > 200) {
 const sections = text.split(/\n\s*\n\s*\n/).filter(s => {
 const trimmed = s.trim();
 if (trimmed.length < 50) return false;
 const lower = trimmed.toLowerCase();
 const excludePatterns = [
 'recommendation matrix', 'financial outlook', 'risk radar', 'customer persona',
 'validation questions', '30/60/90', 'roadmap', 'decision checklist'
 ];
 return !excludePatterns.some(pattern => lower.includes(pattern));
 });
 if (sections.length >= 2) {
 matches = sections.slice(0, limit || 10).map((section, idx) => {
 const firstLine = section.split('\n')[0].trim();
 const firstFewLines = section.split('\n').slice(0, 3).join(' ');
 const boldMatch = firstFewLines.match(/\*\*([^*]+?)\*\*/);
 const numberedMatch = firstFewLines.match(/(\d+)\.\s+([^\n]+)/);
 
 let title = `Idea ${idx + 1}`;
 if (boldMatch && boldMatch[1].trim().length < 80 && boldMatch[1].trim().length > 5) {
 title = boldMatch[1].trim();
 } else if (numberedMatch && numberedMatch[2].trim().length < 80) {
 title = numberedMatch[2].trim();
 } else if (firstLine.length < 80 && firstLine.length > 10) {
 title = firstLine.replace(/^[#*\-]\s*/, '').substring(0, 60);
 }
 
 const newMatch = [];
 newMatch[1] = String(idx + 1);
 newMatch[2] = title;
 newMatch.index = text.indexOf(section);
 return newMatch;
 });
 }
 }

 // Pattern 7: Very last resort - look for substantial paragraphs
 if (matches.length === 0 && text.length > 300) {
 const paragraphs = text.split(/\n\s*\n/).filter(p => {
 const trimmed = p.trim();
 return trimmed.length > 100 && 
 trimmed.length < 2000 &&
 !trimmed.match(/^(#{1,6}|###|##)\s+(recommendation|financial|risk|customer|validation|roadmap|decision)/i);
 });

 if (paragraphs.length >= 2) {
 matches = paragraphs.slice(0, limit || 10).map((para, idx) => {
 const firstSentence = para.match(/^([^.!?]+[.!?])/);
 const title = firstSentence 
 ? firstSentence[1].trim().substring(0, 60)
 : para.trim().substring(0, 60).replace(/\n/g, ' ');

 const newMatch = [];
 newMatch[1] = String(idx + 1);
 newMatch[2] = title;
 newMatch.index = text.indexOf(para);
 return newMatch;
 });
 }
 }

 // Process matches into ideas
 const maxIdeas = limit || matches.length;
 for (let i = 0; i < matches.length && ideas.length < maxIdeas; i += 1) {
 const match = matches[i];
 const index = parseInt(match[1], 10) || i + 1;
 const rawTitle = (match[2] || match[3] || "").trim();

 if (!rawTitle) continue;

 const nextMatchIndex = i + 1 < matches.length && matches[i + 1].index !== undefined 
 ? matches[i + 1].index 
 : text.length;
 const start = match.index !== undefined ? match.index + match[0].length : 0;
 const body = text.slice(start, nextMatchIndex).trim();
 const summaryMatch = body.replace(/\s+/g, " ").match(/([^.!?]+[.!?])/);
 let summary = summaryMatch ? summaryMatch[0].trim() : rawTitle;

 // Remove common section headers and prefixes from summary
 summary = summary
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

 ideas.push({
 id: generateUUID(),
 index,
 title: rawTitle.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim(),
 body: body || summary,
 summary: summary || rawTitle,
 fullText: text.slice(match.index ?? 0, nextMatchIndex).trim(),
 });
 }

 // If still no ideas found, try one more aggressive approach
 if (ideas.length === 0 && text.length > 100) {
 const numberedItems = text.matchAll(/(?:^|\n)(\d+)\.\s+([^\n]+)/g);
 const potentialIdeas = [];
 for (const match of numberedItems) {
 const num = parseInt(match[1], 10);
 const textItem = match[2].trim();
 if (textItem.length < 10 || 
 textItem.length > 200 ||
 textItem.toLowerCase().match(/^(recommendation|financial|risk|customer|validation|roadmap|decision|profile|matrix)/i)) {
 continue;
 }
 const title = textItem.replace(/\*\*/g, '').split(/[:\-–]/)[0].trim();
 if (title.length >= 5 && title.length <= 100) {
 potentialIdeas.push({
 index: num,
 title: title,
 matchIndex: match.index,
 fullMatch: match[0]
 });
 }
 }

 if (potentialIdeas.length >= 2) {
 for (let i = 0; i < Math.min(potentialIdeas.length, limit || 10); i++) {
 const item = potentialIdeas[i];
 const nextItem = potentialIdeas[i + 1];
 const start = item.matchIndex + item.fullMatch.length;
 const end = nextItem ? nextItem.matchIndex : text.length;
 const body = text.slice(start, end).trim();

 let cleanSummary = body.split(/[.!?]/)[0] || item.title;
 cleanSummary = cleanSummary
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

 ideas.push({
 id: generateUUID(),
 index: item.index,
 title: item.title,
 body: body || item.title,
 summary: cleanSummary || item.title,
 fullText: text.slice(item.matchIndex, end).trim(),
 });
 }
 }
 }

 // Apply uniqueness filter and return
 const uniqueIdeas = filterUniqueIdeas(ideas);
 
 if (process.env.NODE_ENV === 'development' && uniqueIdeas.length === 0) {
 console.log('[parseStructuredIdeas] No ideas found. Text length:', text.length);
 console.log('[parseStructuredIdeas] First 1000 chars:', text.substring(0, 1000));
 }

 return uniqueIdeas;
}

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

