import { Link } from "react-router-dom";
import UIButton from "../ui/ui-button.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import Blob from "./Blob.jsx";

/**
 * CTASection - Call-to-action section with gradient background
 */
export default function CTASection({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  gradient = false,
  className = "",
}) {
  return (
    <section className={`marketing-cta ${gradient ? "marketing-cta-gradient" : ""} relative ${className}`}>
      {gradient && <Blob size="large" position="center" />}
      {/* V5: Orb backgrounds */}
      <div 
        className="orb-bg absolute top-1/4 left-1/4 w-96 h-96"
        style={{
          background: "var(--mkt-glow-primary)",
          opacity: 0.2
        }}
      />
      <div 
        className="orb-bg absolute bottom-1/4 right-1/4 w-80 h-80"
        style={{
          background: "var(--mkt-glow-primary)",
          opacity: 0.15
        }}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center px-4 glass-surface rounded-3xl p-12">
        <UIHeading level="h2" className="marketing-section-title text-primary mb-4">
          {title}
        </UIHeading>
        {description && (
          <p className="text-base text-secondary mb-8 leading-relaxed">
            {description}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCTA && (
            <UIButton
              as={Link}
              to={primaryCTA.to}
              variant={gradient ? "secondary" : "primary"}
              className={gradient ? "marketing-btn-secondary" : "marketing-btn-primary px-8 py-3 text-base"}
            >
              {primaryCTA.label}
            </UIButton>
          )}
          {secondaryCTA && (
            <UIButton
              as={Link}
              to={secondaryCTA.to}
              variant={gradient ? "primary" : "secondary"}
              className={gradient ? "marketing-btn-primary" : "marketing-btn-secondary px-8 py-3 text-base"}
            >
              {secondaryCTA.label}
            </UIButton>
          )}
        </div>
      </div>
    </section>
  );
}

