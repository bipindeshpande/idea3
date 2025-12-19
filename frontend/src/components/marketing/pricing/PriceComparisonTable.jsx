import React from "react";

export default function PriceComparisonTable() {
  const rows = [
    { label: "Founder-fit scoring", free: false, starter: true, pro: true },
    { label: "Market viability scoring", free: false, starter: true, pro: true },
    { label: "Idea ranking", free: true, starter: true, pro: true },
    { label: "Validation reports", free: false, starter: true, pro: true },
    { label: "Unlimited idea generation", free: false, starter: true, pro: true },
  ];

  return (
    <div 
      className="rounded-xl p-6"
      style={{
        border: "1px solid var(--mkt-outline)"
      }}
    >
      <h3 className="mkt-h3 font-semibold mb-4">Compare Plans</h3>

      <div className="grid grid-cols-4 gap-2 mkt-body font-medium">
        <div></div>
        <div className="text-center" style={{ color: "var(--mkt-text)" }}>Free</div>
        <div className="text-center font-semibold" style={{ color: "var(--mkt-primary)" }}>Starter</div>
        <div className="text-center" style={{ color: "var(--mkt-text)" }}>Pro</div>

        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <div className="py-2 opacity-80" style={{ color: "var(--mkt-text)" }}>{r.label}</div>

            <div className="text-center py-2" style={{ color: "var(--mkt-text)" }}>
              {r.free ? "✓" : <span className="opacity-40">—</span>}
            </div>

            <div className="text-center py-2 font-bold" style={{ color: "var(--mkt-primary)" }}>
              {r.starter ? "✓" : <span className="opacity-40">—</span>}
            </div>

            <div className="text-center py-2" style={{ color: "var(--mkt-text)" }}>
              {r.pro ? "✓" : <span className="opacity-40">—</span>}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

