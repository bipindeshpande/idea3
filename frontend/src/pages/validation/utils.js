import { SCORE_BUCKETS, FALLBACK_DETAIL } from "./constants.js";

export const normalizeKey = (name = "") =>
 name
 .toLowerCase()
 .replace(/&/g, "and")
 .replace(/[^a-z0-9]+/g, "_")
 .replace(/_+/g, "_")
 .replace(/^_|_$/g, "");

export const getScoreMeta = (score = 0) =>
 SCORE_BUCKETS.find((bucket) => score >= bucket.min) || SCORE_BUCKETS[SCORE_BUCKETS.length - 1];

export const formatDetails = (details) => {
 if (!details) return FALLBACK_DETAIL;
 const text = String(details)
 .replace(/\*\*/g, "")
 .replace(/\s+/g, " ")
 .trim();
 if (!text) return FALLBACK_DETAIL;
 return text.length > 320 ? `${text.slice(0, 317).trim()}...` : text;
};

export const getScoreFromScores = (scores = {}, parameter = "") => {
 if (!scores) return 1; // Minimum score of 1 instead of 0
 const normalized = normalizeKey(parameter);
 const candidates = [
 normalized,
 normalized.replace(/_/g, ""),
 parameter,
 parameter?.toLowerCase?.(),
 // Handle Team / Founder Fit variations
 parameter === "Team / Founder Fit" ? "team_founder_fit" : null,
 parameter === "Team / Founder Fit" ? "team_fit" : null,
 parameter === "Team / Founder Fit" ? "founder_fit" : null,
 ].filter(Boolean);
 for (const key of candidates) {
 if (scores[key] !== undefined) {
 const score = Number(scores[key]) ?? 1;
 return Math.max(score, 1); // Clamp to minimum of 1
 }
 }
 return 1; // Minimum score of 1 instead of 0
};

