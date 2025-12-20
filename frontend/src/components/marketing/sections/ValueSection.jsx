/**
 * ValueSection - Value Proposition Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - Clear hierarchy
 * - 3-4 value points max
 */

import Card from "../Card.jsx";

export default function ValueSection({
  title,
  subtitle,
  items = [], // Array of { title, description, icon? }
  className = "",
}) {
  if (!items || items.length === 0) return null;

  return (
    <section 
      className={`section-padding ${className}`}
      data-section-file="ValueSection.jsx"
    >
      <div className="container">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 
                className="mb-4"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-3xl)",
                  lineHeight: "var(--line-height-tight)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--mkt-heading)",
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p 
                className="max-w-2xl mx-auto"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-lg)",
                  lineHeight: "var(--line-height-relaxed)",
                  color: "var(--mkt-text-dim)",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Value Items - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => {
            // Cycle through accent colors for variety
            const accents = [null, "primary", "accent-1", null, "accent-2"];
            const accent = accents[index % accents.length];
            
            return (
            <Card 
              key={index} 
              padding="md" 
              accent={accent}
              variant={index % 3 === 0 ? "muted" : "default"}
              className="scroll-reveal"
            >
              {item.icon && (
                <div 
                  className="mb-4"
                  style={{ 
                    fontSize: "40px",
                    display: "inline-block",
                    padding: "var(--space-2)",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: accent 
                      ? (accent === "primary" 
                          ? "var(--mkt-card-blue)" 
                          : accent === "accent-1"
                          ? "var(--mkt-card-purple)"
                          : "var(--mkt-card-green)")
                      : "var(--mkt-surface-muted)",
                  }}
                >
                  {item.icon}
                </div>
              )}
              <h3 
                className="mb-3"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-xl)",
                  lineHeight: "var(--line-height-tight)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--mkt-heading)",
                }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p 
                  style={{
                    fontFamily: "var(--font-family)",
                    fontSize: "var(--font-size-base)",
                    lineHeight: "var(--line-height-normal)",
                    color: "var(--mkt-text-dim)",
                  }}
                >
                  {item.description}
                </p>
              )}
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

