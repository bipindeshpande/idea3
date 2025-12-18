import { useState } from "react";
import UIButton from "../ui/ui-button.jsx";

/**
 * PricingTable - Stripe-like pricing cards with floating layers and shadows
 */
export default function PricingTable({
  plans = [],
  features = [],
  billingCycle = "monthly",
  onBillingCycleChange,
  className = "",
  animate,
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const [selectedCycle, setSelectedCycle] = useState(billingCycle);

  const handleCycleChange = (cycle) => {
    setSelectedCycle(cycle);
    if (onBillingCycleChange) {
      onBillingCycleChange(cycle);
    }
  };

  return (
    <div className={`${animationClass || ""} ${className}`}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => handleCycleChange("monthly")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            selectedCycle === "monthly"
              ? "scale-105"
              : "opacity-60 hover:opacity-80"
          }`}
          style={{
            background: selectedCycle === "monthly" ? "var(--mkt-primary)" : "var(--mkt-surface)",
            color: selectedCycle === "monthly" ? "white" : "var(--mkt-heading)",
            border: selectedCycle === "monthly" ? "none" : "2px solid var(--mkt-outline)",
            boxShadow: selectedCycle === "monthly" ? "var(--mkt-card-shadow)" : "none"
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => handleCycleChange("yearly")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
            selectedCycle === "yearly"
              ? "scale-105"
              : "opacity-60 hover:opacity-80"
          }`}
          style={{
            background: selectedCycle === "yearly" ? "var(--mkt-primary)" : "var(--mkt-surface)",
            color: selectedCycle === "yearly" ? "white" : "var(--mkt-heading)",
            border: selectedCycle === "yearly" ? "none" : "2px solid var(--mkt-outline)",
            boxShadow: selectedCycle === "yearly" ? "var(--mkt-card-shadow)" : "none"
          }}
        >
          Yearly
          <span className="ml-2 text-sm opacity-90">Save 20%</span>
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((plan, index) => {
          const price = selectedCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
          const isPopular = plan.popular;

          return (
            <div
              key={plan.id || index}
              className={`relative rounded-3xl p-8 transition-all duration-300 ${
                isPopular ? "scale-105 card-3d" : ""
              }`}
              style={{
                background: isPopular ? "var(--mkt-surface)" : "var(--mkt-surface)",
                border: isPopular ? "3px solid var(--mkt-primary)" : "2px solid var(--mkt-outline)",
                boxShadow: isPopular ? "var(--mkt-card-3d-shadow)" : "var(--mkt-card-shadow)",
                transform: "translateZ(0)",
              }}
              onMouseEnter={(e) => {
                if (!isPopular) {
                  e.currentTarget.style.transform = "translateZ(0) scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isPopular) {
                  e.currentTarget.style.transform = "translateZ(0) scale(1)";
                }
              }}
            >
              {isPopular && (
                <div 
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold"
                  style={{
                    background: "var(--mkt-primary)",
                    color: "white"
                  }}
                >
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 
                  className="mkt-h3 font-bold mb-2"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  {plan.name}
                </h3>
                {plan.description && (
                  <p 
                    className="text-sm mb-4"
                    style={{ color: "var(--mkt-text-dim)" }}
                  >
                    {plan.description}
                  </p>
                )}
                <div className="flex items-baseline">
                  <span 
                    className="text-5xl font-bold"
                    style={{ color: "var(--mkt-heading)" }}
                  >
                    ${price}
                  </span>
                  <span 
                    className="text-lg ml-2"
                    style={{ color: "var(--mkt-text-dim)" }}
                  >
                    /{selectedCycle === "monthly" ? "mo" : "yr"}
                  </span>
                </div>
              </div>

              {plan.cta && (
                <UIButton
                  as={plan.cta.to ? "a" : "button"}
                  href={plan.cta.to}
                  variant={isPopular ? "primary" : "secondary"}
                  className="w-full mb-6 py-4 rounded-xl font-semibold"
                  style={isPopular ? {
                    background: "var(--mkt-primary)",
                    color: "white"
                  } : {
                    background: "var(--mkt-surface-muted)",
                    color: "var(--mkt-heading)",
                    border: "2px solid var(--mkt-outline)"
                  }}
                >
                  {plan.cta.label}
                </UIButton>
              )}

              {plan.features && (
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span 
                        className="text-xl mr-3 mt-0.5"
                        style={{ color: "var(--mkt-primary)" }}
                      >
                        ✓
                      </span>
                      <span 
                        className="text-base"
                        style={{ color: "var(--mkt-paragraph)" }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      {features.length > 0 && (
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--mkt-outline)" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: "2px solid var(--mkt-divider)" }}>
                <th 
                  className="text-left py-4 px-6 font-semibold"
                  style={{ color: "var(--mkt-heading)", background: "var(--mkt-surface-muted)" }}
                >
                  Feature
                </th>
                {plans.map((plan, idx) => (
                  <th 
                    key={idx} 
                    className="text-center py-4 px-6 font-semibold"
                    style={{ color: "var(--mkt-heading)", background: "var(--mkt-surface-muted)" }}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr 
                  key={idx}
                  style={{ borderBottom: "1px solid var(--mkt-divider)" }}
                >
                  <td 
                    className="py-4 px-6"
                    style={{ color: "var(--mkt-paragraph)" }}
                  >
                    {feature.name}
                  </td>
                  {plans.map((plan, planIdx) => (
                    <td 
                      key={planIdx} 
                      className="text-center py-4 px-6"
                    >
                      {feature.values[planIdx] === true ? (
                        <span 
                          className="text-2xl"
                          style={{ color: "var(--mkt-primary)" }}
                        >
                          ✓
                        </span>
                      ) : feature.values[planIdx] === false ? (
                        <span style={{ color: "var(--mkt-text-dim)" }}>—</span>
                      ) : (
                        <span style={{ color: "var(--mkt-paragraph)" }}>{feature.values[planIdx]}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
