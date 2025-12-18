import { Link } from "react-router-dom";
import UIButton from "../ui/ui-button.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import Blob from "./Blob.jsx";

/**
 * HeroSection - Marketing hero with gradient background and blobs
 */
export default function HeroSection({ title, subtitle, primaryCTA, secondaryCTA, className = "" }) {
  return (
    <section className={`marketing-hero relative ${className}`}>
      <Blob size="large" position="top-right" />
      <Blob size="medium" position="bottom-left" />
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <UIHeading level="h1" className="marketing-hero-title text-primary mb-4">
          {title}
        </UIHeading>
        {subtitle && (
          <p className="text-xl text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {primaryCTA && (
            <UIButton
              as={Link}
              to={primaryCTA.to}
              variant="primary"
              className="marketing-btn-primary px-8 py-3 text-base"
            >
              {primaryCTA.label}
            </UIButton>
          )}
          {secondaryCTA && (
            <UIButton
              as={Link}
              to={secondaryCTA.to}
              variant="secondary"
              className="marketing-btn-secondary px-8 py-3 text-base"
            >
              {secondaryCTA.label}
            </UIButton>
          )}
        </div>
      </div>
    </section>
  );
}

