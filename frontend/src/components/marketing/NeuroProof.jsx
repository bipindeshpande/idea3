import { Link } from "react-router-dom";

/**
 * NeuroProof - Single strong testimonial with emotional + rational structure
 * V10: Neural Framework component
 */
export default function NeuroProof({
  emotionalQuote,
  rationalJustification,
  founderName,
  founderRole,
  ctaText = "This is why founders trust it →",
  ctaTo,
  className = "",
}) {
  return (
    <div className={`max-w-3xl mx-auto px-6 ${className}`}>
      <div className="p-8 rounded-xl mkt-soft-glow" style={{ 
          background: "var(--mkt-surface-muted)", 
          border: "2px solid var(--mkt-primary)" 
        }}>
          {/* Emotional quote (big) */}
          <blockquote className="mb-6">
            <p className="text-2xl font-bold mkt-emotional mb-4">
              "{emotionalQuote}"
            </p>
          </blockquote>
          
          {/* Rational short paragraph */}
          <p className="mkt-cognitive-ease mb-6">
            {rationalJustification}
          </p>
          
          {/* Founder name + role */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
              {founderName?.charAt(0) || "F"}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--mkt-heading)" }}>
                {founderName}
              </p>
              <p className="text-xs opacity-70" style={{ color: "var(--mkt-text-dim)" }}>
                {founderRole}
              </p>
            </div>
          </div>
          
          {/* CTA micro text */}
          {ctaTo && (
            <Link 
              to={ctaTo}
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
  );
}

