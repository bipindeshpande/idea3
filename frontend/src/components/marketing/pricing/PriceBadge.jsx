import React from "react";

export default function PriceBadge({ variant = "best", tierId }) {
  const getBadgeText = () => {
    if (tierId === "pro") return "Most Popular";
    if (tierId === "starter") return "Best Value";
    return "Most Popular";
  };

  const getBadgeColor = () => {
    if (tierId === "pro") {
      return "linear-gradient(135deg, #F97316 0%, #EA580C 100%)"; // Orange gradient for Pro
    }
    return "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"; // Blue gradient for Starter
  };

  return (
    <div
      className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2.5 font-bold rounded-full text-white shadow-xl z-30 whitespace-nowrap"
      style={{
        background: getBadgeColor(),
        fontFamily: "var(--font-family)",
        letterSpacing: "0.05em",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 3px rgba(255, 255, 255, 0.95)",
        textTransform: "uppercase",
        fontSize: "12px",
        fontWeight: "700",
        lineHeight: "1.2",
      }}
    >
      {getBadgeText()}
    </div>
  );
}

