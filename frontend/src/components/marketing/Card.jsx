/**
 * Marketing Card Component - Card-First Design
 * 
 * All marketing content uses cards
 * Cards have: border, shadow, clear separation
 * Distinct in both light and dark mode
 * 
 * Uses tokens only - no hardcoded values
 */

import { forwardRef } from "react";

const Card = forwardRef(function Card(
  {
    children,
    variant = "default",
    padding = "md",
    accent = null, // "primary", "accent-1", "accent-2", or null
    className = "",
    ...props
  },
  ref
) {
  // Padding variants (from tokens)
  const paddingStyles = {
    none: { padding: 0 },
    sm: { padding: "var(--space-4)" },
    md: { padding: "var(--space-6)" },
    lg: { padding: "var(--space-8)" },
  };
  
  // Variant styles
  const variantStyles = {
    default: { backgroundColor: "var(--mkt-surface)" },
    muted: { backgroundColor: "var(--mkt-surface-muted)" },
    elevated: { boxShadow: "var(--shadow-md)" },
  };
  
  // Accent border styles
  const accentStyles = accent ? {
    borderTop: `3px solid ${accent === "primary" ? "var(--mkt-primary)" : accent === "accent-1" ? "var(--mkt-card-purple)" : "var(--mkt-card-green)"}`,
    borderLeft: "1px solid var(--mkt-outline)",
    borderRight: "1px solid var(--mkt-outline)",
    borderBottom: "1px solid var(--mkt-outline)",
  } : {
    border: "1px solid var(--mkt-outline)",
  };
  
  const baseStyle = {
    backgroundColor: variant === "muted" ? "var(--mkt-surface-muted)" : "var(--mkt-surface)",
    borderRadius: "var(--radius-lg)",
    boxShadow: variant === "elevated" ? "var(--shadow-md)" : "var(--shadow-sm)",
    ...paddingStyles[padding],
    ...variantStyles[variant],
    ...accentStyles,
  };
  
  return (
    <div
      ref={ref}
      className={className}
      style={baseStyle}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;

