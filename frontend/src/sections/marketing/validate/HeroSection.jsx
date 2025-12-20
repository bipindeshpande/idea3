import HeroSection from "../../../components/marketing/sections/HeroSection.jsx";

export default function ValidateHeroSection({ data, ...props }) {
  return (
    <HeroSection
      data={data}
      wrapperClassName="mkt-section-lg"
      wrapperStyle={{ background: "var(--mkt-surface)" }}
      {...props}
    >
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--mkt-outline) 1px, transparent 1px),
            linear-gradient(to bottom, var(--mkt-outline) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />
    </HeroSection>
  );
}

