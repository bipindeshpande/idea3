import { Link } from "react-router-dom";

export default function FinalCTASection({ data }) {
  return (
    <section className="mkt-section-lg relative overflow-hidden" style={{ background: "var(--mkt-primary)" }}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center scroll-reveal">
        <h2 
          className="mkt-h2 font-bold mb-4 text-white"
        >
          {data.title}
        </h2>
        <p 
          className="mkt-body mb-6 text-white/90 leading-relaxed"
        >
          {data.description}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={data.primaryCTA.to}
            className="px-8 py-4 bg-white text-primary rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            style={{
              color: "var(--mkt-primary)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            {data.primaryCTA.label}
          </Link>
          <Link
            to={data.secondaryCTA.to}
            className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105"
          >
            {data.secondaryCTA.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

