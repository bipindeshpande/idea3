/**
 * Get theme configuration for different sections
 * All cards now use consistent styling with only icon differences
 */
export function getSectionTheme(sectionTitle) {
  const lowerTitle = sectionTitle.toLowerCase();
  
  // Consistent base theme for all cards
  const base = {
    border: "border",
    bg: "bg-surface",
    headerBg: "bg-surface",
    text: "text-primary",
    borderColor: "var(--border)",
    bgColor: "var(--surface)",
    headerBgColor: "var(--surface)",
    textColor: "var(--text)",
  };

  // Icon mapping - keep icons for visual distinction
  const iconMap = {
    financial: "💰",
    snapshot: "💰",
    execution: "🗺️",
    roadmap: "🗺️",
    risk: "⚠️",
    radar: "⚠️",
    market: "📈",
    signal: "📈",
    customer: "👤",
    persona: "👤",
    validation: "❓",
    question: "❓",
    experiment: "🧪",
    next: "🧪",
    decision: "✅",
    checkpoint: "✅",
    why: "🎯",
    fit: "🎯",
  };

  // Find matching icon
  let icon = "📋"; // default
  for (const [key, value] of Object.entries(iconMap)) {
    if (lowerTitle.includes(key)) {
      icon = value;
      break;
    }
  }

  // Return consistent styling for all cards
  return {
    icon,
    ...base,
  };
}
