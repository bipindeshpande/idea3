/**
 * Parse structured IDEA blocks (PRIORITY 1-2)
 * Handles structured formats: ### IDEA_N with field:value pairs
 */

import { generateUUID } from '../helpers/uuidHelpers.js';
import { deepClone } from '../helpers/objectHelpers.js';
import { fixConcatenatedText } from '../helpers/textHelpers.js';
import { filterUniqueIdeas, renumberIndices } from './ideaHelpers.js';

/**
 * Parse field:value pairs from idea content
 * @param {string} content - Idea content text
 * @param {Object} idea - Idea object to populate
 */
function parseFieldValuePairs(content, idea) {
  const lines = content.split(/\n/);
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
}

/**
 * Parse structured format (PRIORITY 1): ### IDEA_N with field:value pairs
 * @param {string} text - Text to parse
 * @returns {Array} Array of parsed ideas
 */
function parsePriority1Structured(text) {
  const ideas = [];
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
    parseFieldValuePairs(ideaContent, idea);

    // Set body to full content
    idea.body = ideaContent;

    // Only add idea if it has at least a title
    if (idea.title) {
      ideas.push(deepClone(idea));
    }
  }

  return ideas;
}

/**
 * Parse alternative structured format (PRIORITY 2): ### IDEA_X with title: and summary: on separate lines
 * @param {string} text - Text to parse
 * @returns {Array} Array of parsed ideas
 */
function parsePriority2Alternative(text) {
  const ideas = [];
  const ideaBlockRegex = /###\s*IDEA_(\d+)\s*\n([\s\S]*?)(?=###\s*IDEA_\d+|$)/g;
  const ideaBlockMatches = [...text.matchAll(ideaBlockRegex)];

  if (ideaBlockMatches.length > 0) {
    for (const match of ideaBlockMatches) {
      const index = parseInt(match[1], 10);
      const blockContent = match[2].trim();

      // Extract all fields from key: value format
      const titleMatch = blockContent.match(/title:\s*(.+?)(?:\n|$)/i);
      const summaryMatch = blockContent.match(/summary:\s*(.+?)(?:\n|$)/i);
      const targetMarketMatch = blockContent.match(/target_market:\s*(.+?)(?:\n|$)/i);
      const revenueModelMatch = blockContent.match(/revenue_model:\s*(.+?)(?:\n|$)/i);
      const validationScoreMatch = blockContent.match(/validation_score:\s*(.+?)(?:\n|$)/i);
      const timelineMatch = blockContent.match(/timeline:\s*(.+?)(?:\n|$)/i);
      const whyThisFitsMatch = blockContent.match(/why_this_fits:\s*(.+?)(?:\n|$)/i);

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
          validation_score: validationScoreMatch ? validationScoreMatch[1].trim() : '',
          timeline: timelineMatch ? timelineMatch[1].trim() : '',
          why_this_fits: whyThisFitsMatch ? whyThisFitsMatch[1].trim() : '',
        });
      }
    }
  }

  return ideas;
}

/**
 * Parse structured IDEA blocks (PRIORITY 1-2 only)
 * This function expects pre-processed text (already fixed for concatenation)
 * For full parsing with fallbacks, use parseStructuredIdeasUnified from ideaParsers/index.js
 * 
 * @param {string} text - The streamed text or markdown containing IDEA blocks (should be pre-processed)
 * @param {number} limit - Maximum number of ideas to return (default: no limit)
 * @param {boolean} skipPreprocessing - If true, skip text fixing (for internal use)
 * @returns {Array} Array of parsed IDEA objects
 */
export function parseStructuredIdeas(text = "", limit = null, skipPreprocessing = false) {
  if (!text) return [];
  
  // Only skip if this is PURELY profile analysis text (has markers but NO IDEA blocks)
  // This prevents rejecting valid recommendations that happen to mention profile keywords
  const hasProfileMarkers = text.includes("---PROFILE_ANALYSIS_START---") || 
                            text.includes("---PROFILE_ANALYSIS_END---");
  const hasIdeaBlocks = text.includes("### IDEA_") || /###\s*IDEA_\d+/i.test(text);
  
  // Only skip if it has profile markers AND no idea blocks
  // This means it's purely profile analysis, not recommendations
  if (hasProfileMarkers && !hasIdeaBlocks) {
    return [];
  }
  
  // If it has idea blocks, parse it regardless of other content

  // Fix concatenated text before parsing (unless skipped for internal calls)
  if (!skipPreprocessing) {
    text = fixConcatenatedText(text);
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[parseStructuredIdeas] Text preview:', text.substring(0, 500));
    }
  }

  // PRIORITY 1: Try structured format (### IDEA_N with field:value pairs)
  let ideas = parsePriority1Structured(text);

  // If we found structured ideas, return them (with limit if specified)
  if (ideas.length > 0) {
    const uniqueIdeas = filterUniqueIdeas(ideas);
    renumberIndices(uniqueIdeas);
    if (limit) {
      return uniqueIdeas.slice(0, limit);
    }
    return uniqueIdeas;
  }

  // PRIORITY 2: Try alternative structured format
  ideas = parsePriority2Alternative(text);

  if (ideas.length > 0) {
    const uniqueIdeas = filterUniqueIdeas(ideas);
    renumberIndices(uniqueIdeas);
    if (limit) {
      return uniqueIdeas.slice(0, limit);
    }
    return uniqueIdeas;
  }

  // If no structured ideas found, return empty array
  // Markdown patterns (PRIORITY 3-7) are handled by parseMarkdownIdeas
  return [];
}

