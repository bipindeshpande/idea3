import { logToFile } from "../fileLogger.js";

const PERSONALIZATION_RULES = [
  { pattern: /\bthe user's\b/gi, replacement: "your" },
  { pattern: /\bthe users\b/gi, replacement: "your" },
  { pattern: /\bthe user\b/gi, replacement: "you" },
  { pattern: /\buser's\b/gi, replacement: "your" },
  { pattern: /\busers\b/gi, replacement: "customers" },
  { pattern: /\buser\b/gi, replacement: "you" },
  { pattern: /\btheir goal\b/gi, replacement: "your goal" },
  { pattern: /\btheir goals\b/gi, replacement: "your goals" },
  { pattern: /\btheir\b/gi, replacement: "your" },
];

// Cache for personalizeCopy to avoid re-processing same text
const personalizeCache = new Map();
const MAX_CACHE_SIZE = 1000;

/**
 * Personalizes text by replacing "user" references with "you/your"
 */
export function personalizeCopy(text = "") {
  if (!text || typeof text !== "string") return text;
  
  // Check cache first
  if (personalizeCache.has(text)) {
    return personalizeCache.get(text);
  }
  
  // Apply personalization rules
  const result = PERSONALIZATION_RULES.reduce(
    (acc, { pattern, replacement }) => acc.replace(pattern, replacement),
    text
  );
  
  // Cache the result (with size limit to prevent memory issues)
  if (personalizeCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry (simple FIFO)
    const firstKey = personalizeCache.keys().next().value;
    personalizeCache.delete(firstKey);
  }
  personalizeCache.set(text, result);
  
  return result;
}

/**
 * Formats section headings from raw text
 */
export function formatSectionHeading(raw = "") {
  const cleaned = personalizeCopy(raw)
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Extracts list items from text (handles bullets and numbered lists)
 */
export function extractListFromText(text = "") {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  const items = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    // Skip lines that are section headers like "Execution Path:" or "Days 0-30:"
    if (/^(execution\s+path|days\s+0[-\s]?30)[:\s]*$/i.test(trimmed)) {
      return;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^[-*+]\s+/, "").trim();
      // Skip if it's just "Execution Path:" or similar
      if (!/^(execution\s+path|days\s+0[-\s]?30)[:\s]*$/i.test(item)) {
        items.push(item);
      }
    } else if (/^\d+[\.\)]\s+/.test(trimmed)) {
      const item = trimmed.replace(/^\d+[\.\)]\s+/, "").trim();
      // Skip if it's just "Execution Path:" or similar
      if (!/^(execution\s+path|days\s+0[-\s]?30)[:\s]*$/i.test(item)) {
        items.push(item);
      }
    }
  });

  if (items.length > 0) {
    return items.map((item) => {
      // Clean item - remove "Execution Path:" prefix if present
      const cleaned = personalizeCopy(item)
        .replace(/^execution\s+path[:\s]*/i, "")
        .replace(/^[-*]\s*\*\*execution\s+path\*\*[:\s]*/i, "")
        .replace(/^[-*]\s*execution\s+path[:\s]*/i, "")
        .replace(/\*\*execution\s+path\*\*[:\s]*/gi, "")
        .replace(/^[-*]\s*/g, "")
        .trim();
      return cleaned;
    });
  }

  // Fallback: split into sentences if bullets are missing.
  const sentenceItems = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  return sentenceItems.map((sentence) => personalizeCopy(sentence));
}

/**
 * Cleans narrative markdown by removing unwanted prefixes and personalizing
 */
export function cleanNarrativeMarkdown(markdown = "") {
  if (!markdown) return "";
  const personalized = personalizeCopy(markdown);
  const sentences = personalized.split(/(?<=[.!?])\s+/);
  const filtered = sentences.filter((sentence, index) => {
    const trimmed = sentence.trim();
    if (!trimmed) return false;
    if (
      index === 0 &&
      (/^given\b/i.test(trimmed) ||
        /^overall\b/i.test(trimmed) ||
        /^in summary\b/i.test(trimmed) ||
        /^in conclusion\b/i.test(trimmed))
    ) {
      return false;
    }
    return true;
  });
  if (filtered.length === 0) {
    return personalized;
  }
  const cleaned = filtered.join(" ").replace(/\bthe user'?s?\b/gi, (match) => {
    if (/users/i.test(match)) return "customers";
    if (/user's/i.test(match)) return "your";
    return "you";
  });
  return cleaned
    .replace(/\byou can leverage\b/gi, "you can use")
    .replace(/\bleverage\b/gi, "use")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Removes duplicate strings from an array
 */
export function dedupeStrings(items = []) {
  const seen = new Set();
  return items
    .map((item) => personalizeCopy(item).trim())
    .filter((item) => {
      if (!item) return false;
      const normalized = item.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(normalized)) {
        return false;
      }
      seen.add(normalized);
      return true;
    });
}

/**
 * Truncate text to max length
 */
export function truncateText(value = "", maxLength = 140) {
  if (!value) return "";
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return `${cleaned.slice(0, maxLength).trimEnd()}…`;
}
