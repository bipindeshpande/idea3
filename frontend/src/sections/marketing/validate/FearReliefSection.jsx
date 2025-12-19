import { Link } from "react-router-dom";

export default function FearReliefSection({ data }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div>
          <h3 className="text-2xl font-bold mkt-emotional">
            {data.fear.title}
          </h3>
          <ul className="space-y-3">
            {data.fear.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-4 rounded-lg" style={{ 
                background: "var(--mkt-surface-muted)", 
                border: "1px solid var(--mkt-outline)" 
              }}>
                <span className="text-red-500 mt-0.5">⚠</span>
                <span className="text-sm" style={{ color: "var(--mkt-paragraph)" }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-6 rounded-xl mkt-soft-glow" style={{ 
          background: "var(--mkt-surface)", 
          border: "2px solid var(--mkt-primary)" 
        }}>
          <h4 className="font-semibold mb-4 text-sm" style={{ color: "var(--mkt-heading)" }}>
            {data.relief.title}
          </h4>
          <p className="mkt-cognitive-ease mb-4">
            {data.relief.description}
          </p>
          <div className="text-center mt-6">
            <Link 
              to="/product/validate" 
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              Get clarity before you commit →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

