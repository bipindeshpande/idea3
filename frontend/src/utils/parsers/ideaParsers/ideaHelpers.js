/**
 * Idea processing and normalization utilities
 */

import { deepClone } from '../helpers/objectHelpers.js';

/**
 * Filter out duplicate ideas based on title and summary, and fix duplicate IDs
 * @param {Array} ideas - Array of idea objects
 * @returns {Array} Array of unique ideas
 */
export function filterUniqueIdeas(ideas) {
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
 * Renumber idea indices sequentially (1, 2, 3...) for display
 * @param {Array} ideas - Array of idea objects
 */
export function renumberIndices(ideas) {
  ideas.forEach((idea, idx) => {
    idea.index = idx + 1;
  });
}

/**
 * Create a new idea object with default structure
 * @param {number} index - Idea index
 * @param {Function} generateUUID - UUID generator function
 * @returns {Object} New idea object
 */
export function createIdeaObject(index, generateUUID) {
  return {
    id: generateUUID(),
    index: index,
    title: "",
    summary: "",
    target_market: "",
    revenue_model: "",
    validation_score: "",
    timeline: "",
    why_this_fits: "",
    body: ""
  };
}

