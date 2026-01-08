/**
 * Streaming Parser Module - Main Entry Point
 * 
 * This module provides backward compatibility with the original streamingParser.js
 * All functions are re-exported from their modular locations.
 * 
 * For new code, consider importing directly from specific modules:
 * - ideaParsers/parseStructuredIdeas.js
 * - profileParsers/extractProfileJSON.js
 * - etc.
 */

// Import unified idea parser
import { parseStructuredIdeasUnified } from './ideaParsers/index.js';

// Re-export all public functions for backward compatibility
export { parseStreamedData } from './profileParsers/parseStreamedData.js';
export { extractProfileJSON } from './profileParsers/extractProfileJSON.js';
export { splitProfileAndRecommendations } from './textProcessors/splitProfileAndRecommendations.js';
export { cleanStreamedText } from './textProcessors/cleanStreamedText.js';
export { extractHighlights } from './textProcessors/extractHighlights.js';
export { trimFromHeading } from './textProcessors/trimFromHeading.js';

// Export unified parseStructuredIdeas (combines structured + markdown parsers)
// This maintains the same API as the original streamingParser.js
export { parseStructuredIdeasUnified as parseStructuredIdeas };

