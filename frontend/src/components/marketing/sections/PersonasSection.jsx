/**
 * PersonasSection - Who It's For Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - Clear persona presentation
 */

import Card from "../Card.jsx";

export default function PersonasSection({
  title = "Who is this for?",
  subtitle,
  personas = [], // Array of { label, description, icon }
  className = "",
}) {
  if (!personas || personas.length === 0) return null;

  return (
    <section 
      className={`section-padding ${className}`}
      data-section-file="PersonasSection.jsx"
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

        {/* Personas - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personas.map((persona, index) => {
            // Different style for each persona
            const variants = ["default", "muted", "default", "muted"];
            const variant = variants[index % variants.length];
            
            return (
            <Card 
              key={index} 
              padding="md" 
              variant={variant}
              className="text-center scroll-reveal"
            >
              {persona.icon && (
                <div 
                  className="mb-4"
                  style={{ 
                    fontSize: "48px",
                    width: "72px",
                    height: "72px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: variant === "muted" 
                      ? "var(--mkt-card-blue)" 
                      : "var(--mkt-surface-muted)",
                  }}
                >
                  {persona.icon}
                </div>
              )}
              <h3 
                className="mb-3"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-lg)",
                  lineHeight: "var(--line-height-tight)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--mkt-heading)",
                }}
              >
                {persona.label}
              </h3>
              {persona.description && (
                <p 
                  style={{
                    fontFamily: "var(--font-family)",
                    fontSize: "var(--font-size-sm)",
                    lineHeight: "var(--line-height-normal)",
                    color: "var(--mkt-text-dim)",
                  }}
                >
                  {persona.description}
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

