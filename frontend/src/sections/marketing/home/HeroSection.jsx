import Hero from "../../../components/marketing/Hero.jsx";

export default function HeroSection({ data }) {
  return (
    <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
      <Hero {...data} className="mb-0" animate="fade" />
    </section>
  );
}

