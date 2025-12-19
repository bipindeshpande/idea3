import SectionHeader from "../../../components/marketing/SectionHeader.jsx";

export default function CostSection({ items, fearRemovalText }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-4xl mx-auto px-6">
        <SectionHeader title="What's the real cost of choosing wrong?" center className="mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {items.map((item, i) => (
            <div key={i} className="p-5 rounded-xl" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
              <h4 className="font-semibold mb-3 mkt-body" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
              <p className="mkt-body" style={{ color: "var(--mkt-paragraph)", fontSize: "0.875rem" }}>{item.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="p-6 rounded-xl text-center" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
          <p className="mkt-body font-semibold mb-2" style={{ color: "var(--mkt-heading)" }}>
            {fearRemovalText.title}
          </p>
          <p className="mkt-identity mt-2">
            {fearRemovalText.description}
          </p>
        </div>
      </div>
    </section>
  );
}

