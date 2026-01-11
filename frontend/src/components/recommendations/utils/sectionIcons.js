/**
 * Section Icons and Visual Enhancements
 * Maps section keys to consistent icons and visual styles
 */

export const SECTION_ICONS = {
  // Overview sections
  why_fits: "🎯",
  financial_snapshot: "💰",
  immediate_next_steps: "⚡",
  timeline_effort: "📅",
  
  // Validation sections
  validation_questions: "❓",
  key_risks: "⚠️",
  decision_checklist: "✅",
  immediate_experiments: "🧪",
  
  // Execution sections
  execution_path: "🚀",
  
  // Market Intel sections
  customer_persona: "👤",
  market_opportunity: "📊",
  additional_insights: "💡"
};

/**
 * Get icon for a section
 */
export function getSectionIcon(sectionKey) {
  return SECTION_ICONS[sectionKey] || "📄";
}

/**
 * Section color themes for visual distinction
 */
export const SECTION_COLOR_THEMES = {
  // Overview - Blue tones
  why_fits: {
    accent: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400"
  },
  financial_snapshot: {
    accent: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/10",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400"
  },
  immediate_next_steps: {
    accent: "text-purple-500",
    bg: "bg-purple-50 dark:bg-purple-900/10",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400"
  },
  timeline_effort: {
    accent: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-900/10",
    border: "border-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600 dark:text-indigo-400"
  },
  
  // Validation - Orange/Red tones
  validation_questions: {
    accent: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-900/10",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400"
  },
  key_risks: {
    accent: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/10",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400"
  },
  decision_checklist: {
    accent: "text-teal-500",
    bg: "bg-teal-50 dark:bg-teal-900/10",
    border: "border-teal-200 dark:border-teal-800",
    icon: "text-teal-600 dark:text-teal-400"
  },
  immediate_experiments: {
    accent: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-900/10",
    border: "border-pink-200 dark:border-pink-800",
    icon: "text-pink-600 dark:text-pink-400"
  },
  
  // Execution - Gradient/Bold colors
  execution_path: {
    accent: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/10",
    border: "border-violet-200 dark:border-violet-800",
    icon: "text-violet-600 dark:text-violet-400"
  },
  
  // Market Intel - Cyan/Blue tones
  customer_persona: {
    accent: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-900/10",
    border: "border-cyan-200 dark:border-cyan-800",
    icon: "text-cyan-600 dark:text-cyan-400"
  },
  market_opportunity: {
    accent: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-900/10",
    border: "border-sky-200 dark:border-sky-800",
    icon: "text-sky-600 dark:text-sky-400"
  },
  additional_insights: {
    accent: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400"
  }
};

/**
 * Get color theme for a section
 */
export function getSectionColorTheme(sectionKey) {
  return SECTION_COLOR_THEMES[sectionKey] || {
    accent: "text-gray-500",
    bg: "bg-gray-50 dark:bg-gray-900/10",
    border: "border-gray-200 dark:border-gray-800",
    icon: "text-gray-600 dark:text-gray-400"
  };
}

/**
 * Tab icons for tabbed navigation
 */
export const TAB_ICONS = {
  atAGlance: "✨",
  overview: "📋",
  validation: "⚠️",
  execution: "🚀",
  research: "📚"
};

/**
 * Get tab icon
 */
export function getTabIcon(tabKey) {
  return TAB_ICONS[tabKey] || "📄";
}

