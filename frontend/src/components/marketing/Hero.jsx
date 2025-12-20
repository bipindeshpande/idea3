/**
 * Hero Component - Marketing Hero Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - Lightweight animations (opacity + transform)
 * - Clear visual hierarchy
 */

import Button from "./Button.jsx";

export default function Hero({
  title,
  subheadline,
  primaryCTA,
  secondaryCTA,
  eyebrow,
  className = "",
  children, // For decorative elements
}) {
  return (
    <section 
      className={`section-padding relative overflow-hidden ${className}`}
      data-section-file="Hero.jsx"
      style={{
        backgroundColor: "var(--mkt-surface)",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Decorative children (positioned absolutely) */}
      {children}
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          {eyebrow && (
            <div 
              className="mb-4 uppercase tracking-wide"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--mkt-text-dim)",
                letterSpacing: "var(--letter-spacing-wide)",
              }}
            >
              {eyebrow}
            </div>
          )}

          {/* Title */}
          <h1 
            className="mb-6"
            style={{
              fontFamily: "var(--font-family)",
              fontSize: "var(--font-size-4xl)",
              lineHeight: "var(--line-height-tight)",
              fontWeight: "var(--font-weight-bold)",
              letterSpacing: "var(--letter-spacing-tight)",
              color: "var(--mkt-heading)",
            }}
          >
            {title}
          </h1>

          {/* Subheadline */}
          {subheadline && (
            <p 
              className="mb-8 max-w-2xl mx-auto"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-lg)",
                lineHeight: "var(--line-height-relaxed)",
                fontWeight: "var(--font-weight-normal)",
                color: "var(--mkt-text-dim)",
              }}
            >
              {subheadline}
            </p>
          )}

          {/* CTAs */}
          {(primaryCTA || secondaryCTA) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryCTA && (
                <Button
                  to={primaryCTA.to}
                  variant="primary"
                  size="lg"
                >
                  {primaryCTA.label}
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  to={secondaryCTA.to}
                  variant="secondary"
                  size="lg"
                >
                  {secondaryCTA.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
