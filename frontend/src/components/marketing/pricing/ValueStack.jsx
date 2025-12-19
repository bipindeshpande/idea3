import React from "react";

export default function ValueStack({ items = [] }) {
  return (
    <div 
      className="mt-6 p-4 rounded-xl"
      style={{
        background: "var(--mkt-surface)",
        border: "1px solid var(--mkt-outline)"
      }}
    >
      <h4 className="text-base font-semibold mb-3">Everything included:</h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold" style={{ color: "var(--mkt-primary)" }}>✓</span>
            <span className="opacity-80 text-sm" style={{ color: "var(--mkt-text)" }}>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

