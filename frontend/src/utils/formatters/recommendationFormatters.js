/**
 * BARREL FILE - Re-exports all formatter functions for backward compatibility
 * 
 * This file maintains the same API as before while the actual implementation
 * is split into focused modules:
 * - textFormatters.js
 * - financialFormatters.js
 * - riskFormatters.js
 * - validationFormatters.js
 * - sectionParsers.js
 * - executionFormatters.js
 */

// Text formatters
export {
  personalizeCopy,
  formatSectionHeading,
  extractListFromText,
  cleanNarrativeMarkdown,
  dedupeStrings,
  truncateText,
} from "./textFormatters.js";

// Financial formatters
export {
  buildFinancialSnapshots,
} from "./financialFormatters.js";

// Risk formatters
export {
  parseRiskRows,
} from "./riskFormatters.js";

// Validation formatters
export {
  extractValidationQuestions,
  buildValidationQuestions,
} from "./validationFormatters.js";

// Section parsers
export {
  splitIdeaSections,
  splitFullReportSections,
  extractWhyFit,
  extractOtherSection,
  parseProfileSummary,
  parseRecommendationMatrix,
} from "./sectionParsers.js";

// Execution formatters
export {
  buildExecutionSteps,
  extractTimelineSlice,
  buildFinalConclusion,
} from "./executionFormatters.js";