/**
 * Section constants for recommendation detail page
 */

// Section order - single source of truth for section rendering (UX-optimized order)
export const SECTION_ORDER = [
  "why_fits",
  "financial_snapshot",
  "execution_path",
  "immediate_experiments",
  "timeline_effort",
  "customer_persona",
  "market_opportunity",
  "key_risks",
  "validation_questions",
  "immediate_next_steps",
  "decision_checklist",
  "additional_insights",
];

// Section labels mapping
export const SECTION_LABELS = {
  why_fits: "Why this Idea Fits You",
  financial_snapshot: "Financial snapshot",
  execution_path: "Execution Path",
  immediate_experiments: "Immediate Experiments",
  timeline_effort: "Timeline & Effort",
  customer_persona: "Customer Persona",
  market_opportunity: "Market Opportunity",
  key_risks: "Key Risks & Mitigations",
  validation_questions: "Validation Questions",
  immediate_next_steps: "Immediate Next Steps",
  decision_checklist: "Decision Checklist",
  additional_insights: "Additional Insights",
};

// Default sections - all sections must always be present
export const DEFAULT_SECTIONS = {
  intro: "",
  why_fits: "",
  financial_snapshot: "",
  execution_path: "",
  customer_persona: "",
  market_opportunity: "",
  key_risks: "",
  validation_questions: "",
  immediate_experiments: "",
  immediate_next_steps: "",
  timeline_effort: "",
  decision_checklist: "",
  additional_insights: "",
};

// Section toggle IDs mapping
export const SECTION_TOGGLE_IDS = {
  why_fits: "why-fits",
  financial_snapshot: "financial",
  execution_path: "execution",
  immediate_experiments: "experiments",
  timeline_effort: "roadmap",
  customer_persona: "persona-validation",
  market_opportunity: "market",
  key_risks: "risk",
  validation_questions: "validation",
  immediate_next_steps: "next-steps",
  decision_checklist: "decision",
  additional_insights: "additional",
};

// Section descriptions mapping
export const SECTION_DESCRIPTIONS = {
  execution_path: "Move from validation to scale with focused sprints that match your capacity.",
  market_opportunity: "Trends and proof points worth validating as you move forward.",
  customer_persona: "Understand your ideal customer profile and use these validation questions to confirm demand and buying triggers.",
};

/**
 * Get section toggle ID from section key
 */
export function getSectionToggleId(key) {
  return SECTION_TOGGLE_IDS[key] || key;
}

/**
 * Get section description from section key
 */
export function getSectionDescription(key) {
  return SECTION_DESCRIPTIONS[key] || null;
}
