import React from "react";

export default function ValueStack({ items = [] }) {
  return (
    <div 
      className="p-4 rounded-lg"
      style={{
        background: "rgba(255, 255, 255, 0.6)",
        border: "1px solid rgba(37, 99, 235, 0.15)",
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.8)",
      }}
    >
      <h4 
        className="mb-3"
        style={{
          fontFamily: "var(--font-family)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--mkt-heading)",
        }}
      >
        Everything included:
      </h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <div
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                color: "white",
                fontSize: "10px",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              ✓
            </div>
            <span 
              className="flex-1"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-sm)",
                lineHeight: "var(--line-height-normal)",
                color: "var(--mkt-text)",
                fontWeight: "var(--font-weight-normal)",
              }}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

