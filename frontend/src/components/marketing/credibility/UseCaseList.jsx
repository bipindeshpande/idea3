import { Link } from "react-router-dom";

/**
 * UseCaseList - V11: Give users "people like me" scenarios
 * High-converting use case scenarios with pain → outcome structure
 */
export default function UseCaseList({
  items = [],
  ctaText = "See how the product handles this →",
  ctaTo,
  className = "",
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`max-w-4xl mx-auto px-6 ${className}`}>
      <div className="space-y-8">
          {items.map((item, index) => (
            <div key={index}>
              <div className="p-6 rounded-xl" style={{
                background: "var(--mkt-surface-muted)",
                border: "1px solid var(--mkt-outline)"
              }}>
                {/* Title */}
                {item.title && (
                  <h4 className="mkt-h3 font-semibold mb-3" style={{ color: "var(--mkt-heading)" }}>
                    {item.title}
                  </h4>
                )}
                
                {/* Scenario (pain) */}
                {item.scenario && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--mkt-heading)" }}>
                      Scenario:
                    </p>
                    <p className="mkt-cognitive-ease italic">
                      "{item.scenario}"
                    </p>
                  </div>
                )}
                
                {/* Outcome (resolution) */}
                {item.outcome && (
                  <div>
                    <p className="text-sm font-medium mb-2" style={{ color: "var(--mkt-heading)" }}>
                      Outcome:
                    </p>
                    <p className="mkt-cognitive-ease">
                      {item.outcome}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Divider between items (except last) */}
              {index < items.length - 1 && (
                <div className="mkt-cred-divider" />
              )}
            </div>
          ))}
        </div>
        
        {/* CTA at bottom */}
        {ctaTo && (
          <div className="text-center mt-8">
            <Link 
              to={ctaTo}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
  );
}

