/**
 * LandingHeroSection - Landing page hero
 * Uses standardized HeroSection wrapper
 * Note: This maintains the old gradient background style for landing pages
 */

import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function LandingHeroSection({ title, subtitle, primaryCTA, secondaryCTA, className = "", ...props }) {
  return (
    <HeroSection
      title={title || "Validate your idea or discover new opportunities"}
      subheadline={subtitle}
      primaryCTA={primaryCTA}
      secondaryCTA={secondaryCTA}
      wrapperClassName="marketing-hero relative"
      className={className}
      {...props}
    >
      {/* Scroll indicator - positioned absolutely within hero */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-fadeInDown delay-300">
        <svg className="w-6 h-6 mx-auto text-white/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </HeroSection>
  );
}

