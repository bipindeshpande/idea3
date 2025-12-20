/**
 * HowItWorksSection - Process/Steps Section
 * 
 * Rules:
 * - Uses tokens only
 * - Card-based design
 * - 3-4 steps max
 * - Clear visual flow
 */

import Card from "../Card.jsx";

export default function HowItWorksSection({
  title,
  subtitle,
  steps = [], // Array of { step, title, description }
  className = "",
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section 
      className={`section-padding ${className}`}
      data-section-file="HowItWorksSection.jsx"
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

        {/* Steps - Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative scroll-reveal">
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div 
                  className="hidden md:block absolute top-12 left-full w-full h-0.5"
                  style={{
                    backgroundColor: "var(--mkt-outline)",
                    width: "calc(100% - 48px)",
                    marginLeft: "24px",
                  }}
                />
              )}
              
              <Card 
                padding="md" 
                variant={index === 1 ? "elevated" : "default"}
                accent={index === 0 ? "primary" : null}
                className="text-center"
              >
                {/* Step Number */}
                <div 
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: index === 0 
                      ? "var(--mkt-primary)" 
                      : index === 1
                      ? "rgba(139, 92, 246, 0.8)" // Purple accent
                      : "rgba(34, 197, 94, 0.8)", // Green accent
                    color: "white",
                    fontFamily: "var(--font-family)",
                    fontSize: "var(--font-size-xl)",
                    boxShadow: "var(--shadow-md)",
                  }}
                >
                  {step.step || index + 1}
                </div>
                
                {/* Step Title */}
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
                  {step.title}
                </h3>
                
                {/* Step Description */}
                {step.description && (
                  <p 
                    style={{
                      fontFamily: "var(--font-family)",
                      fontSize: "var(--font-size-base)",
                      lineHeight: "var(--line-height-normal)",
                      color: "var(--mkt-text-dim)",
                    }}
                  >
                    {step.description}
                  </p>
                )}
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

