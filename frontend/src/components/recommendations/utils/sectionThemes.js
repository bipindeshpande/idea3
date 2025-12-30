/**
 * Get theme configuration for different sections
 */
export function getSectionTheme(sectionTitle) {
  const lowerTitle = sectionTitle.toLowerCase();
  const base = {
    border: "border-default",
    bg: "bg-surface",
    headerBg: "bg-surface",
    text: "text-primary",
    borderColor: "var(--border)",
    bgColor: "var(--surface)",
    headerBgColor: "var(--surface)",
    textColor: "var(--text)",
  };

  if (lowerTitle.includes("financial") || lowerTitle.includes("snapshot")) {
    return {
      icon: "💰",
      ...base,
      text: "text-accent",
      borderColor: "var(--warning)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("execution") || lowerTitle.includes("roadmap")) {
    return {
      icon: "🗺️",
      ...base,
      text: "text-accent",
      borderColor: "var(--accent)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("risk") || lowerTitle.includes("radar")) {
    return {
      icon: "⚠️",
      ...base,
      text: "text-danger",
      borderColor: "var(--danger)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("market") || lowerTitle.includes("signal")) {
    return {
      icon: "📈",
      ...base,
      text: "text-accent",
      borderColor: "var(--accent)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("customer") || lowerTitle.includes("persona")) {
    return {
      icon: "👤",
      ...base,
      text: "text-accent",
      borderColor: "var(--accent)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("validation") || lowerTitle.includes("question")) {
    return {
      icon: "❓",
      ...base,
      text: "text-accent",
      borderColor: "var(--accent)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("experiment") || lowerTitle.includes("next")) {
    return {
      icon: "🧪",
      ...base,
      text: "text-accent",
      borderColor: "var(--warning)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("decision") || lowerTitle.includes("checkpoint")) {
    return {
      icon: "✅",
      ...base,
      text: "text-accent",
      borderColor: "var(--success)",
      bgColor: "var(--surface-muted)",
    };
  }

  if (lowerTitle.includes("30") || lowerTitle.includes("60") || lowerTitle.includes("90") || lowerTitle.includes("outlook")) {
    return {
      icon: "📅",
      ...base,
      text: "text-accent",
      borderColor: "var(--accent)",
      bgColor: "var(--surface-muted)",
    };
  }

  return { icon: "📋", ...base, bg: "bg-app", headerBg: "bg-app", bgColor: "var(--bg)" };
}
