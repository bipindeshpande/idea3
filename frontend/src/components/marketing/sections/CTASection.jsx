/**
 * CTASection - Call to Action Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - Clear conversion focus
 */

import Button from "../Button.jsx";
import Card from "../Card.jsx";

export default function CTASection({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  variant = "default", // default, primary (uses primary background)
  className = "",
}) {
  return (
    <section 
      className={`section-padding ${className}`}
      data-section-file="CTASection.jsx"
      style={{
        backgroundColor: variant === "primary" 
          ? "var(--mkt-primary)" 
          : "var(--mkt-surface)",
      }}
    >
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <Card 
            variant={variant === "primary" ? "default" : "muted"}
            padding="lg"
          >
            <h2 
              className="mb-4"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-3xl)",
                lineHeight: "var(--line-height-tight)",
                fontWeight: "var(--font-weight-bold)",
                color: variant === "primary" 
                  ? "white" 
                  : "var(--mkt-heading)",
              }}
            >
              {title}
            </h2>
            
            {description && (
              <p 
                className="mb-8"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-base)",
                  lineHeight: "var(--line-height-relaxed)",
                  color: "var(--mkt-text-dim)",
                }}
              >
                {description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryCTA && (
                <Button
                  to={primaryCTA.to}
                  variant={variant === "primary" ? "secondary" : "primary"}
                  size="lg"
                >
                  {primaryCTA.label}
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  to={secondaryCTA.to}
                  variant={variant === "primary" ? "primary" : "secondary"}
                  size="lg"
                >
                  {secondaryCTA.label}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

