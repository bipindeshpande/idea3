/**
 * Get theme configuration for a profile section based on its title
 * 
 * @param {string} title - Section title
 * @param {number} index - Section index (0-based)
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {Object} Theme object with icon, bg, border, text colors, etc.
 */
export function getSectionTheme(title = "", index = 0, isDark = false) {
  const lowerTitle = title.toLowerCase();

  // Core Motivations (Section 1) - bg-surface
  if (lowerTitle.includes("motivation") || lowerTitle.includes("goal") || lowerTitle.includes("objective")) {
    return {
      icon: "🎯",
      bg: isDark ? "#1e1b4b" : "rgba(238, 242, 255, 0.1)", // indigo-50 with opacity-10
      bgFull: isDark ? "#312e81" : "#EEF2FF", // Full opacity for header
      border: isDark ? "#6366f1" : "#C7D2FE",
      headerBg: isDark ? "#312e81" : "rgba(238, 242, 255, 0.2)", // indigo-50 opacity-20
      headerBgHover: isDark ? "#4338ca" : "rgba(238, 242, 255, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Operating Constraints (Section 2) - bg-surface
  if (lowerTitle.includes("constraint")) {
    return {
      icon: "📋",
      bg: isDark ? "#1e3a5f" : "rgba(239, 246, 255, 0.1)", // blue-50 with opacity-10
      bgFull: isDark ? "#1e40af" : "#EFF6FF", // Full opacity for header
      border: isDark ? "#3b82f6" : "#BFDBFE",
      headerBg: isDark ? "#1e40af" : "rgba(239, 246, 255, 0.2)", // blue-50 opacity-20
      headerBgHover: isDark ? "#2563eb" : "rgba(239, 246, 255, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Strengths and Capabilities (Section 3) - bg-purple-50
  if (lowerTitle.includes("strength") || lowerTitle.includes("capabilit")) {
    return {
      icon: "💪",
      bg: isDark ? "#3e1b5f" : "rgba(250, 245, 255, 0.1)", // purple-50 with opacity-10
      bgFull: isDark ? "#6b21a8" : "#FAF5FF", // Full opacity for header
      border: isDark ? "#9333ea" : "#F3E8FF",
      headerBg: isDark ? "#6b21a8" : "rgba(250, 245, 255, 0.2)", // purple-50 opacity-20
      headerBgHover: isDark ? "#7c3aed" : "rgba(250, 245, 255, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Strategic Considerations (Section 4) - bg-sky-50
  if (lowerTitle.includes("strategic") || lowerTitle.includes("consideration")) {
    return {
      icon: "🧭",
      bg: isDark ? "#0c4a6e" : "rgba(240, 249, 255, 0.1)", // sky-50 with opacity-10
      bgFull: isDark ? "#075985" : "#F0F9FF", // Full opacity for header
      border: isDark ? "#0284c7" : "#BAE6FD",
      headerBg: isDark ? "#075985" : "rgba(240, 249, 255, 0.2)", // sky-50 opacity-20
      headerBgHover: isDark ? "#0369a1" : "rgba(240, 249, 255, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Viability Red Flags (Section 5) - bg-surface
  if (lowerTitle.includes("red flag") || lowerTitle.includes("viability")) {
    return {
      icon: "⚠️",
      bg: isDark ? "#451a03" : "rgba(255, 251, 235, 0.1)", // amber-50 with opacity-10
      bgFull: isDark ? "#78350f" : "#FFFBEB", // Full opacity for header
      border: isDark ? "#f59e0b" : "#FDE68A",
      headerBg: isDark ? "#78350f" : "rgba(255, 251, 235, 0.2)", // amber-50 opacity-20
      headerBgHover: isDark ? "#92400e" : "rgba(255, 251, 235, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Pathway Recommendation (Section 6) - bg-green-50
  if (lowerTitle.includes("pathway") || lowerTitle.includes("recommendation")) {
    return {
      icon: "🚀",
      bg: isDark ? "#064e3b" : "rgba(240, 253, 244, 0.1)", // green-50 with opacity-10
      bgFull: isDark ? "#065f46" : "#F0FDF4", // Full opacity for header
      border: isDark ? "#10b981" : "#D1FAE5",
      headerBg: isDark ? "#065f46" : "rgba(240, 253, 244, 0.2)", // green-50 opacity-20
      headerBgHover: isDark ? "#047857" : "rgba(240, 253, 244, 0.3)", // opacity-30 on hover
      text: "text-secondary",
    };
  }

  // Fallback (should not be reached)
  return {
    icon: "📋",
    bg: isDark ? "#1A2333" : "rgba(239, 246, 255, 0.1)",
    bgFull: isDark ? "#1e40af" : "#EFF6FF",
    border: isDark ? "#3b82f6" : "#BFDBFE",
    headerBg: isDark ? "#1e40af" : "rgba(239, 246, 255, 0.2)",
    headerBgHover: isDark ? "#2563eb" : "rgba(239, 246, 255, 0.3)",
    text: "text-secondary",
  };
}
