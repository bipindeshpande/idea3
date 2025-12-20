import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function NetworkHeroSection({ data, ...props }) {
  return (
    <HeroSection
      data={data}
      wrapperClassName="mkt-section-lg"
      wrapperStyle={{ background: "var(--mkt-surface)" }}
      className="mb-0"
      {...props}
    />
  );
}

