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
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  return (
    <section className={`relative overflow-hidden mkt-pad-section ${className}`}>
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
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text content */}
          <div className={`${animationClass || "animate-mkt-fadeUp"}`}>
            {eyebrow && (
              <div className="mkt-eyebrow mb-4">
                {eyebrow}
              </div>
            )}
            <h1 
              className="mkt-display mb-6"
              style={{
                textShadow: "0 0 20px rgba(120, 100, 255, 0.3)"
              }}
            >
              {title}
            </h1>
            {subheadline && (
              <p 
                className="mkt-lead mb-10"
              >
                {subheadline}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-start gap-4 glass-surface rounded-2xl p-6">
              {primaryCTA && (
                <UIButton
                  as={Link}
                  to={primaryCTA.to}
                  variant="primary"
                  className="ui-button ui-button--primary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
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
                  className="ui-button ui-button--secondary px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
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
          </div>
          
          {/* Illustration / Visual block */}
          {illustration && (
            <div className="animate-mkt-slideIn hidden md:block relative">
              {/* Blurred orb accents behind mockup (V5) */}
              <div 
                className="orb-bg absolute -top-20 -right-20 w-64 h-64"
                style={{
                  background: "var(--mkt-glow-primary)",
                  opacity: 0.3
                }}
              />
              <div 
                className="orb-bg absolute -bottom-20 -left-20 w-48 h-48"
                style={{
                  background: "var(--mkt-glow-primary)",
                  opacity: 0.2
                }}
              />
              <div 
                className="w-full h-96 rounded-2xl card-floating card-3d relative z-10"
                style={{
                  background: illustration.gradient || "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))",
                }}
              >
                {illustration.content || (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl opacity-50">✨</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
