import Hero from "../../../components/marketing/Hero.jsx";

export default function HeroSection({ data }) {
  return (
    <section className="mkt-section-lg" style={{ background: "var(--mkt-surface)" }}>
      <Hero {...data}>
        <div className="absolute top-20 right-10 text-4xl opacity-20 animate-mkt-float" style={{ animationDelay: "0s" }}>💡</div>
        <div className="absolute top-40 left-10 text-3xl opacity-15 animate-mkt-float" style={{ animationDelay: "1s" }}>✨</div>
        <div className="absolute bottom-32 right-20 text-3xl opacity-20 animate-mkt-float" style={{ animationDelay: "2s" }}>⚡</div>
      </Hero>
    </section>
  );
}

