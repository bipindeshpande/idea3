import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function PricingHeroSection({ title, subtitle, primaryCTA, secondaryCTA, className = "", ...props }) {
  return (
    <HeroSection
      title={title}
      subheadline={subtitle}
      primaryCTA={primaryCTA}
      secondaryCTA={secondaryCTA}
      className={className}
      {...props}
    />
  );
}

