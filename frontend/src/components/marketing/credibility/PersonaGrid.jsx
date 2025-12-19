/**
 * PersonaGrid - V11: Let visitors identify themselves
 * Grid of persona cards to help users find their fit
 */
export default function PersonaGrid({
  personas = [],
  className = "",
}) {
  if (!personas || personas.length === 0) {
    return null;
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {personas.map((persona, index) => (
            <div
              key={index}
              className="p-5 rounded-xl mkt-cognitive-ease"
              style={{
                background: "var(--mkt-surface-muted)",
                border: "1px solid var(--mkt-outline)",
                boxShadow: "var(--mkt-card-shadow)"
              }}
            >
              {persona.icon && (
                <div className="text-3xl mb-3">{persona.icon}</div>
              )}
              <div className="mkt-persona-badge inline-block mb-3">
                {persona.label}
              </div>
              {persona.description && (
                <p className="text-sm mt-3" style={{ color: "var(--mkt-paragraph)" }}>
                  {persona.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
  );
}

