import { Link } from "react-router-dom";
import SectionTitle from "../../../components/marketing/SectionTitle.jsx";
import MockupBrowser from "../../../components/marketing/mockups/MockupBrowser.jsx";

export default function MockupSection({ data }) {
  return (
    <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
      <div className="max-w-7xl mx-auto px-6">
        <SectionTitle
          title="Validation Report Preview"
          subtitle="See what your comprehensive validation report looks like"
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.kpis.map((kpi, i) => (
              <div key={i} className="p-4 rounded-lg glass-surface">
                <div className="text-xs font-semibold opacity-80 mb-2" style={{ color: "var(--mkt-text-dim)" }}>{kpi.label}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-xs opacity-70" style={{ color: "var(--mkt-text-dim)" }}>{kpi.desc}</div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link 
              to="/product/validate" 
              className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all"
              style={{ color: "var(--mkt-primary)" }}
            >
              How scoring works →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

