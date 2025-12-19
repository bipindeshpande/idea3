import { Link } from "react-router-dom";

/**
 * FounderStory - V11: Humanizes the product, shows competence & motivation
 * Displays founder narrative to build trust and relatability
 */
export default function FounderStory({
  name,
  role,
  story,
  reason,
  identity,
  className = "",
}) {
  return (
    <div className={`max-w-4xl mx-auto px-4 ${className}`}>
      <div className="mkt-founder-block">
          {/* Credibility eyebrow */}
          <div className="mkt-credibility-eyebrow">
            Founder Story
          </div>
          
          {/* Founder header with photo placeholder */}
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--mkt-primary), var(--mkt-card-purple))"
              }}
            >
              {name?.charAt(0) || "F"}
            </div>
            <div className="flex-1">
              <h3 className="mkt-h3 font-semibold mb-1" style={{ color: "var(--mkt-heading)" }}>
                {name || "Founder Name"}
              </h3>
              <p className="text-sm opacity-70" style={{ color: "var(--mkt-text-dim)" }}>
                {role || "Creator of Startup Advisor"}
              </p>
            </div>
          </div>
          
          {/* Story paragraph (emotionally grounded) */}
          {story && (
            <p className="mkt-cognitive-ease mb-4">
              {story}
            </p>
          )}
          
          {/* Reason paragraph (rational competence) */}
          {reason && (
            <p className="mkt-cognitive-ease mb-4">
              {reason}
            </p>
          )}
          
          {/* Identity alignment line */}
          {identity && (
            <p className="mkt-identity mt-4 pt-4 border-t" style={{ borderColor: "var(--mkt-outline)" }}>
              {identity}
            </p>
          )}
        </div>
      </div>
  );
}

