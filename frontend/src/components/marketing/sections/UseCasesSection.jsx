/**
 * UseCasesSection - Use Cases Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - Clear use case presentation
 * - Links to specific pages
 */

import Button from "../Button.jsx";
import Card from "../Card.jsx";

export default function UseCasesSection({
  title = "What can you do?",
  subtitle,
  useCases = [], // Array of { title, description, icon, cta: { to, label } }
  className = "",
}) {
  if (!useCases || useCases.length === 0) return null;

  return (
    <section 
      className={`section-padding ${className}`}
      data-section-file="UseCasesSection.jsx"
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

        {/* Use Cases - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            // Assign accent colors to different use cases
            const accents = ["primary", "accent-1", "accent-2"];
            const accent = accents[index % accents.length];
            
            return (
            <Card 
              key={index} 
              padding="md" 
              accent={accent}
              variant="elevated"
              className="scroll-reveal flex flex-col"
            >
              {useCase.icon && (
                <div 
                  className="mb-4"
                  style={{ 
                    fontSize: "48px",
                    width: "64px",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: accent === "primary" 
                      ? "var(--mkt-card-primary)" 
                      : accent === "accent-1"
                      ? "var(--mkt-card-secondary)"
                      : "var(--mkt-card-accent)", /* Use accent green for variety */
                  }}
                >
                  {useCase.icon}
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
                {useCase.title}
              </h3>
              {useCase.description && (
                <p 
                  className="mb-4 flex-grow"
                  style={{
                    fontFamily: "var(--font-family)",
                    fontSize: "var(--font-size-base)",
                    lineHeight: "var(--line-height-normal)",
                    color: "var(--mkt-text-dim)",
                  }}
                >
                  {useCase.description}
                </p>
              )}
              {useCase.cta && (
                <div className="mt-auto">
                  <Button
                    to={useCase.cta.to}
                    variant="secondary"
                    size="md"
                  >
                    {useCase.cta.label}
                  </Button>
                </div>
              )}
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

