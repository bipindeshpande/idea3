/**
 * WorkspaceTheme - Shared typography and spacing constants for workspace pages
 * Ensures consistent, proportionate font sizes across all workspace pages
 * (Dashboard, Account, History, etc.)
 */

export const WORKSPACE_TYPOGRAPHY = {
  // Headings - proportionate scale (matching discovery/validation pages)
  h1: "text-3xl md:text-4xl font-semibold text-primary",
  h2: "text-2xl md:text-3xl font-semibold text-primary",
  h3: "text-xl font-semibold text-primary",
  h4: "text-lg font-semibold text-primary",
  
  // Body text
  body: "text-base text-primary leading-relaxed",
  bodySmall: "text-sm text-primary leading-relaxed",
  
  // Labels and captions
  label: "text-sm font-medium text-primary",
  labelSmall: "text-xs font-medium text-primary",
  caption: "text-xs text-secondary",
  
  // Subtitles and descriptions
  subtitle: "text-sm text-secondary",
  subtitleLarge: "text-base text-secondary",
  
  // Special cases
  statValue: "text-xl font-bold text-primary",
  statLabel: "text-sm font-semibold text-secondary uppercase tracking-wide",
};

export const WORKSPACE_SPACING = {
  // Section spacing
  sectionGap: "gap-4",
  sectionGapLarge: "gap-6",
  
  // Card spacing
  cardMargin: "mt-6",
  cardPadding: "p-6",
  
  // Element spacing
  elementGap: "gap-4",
  elementGapSmall: "gap-2",
  elementGapLarge: "gap-6",
};

