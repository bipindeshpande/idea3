/**
 * JSON Schema definitions for stream chunk validation
 * 
 * This matches the Pydantic models in backend for consistency.
 */

// Base schema for all chunks
const baseChunkSchema = {
  type: "object",
  required: ["type"],
  properties: {
    type: {
      type: "string",
      enum: [
        "metadata",
        "profile_start",
        "profile_chunk",
        "profile_end",
        "recommendation_start",
        "recommendation_chunk",
        "recommendation_end",
        "error",
        "complete"
      ]
    }
  }
};

// Metadata chunk schema
export const metadataChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "metadata" },
    version: { type: "string", default: "1.0" },
    sections: {
      type: "array",
      items: { type: "string" },
      default: ["profile", "recommendations"]
    }
  },
  required: ["type", "version", "sections"]
};

// Profile start chunk schema
export const profileStartChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "profile_start" }
  }
};

// Profile chunk schema
export const profileChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "profile_chunk" },
    text: { type: "string" }
  },
  required: ["type", "text"]
};

// Profile end chunk schema
export const profileEndChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "profile_end" }
  }
};

// Recommendation start chunk schema
export const recommendationStartChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "recommendation_start" }
  }
};

// Recommendation chunk schema
export const recommendationChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "recommendation_chunk" },
    text: { type: "string" }
  },
  required: ["type", "text"]
};

// Recommendation end chunk schema
export const recommendationEndChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "recommendation_end" }
  }
};

// Error chunk schema
export const errorChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "error" },
    message: { type: "string" },
    details: { type: "object", default: {} }
  },
  required: ["type", "message"]
};

// Complete chunk schema
export const completeChunkSchema = {
  ...baseChunkSchema,
  properties: {
    ...baseChunkSchema.properties,
    type: { type: "string", const: "complete" }
  }
};

// Map chunk type to schema
export const chunkSchemas = {
  metadata: metadataChunkSchema,
  profile_start: profileStartChunkSchema,
  profile_chunk: profileChunkSchema,
  profile_end: profileEndChunkSchema,
  recommendation_start: recommendationStartChunkSchema,
  recommendation_chunk: recommendationChunkSchema,
  recommendation_end: recommendationEndChunkSchema,
  error: errorChunkSchema,
  complete: completeChunkSchema
};

/**
 * Simple JSON Schema validator (lightweight, no external dependencies)
 * For more complex validation, consider using ajv library
 */
export function validateAgainstSchema(chunk, schema) {
  const errors = [];
  
  // Check required fields
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in chunk)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  
  // Check type
  if (chunk.type !== undefined && schema.properties?.type?.const) {
    if (chunk.type !== schema.properties.type.const) {
      errors.push(`Invalid type: expected '${schema.properties.type.const}', got '${chunk.type}'`);
    }
  }
  
  // Check property types
  if (schema.properties) {
    for (const [field, fieldSchema] of Object.entries(schema.properties)) {
      if (field in chunk) {
        const value = chunk[field];
        
        // Type check
        if (fieldSchema.type && typeof value !== fieldSchema.type) {
          errors.push(`Field '${field}' must be of type ${fieldSchema.type}, got ${typeof value}`);
        }
        
        // Const check
        if (fieldSchema.const && value !== fieldSchema.const) {
          errors.push(`Field '${field}' must be '${fieldSchema.const}', got '${value}'`);
        }
        
        // Enum check
        if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
          errors.push(`Field '${field}' must be one of [${fieldSchema.enum.join(", ")}], got '${value}'`);
        }
        
        // Array check
        if (fieldSchema.type === "array" && !Array.isArray(value)) {
          errors.push(`Field '${field}' must be an array, got ${typeof value}`);
        }
        
        // Object check
        if (fieldSchema.type === "object" && (typeof value !== "object" || Array.isArray(value) || value === null)) {
          errors.push(`Field '${field}' must be an object, got ${typeof value}`);
        }
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Auto-fix common validation issues
 */
export function autoFixChunk(chunk) {
  if (!chunk || typeof chunk !== "object") {
    return null;
  }
  
  const fixed = { ...chunk };
  const chunkType = fixed.type;
  
  // Fix missing required fields based on type
  if (chunkType === "metadata") {
    if (!("version" in fixed)) {
      fixed.version = "1.0";
    }
    if (!("sections" in fixed) || !Array.isArray(fixed.sections)) {
      fixed.sections = ["profile", "recommendations"];
    }
  } else if (chunkType === "profile_chunk" || chunkType === "recommendation_chunk") {
    if (!("text" in fixed)) {
      fixed.text = "";
    } else if (typeof fixed.text !== "string") {
      fixed.text = String(fixed.text || "");
    }
  } else if (chunkType === "error") {
    if (!("message" in fixed)) {
      fixed.message = "Unknown error";
    }
    if (!("details" in fixed) || typeof fixed.details !== "object" || Array.isArray(fixed.details)) {
      fixed.details = {};
    }
  }
  
  return fixed;
}

