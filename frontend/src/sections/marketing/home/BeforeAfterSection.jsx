import SectionTitle from "../../../components/marketing/SectionTitle.jsx";

export default function BeforeAfterSection({ before, after }) {
  return (
    <section className="mkt-section mkt-section-bg-diagonal" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <SectionTitle
          title="Your journey before & after"
          subtitle="See the transformation"
          center
          animate="slide"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="p-8 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--mkt-heading)" }}>Before</h3>
            <ul className="space-y-3">
              {before.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-red-500 mt-1">✗</span>
                  <span className="text-sm" style={{ color: "var(--mkt-paragraph)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
            <div 
              className="w-16 h-1 rounded-full"
              style={{
                background: "linear-gradient(to right, var(--mkt-hero-start), var(--mkt-hero-end))"
              }}
            />
            <div className="text-center mt-2">
              <span className="text-2xl">→</span>
            </div>
          </div>
          
          <div className="p-8 rounded-xl mkt-soft-glow" style={{ background: "var(--mkt-surface)", border: "2px solid var(--mkt-primary)" }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--mkt-heading)" }}>After</h3>
            <ul className="space-y-3">
              {after.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-sm" style={{ color: "var(--mkt-paragraph)" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

