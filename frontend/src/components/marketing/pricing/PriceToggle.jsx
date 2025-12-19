import React, { useState } from "react";

export default function PriceToggle({ monthlyPrice, yearlyPrice, onToggle }) {
  const [yearly, setYearly] = useState(true);

  const handle = () => {
    const value = !yearly;
    setYearly(value);
    onToggle?.(value);
  };

  return (
    <div className="flex items-center gap-4 my-6 justify-center">
      <button
        onClick={handle}
        className="px-4 py-2 rounded-full border mkt-body font-medium"
        style={{
          opacity: yearly ? 0.4 : 1,
          borderColor: yearly ? "var(--mkt-outline)" : "var(--mkt-primary)",
          color: "var(--mkt-text)",
          background: "var(--mkt-surface)"
        }}
      >
        Monthly
      </button>

      <button
        onClick={handle}
        className="px-4 py-2 rounded-full border mkt-body font-medium"
        style={{
          opacity: yearly ? 1 : 0.4,
          borderColor: yearly ? "var(--mkt-primary)" : "var(--mkt-outline)",
          color: "var(--mkt-text)",
          background: "var(--mkt-surface)"
        }}
      >
        Yearly • Save 35%
      </button>
    </div>
  );
}

