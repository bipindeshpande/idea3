import Hero from "../../../components/marketing/Hero.jsx";

export default function ProductHeroSection({ data, ...props }) {
  return (
    <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
      <Hero {...data} {...props} className="mb-0" />
    </section>
  );
}

