import HeroSection from "../../../components/marketing/HeroSection.jsx";

export default function AboutHeroSection({ title, subtitle, primaryCTA, secondaryCTA, className = "" }) {
  return (
    <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
      <HeroSection
        title={title}
        subtitle={subtitle}
        primaryCTA={primaryCTA}
        secondaryCTA={secondaryCTA}
        className={className}
      />
    </section>
  );
}

