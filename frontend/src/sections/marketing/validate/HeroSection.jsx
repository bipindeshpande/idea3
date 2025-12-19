import Hero from "../../../components/marketing/Hero.jsx";

export default function HeroSection({ data }) {
  return (
    <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
      <Hero {...data}>
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
          style={{
            height: "100%",
            width: "4px",
            background: "linear-gradient(to bottom, var(--mkt-hero-start), var(--mkt-hero-end))",
            margin: 0
          }}
        />
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
      </Hero>
    </section>
  );
}

