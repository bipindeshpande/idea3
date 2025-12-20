import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function DiscoverHeroSection({ data, ...props }) {
  return (
    <HeroSection
      data={data}
      wrapperClassName="mkt-section-lg"
      wrapperStyle={{ background: "var(--mkt-surface)" }}
      {...props}
    >
      <div className="absolute top-20 right-10 text-4xl opacity-20 animate-mkt-float" style={{ animationDelay: "0s" }}>💡</div>
      <div className="absolute bottom-32 left-10 text-3xl opacity-15 animate-mkt-float" style={{ animationDelay: "1s" }}>✨</div>
      <div className="absolute bottom-32 right-20 text-3xl opacity-20 animate-mkt-float" style={{ animationDelay: "2s" }}>⚡</div>
    </HeroSection>
  );
}

