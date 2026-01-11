/**
 * Parse structured JSON lines (NDJSON) stream
 * 
 * Each line is a JSON object with a type field indicating what kind of data it contains.
 * This makes parsing robust and format-agnostic.
 */
import { validateAgainstSchema, autoFixChunk, chunkSchemas } from './streamChunkSchemas.js';

/**
 * Parse a single JSON line chunk
 * @param {string} line - Single JSON line
 * @returns {Object|null} Parsed chunk object or null if invalid
 */
export function parseJSONLine(line) {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.error("parseJSONLine - Failed to parse JSON:", e, "Line:", line.substring(0, 100));
    return null;
  }
}

/**
 * Validate chunk structure using JSON Schema
 * @param {Object} chunk - Parsed chunk object
 * @param {boolean} autoFix - If true, attempt to auto-fix common issues
 * @returns {Object} Validation result { valid, errors, fixedChunk }
 */
export function validateChunk(chunk, autoFix = false) {
  if (!chunk || typeof chunk !== "object") {
    return {
      valid: false,
      errors: ["Chunk must be an object"],
      fixedChunk: null
    };
  }

  const chunkType = chunk.type;
  if (!chunkType) {
    return {
      valid: false,
      errors: ["Missing 'type' field"],
      fixedChunk: null
    };
  }

  // Get schema for this chunk type
  const schema = chunkSchemas[chunkType];
  if (!schema) {
    const validTypes = Object.keys(chunkSchemas).join(", ");
    return {
      valid: false,
      errors: [`Invalid chunk type: '${chunkType}'. Must be one of: ${validTypes}`],
      fixedChunk: null
    };
  }

  // Try auto-fix if enabled
  let chunkToValidate = chunk;
  if (autoFix) {
    const fixed = autoFixChunk(chunk);
    if (fixed) {
      chunkToValidate = fixed;
    }
  }

  // Validate against schema
  const validation = validateAgainstSchema(chunkToValidate, schema);
  
  return {
    valid: validation.valid,
    errors: validation.errors,
    fixedChunk: autoFix && chunkToValidate !== chunk ? chunkToValidate : null
  };
}

/**
 * Stream accumulator - accumulates chunks and extracts sections
 */
export class StreamAccumulator {
  constructor() {
    this.metadata = null;
    this.profileText = [];
    this.recommendationText = [];
    this.errors = [];
    this.currentSection = null;
    this.profileComplete = false;
    this.recommendationComplete = false;
  }

  /**
   * Add and validate a chunk using JSON Schema validation
   * @param {Object} chunkData - Parsed chunk object
   * @param {boolean} autoFix - If true, attempt to auto-fix common issues
   * @returns {Object} Validation result { success, error, validatedChunk }
   */
  addChunk(chunkData, autoFix = true) {
    // Validate chunk using JSON Schema
    const validation = validateChunk(chunkData, autoFix);
    
    if (!validation.valid) {
      // Validation failed
      this.errors.push({
        type: "validation_error",
        chunk: chunkData,
        errors: validation.errors
      });
      return {
        success: false,
        error: validation.errors.join("; "),
        validatedChunk: null
      };
    }
    
    // Use validated/fixed chunk
    const chunkToProcess = validation.fixedChunk || chunkData;

    const chunkType = chunkToProcess.type;

    if (chunkType === "metadata") {
      this.metadata = chunkToProcess;
    } else if (chunkType === "profile_start") {
      this.currentSection = "profile";
      this.profileText = [];
    } else if (chunkType === "profile_chunk") {
      if (this.currentSection === "profile") {
        this.profileText.push(chunkToProcess.text || "");
      }
    } else if (chunkType === "profile_end") {
      this.profileComplete = true;
      this.currentSection = null;
    } else if (chunkType === "recommendation_start") {
      this.currentSection = "recommendation";
      this.recommendationText = [];
    } else if (chunkType === "recommendation_chunk") {
      if (this.currentSection === "recommendation") {
        this.recommendationText.push(chunkToProcess.text || "");
      }
    } else if (chunkType === "recommendation_end") {
      this.recommendationComplete = true;
      this.currentSection = null;
    } else if (chunkType === "error") {
      this.errors.push(chunkToProcess);
    } else if (chunkType === "complete") {
      // Just a marker
    }

    return {
      success: true,
      error: null,
      validatedChunk: chunkToProcess
    };
  }

  /**
   * Get accumulated profile text
   * @returns {string} Profile text
   */
  getProfile() {
    return this.profileText.join("");
  }

  /**
   * Get accumulated recommendation text
   * @returns {string} Recommendation text
   */
  getRecommendations() {
    return this.recommendationText.join("");
  }

  /**
   * Check if both sections are complete
   * @returns {boolean} True if complete
   */
  isComplete() {
    return this.profileComplete && this.recommendationComplete;
  }

  /**
   * Check if there are any errors
   * @returns {boolean} True if there are errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }
}

/**
 * Parse streamed JSON lines and extract sections
 * @param {string} text - Streamed text (may contain multiple JSON lines)
 * @returns {Object} Object with profileAnalysis and recommendations
 */
export function parseJSONLinesStream(text) {
  // Handle null/undefined text
  if (!text || typeof text !== 'string') {
    return {
      profileAnalysis: "",
      recommendations: "",
      isComplete: false,
      hasErrors: false,
      errors: [],
      metadata: null
    };
  }
  
  const accumulator = new StreamAccumulator();
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Only parse lines that are complete JSON objects
    // This prevents parsing multiline content inside the "text" field
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const chunk = parseJSONLine(trimmed);
      if (chunk) {
        const result = accumulator.addChunk(chunk, true);
        if (!result.success) {
          console.warn("WARNING: Chunk validation failed in parseJSONLinesStream:", result.error, "Chunk:", chunk);
        }
      }
    }
    // Skip lines that aren't complete JSON objects (e.g., markdown content from text field)
  }

  return {
    profileAnalysis: accumulator.getProfile(),
    recommendations: accumulator.getRecommendations(),
    isComplete: accumulator.isComplete(),
    hasErrors: accumulator.hasErrors(),
    errors: accumulator.errors,
    metadata: accumulator.metadata
  };
}

