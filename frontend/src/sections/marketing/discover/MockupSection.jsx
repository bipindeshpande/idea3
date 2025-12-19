import SectionTitle from "../../../components/marketing/SectionTitle.jsx";
import MockupBrowser from "../../../components/marketing/mockups/MockupBrowser.jsx";

export default function MockupSection({ data }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          title="Discovery Dashboard Preview"
          subtitle="See how our AI generates personalized recommendations"
          center
        />
        <div className="max-w-5xl mx-auto">
          <MockupBrowser url={data.url} caption={data.caption}>
            <div 
              className="w-full h-80 rounded-lg"
              style={{ 
                background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
                border: "1px solid var(--mkt-outline)"
              }}
            />
          </MockupBrowser>
          
          <div className="flex flex-wrap justify-center gap-4">
            {data.badges.map((badge, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-surface">
                <span className="text-xs font-semibold opacity-80" style={{ color: "var(--mkt-text-dim)" }}>{badge.label}</span>
                <span className="text-sm font-bold" style={{ color: badge.color }}>{badge.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

