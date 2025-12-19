import { Link } from "react-router-dom";
import SectionTitle from "../../../components/marketing/SectionTitle.jsx";

export default function ClarityMattersSection({ items }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-4xl mx-auto px-4">
        <SectionTitle
          title="Why clarity matters more than ideas"
          subtitle="The real cost of choosing wrong"
          center
          animate="slide"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
              <p className="text-xs" style={{ color: "var(--mkt-paragraph)" }}>{item.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link 
            to="/advisor" 
            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
            style={{ color: "var(--mkt-primary)" }}
          >
            Find the idea that fits your life →
          </Link>
        </div>
      </div>
    </section>
  );
}

