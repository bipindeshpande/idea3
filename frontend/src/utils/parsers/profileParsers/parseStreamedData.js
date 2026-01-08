/**
 * Parse complete streamed data into structured format
 * Accumulates all chunks and parses profile + ideas when complete
 * 
 * @param {string} buffer - Complete accumulated stream buffer
 * @returns {Object} { profile: {...}, ideas: [...] }
 */

import { generateUUID } from '../helpers/uuidHelpers.js';
import { deepClone } from '../helpers/objectHelpers.js';
import { extractProfileJSON } from './extractProfileJSON.js';
import { filterUniqueIdeas } from '../ideaParsers/ideaHelpers.js';

export function parseStreamedData(buffer = "") {
  const result = {
    profile: null,
    ideas: []
  };

  if (!buffer) return result;

  // 1. Parse profile block
  result.profile = extractProfileJSON(buffer);

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

    // Set body to full content (matching PRIORITY 2 behavior: body: blockContent)
    // This includes both field:value pairs and markdown sections
    // splitIdeaSections() will parse the markdown sections correctly
    idea.body = content;

    // Only add idea if it has at least a title
    if (idea.title) {
      // Deep clone to prevent reference reuse
      result.ideas.push(deepClone(idea));
    }
  }

  // Apply uniqueness filter
  result.ideas = filterUniqueIdeas(result.ideas);

  // Renumber indices sequentially (1, 2, 3...) for display
  result.ideas.forEach((idea, idx) => {
    idea.index = idx + 1;
  });

  // Log results for verification
  console.log(`[parseStreamedData] Parsed ${result.ideas.length} unique ideas`);
  result.ideas.forEach((idea, idx) => {
    console.log(`[parseStreamedData] Idea ${idx + 1}: id=${idea.id}, title=${(idea.title || '').substring(0, 50)}, summary=${(idea.summary || '').substring(0, 50)}`);
  });

  return result;
}

