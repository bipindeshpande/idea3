import { Link } from "react-router-dom";
import UIButton from "../../../components/ui/ui-button.jsx";
import UIHeading from "../../../components/ui/ui-heading.jsx";

export default function LandingHeroSection({ title, subtitle, primaryCTA, secondaryCTA, className = "" }) {
  return (
    <section className="marketing-hero relative">
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
        <UIHeading level="h1" className="marketing-hero-title text-white mb-6 animate-fadeInDown">
          {title || "Validate your idea or discover new opportunities"}
        </UIHeading>
        {subtitle && (
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed animate-fadeInDown delay-100">
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInDown delay-200">
          {primaryCTA && (
            <UIButton
              as={Link}
              to={primaryCTA.to}
              variant="secondary"
              className="bg-white text-accent hover:bg-white/90 px-8 py-3 text-sm font-medium"
            >
              {primaryCTA.label}
            </UIButton>
          )}
          {secondaryCTA && (
            <UIButton
              as={Link}
              to={secondaryCTA.to}
              variant="secondary"
              className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 px-8 py-3 text-sm font-medium"
            >
              {secondaryCTA.label}
            </UIButton>
          )}
        </div>
        <div className="mt-12 animate-fadeInDown delay-300">
          <svg className="w-6 h-6 mx-auto text-white/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

