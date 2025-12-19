import { Link } from "react-router-dom";
import UIButton from "../ui/ui-button.jsx";

/**
 * Hero - Premium marketing hero section with layered gradients, blurred shapes, and subtle animation
 * V3: Enhanced with blobs, CSS-only parallax, improved typography, and marketing CTA buttons
 */
export default function Hero({
  title,
  subheadline,
  primaryCTA,
  secondaryCTA,
  illustration,
  className = "",
  eyebrow,
  animate,
  split = "left", // V6: "left" or "right" for asymmetry
  microcopy, // V6: Microcopy under CTAs
  credibilityMicrocopy, // V11: Credibility cue under CTAs
  identity, // V8: Identity mirroring text
  loss, // V8: Loss aversion framing
  urgency, // V8: Soft urgency microcopy
  preheadline, // V10: Priming text before headline
  emotional, // V10: Use emotional gradient for headline
  anchor, // V10: Decision framing message
  supporting, // V10: System-2 rational justification
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const splitClass = split === "left" ? "mkt-split-left" : "mkt-split-right";
  return (
    <section className={`relative overflow-hidden mkt-hero-lighting ${className}`} style={{ minHeight: "450px" }}>
      {/* Hero gradient background */}
      <div className="absolute inset-0 hero-gradient" />
      
      {/* Layered blurred blobs using --mkt-blob-* tokens */}
      <div 
        className="hero-blob absolute top-1/4 -right-32 w-96 h-96"
        style={{ 
          background: "var(--mkt-blob-purple)",
          animationDelay: "0s"
        }}
      />
      <div 
        className="hero-blob absolute bottom-1/4 -left-32 w-96 h-96"
        style={{ 
          background: "var(--mkt-blob-blue)",
          animationDelay: "2s"
        }}
      />
      <div 
        className="hero-blob absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80"
        style={{ 
          background: "var(--mkt-blob-green)",
          animationDelay: "4s"
        }}
      />
      
      {/* Mouse parallax using CSS only (no JS) - using transform on hover */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-out"
        style={{
          transform: "translate(var(--mouse-x, 0), var(--mouse-y, 0))",
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className={`grid md:grid-cols-2 gap-8 items-center ${splitClass}`}>
          {/* Text content */}
          <div className={`${animationClass || "animate-mkt-fadeUp"}`}>
            {eyebrow && (
              <>
                <div className="mkt-eyebrow mb-2">
                  {eyebrow}
                </div>
                <div className="mkt-accent-bar" />
              </>
            )}
            <h1 
              className="mkt-display mb-4"
              style={{
                textShadow: "0 0 20px rgba(120, 100, 255, 0.3)"
              }}
            >
              {title}
            </h1>
            {subheadline && (
              <p 
                className="mkt-lead mb-6"
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-start gap-3 glass-surface rounded-xl p-4">
              {primaryCTA && (
                <UIButton
                  as={Link}
                  to={primaryCTA.to}
                  variant="primary"
                  className="ui-button ui-button--primary px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--mkt-primary)",
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)"
                  }}
                >
                  {primaryCTA.label}
                </UIButton>
              )}
              {secondaryCTA && (
                <UIButton
                  as={Link}
                  to={secondaryCTA.to}
                  variant="secondary"
                  className="ui-button ui-button--secondary px-6 py-3 text-base font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--mkt-surface)",
                    color: "var(--mkt-heading)",
                    border: "2px solid var(--mkt-outline)",
                  }}
                >
                  {secondaryCTA.label}
                </UIButton>
              )}
            </div>
            {/* V6: Microcopy under CTAs */}
            {microcopy && (
              <p className="text-xs mt-3 opacity-70" style={{ color: "var(--mkt-text-dim)" }}>
                {microcopy}
              </p>
            )}
            
            {/* V11: Credibility microcopy under CTAs */}
            {credibilityMicrocopy && (
              <p className="text-xs mt-2 opacity-60" style={{ color: "var(--mkt-text-dim)" }}>
                {credibilityMicrocopy}
              </p>
            )}
            
            {/* V8: Soft urgency */}
            {urgency && (
              <p className="mkt-soft-urgency mt-2">
                {urgency}
              </p>
            )}
          </div>
          
          {/* Illustration / Visual block */}
          {illustration && (
            <div className="animate-mkt-slideIn hidden md:block relative mkt-offset-y">
              {/* V6: Enhanced orb glows behind mockup */}
              <div 
                className="orb-bg absolute -top-20 -right-20 w-64 h-64"
                style={{
                  background: "var(--mkt-blob-purple)",
                  opacity: 0.3,
                  filter: "blur(80px)"
                }}
              />
              <div 
                className="orb-bg absolute -bottom-20 -left-20 w-48 h-48"
                style={{
                  background: "var(--mkt-blob-blue)",
                  opacity: 0.25,
                  filter: "blur(60px)"
                }}
              />
              <div 
                className="orb-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40"
                style={{
                  background: "var(--mkt-blob-green)",
                  opacity: 0.2,
                  filter: "blur(50px)"
                }}
              />
              {/* V6: Mockup with soft glow and reduced opacity for overlap effect */}
              <div 
                className="w-full h-72 rounded-xl card-floating card-3d relative z-10 max-w-[80%] mx-auto mkt-soft-glow"
                style={{
                  background: illustration.gradient || "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))",
                  opacity: 0.92,
                  filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))"
                }}
              >
                {illustration.content || (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-50">✨</div>
                  </div>
                )}
              </div>
              {/* V6: Caption under mockup */}
              {illustration.caption && (
                <p className="text-xs text-center mt-4 opacity-60" style={{ color: "var(--mkt-text-dim)" }}>
                  {illustration.caption}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

