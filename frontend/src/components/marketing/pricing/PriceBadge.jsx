import React from "react";

export default function PriceBadge({ variant = "best" }) {
  const map = {
    best: "Most Popular",
    value: "Best Value",
    pro: "For Serious Founders",
  };

  return (
    <div
      className="absolute -top-3 left-3 px-3 py-1 text-xs font-semibold rounded-md text-white shadow-md"
      style={{
        background: "linear-gradient(to right, var(--mkt-primary), var(--mkt-card-purple))"
      }}
    >
      {map[variant] || map.best}
    </div>
  );
}

