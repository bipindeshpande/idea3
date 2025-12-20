import { useAuth } from "../../../context/AuthContext.jsx";
import Button from "../../../components/marketing/Button.jsx";
import PriceBadge from "../../../components/marketing/pricing/PriceBadge.jsx";
import ValueStack from "../../../components/marketing/pricing/ValueStack.jsx";

export default function PricingTiersSection({ tiers, valueStackItems, onSubscribe }) {
  const { isAuthenticated, subscription } = useAuth();

  return (
    <section className="section-padding" style={{ background: "var(--mkt-surface)" }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.filter(t => !t.annual).map((tier) => {
          const isCurrentPlan = isAuthenticated && subscription && subscription.type === tier.id && subscription.is_active;
          const isStarter = tier.id === "starter";
          const isPro = tier.id === "pro";
          const isHighlighted = isStarter || isPro || tier.highlight;
          
          // Card background gradients based on tier - refined colors
          const getCardBackground = () => {
            if (tier.id === "free") return "var(--mkt-surface)";
            if (tier.id === "starter") return "linear-gradient(135deg, var(--mkt-card-blue) 0%, var(--mkt-card-blue) 100%)";
            if (tier.id === "pro") return "linear-gradient(135deg, var(--mkt-card-orange) 0%, var(--mkt-card-orange) 100%)";
            return "var(--mkt-surface)";
          };

          // Border color for highlighted cards
          const getBorderColor = () => {
            if (tier.id === "starter") return "var(--mkt-primary)"; // Blue
            if (tier.id === "pro") return "var(--warning)"; // Orange
            return "var(--mkt-outline)";
          };

          return (
            <div
              key={tier.id}
              className="relative group"
              style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                paddingTop: isHighlighted ? "20px" : "0",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 40px -12px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--mkt-card-shadow)";
              }}
            >
              {/* Badge - positioned relative to parent container */}
              {isStarter && <PriceBadge variant="best" tierId="starter" />}
              {isPro && <PriceBadge variant="best" tierId="pro" />}

              {/* Card */}
              <div
                className="relative h-full rounded-xl overflow-hidden"
                style={{
                  background: getCardBackground(),
                  border: isHighlighted 
                    ? `2px solid ${getBorderColor()}` 
                    : "1px solid var(--mkt-outline)",
                  boxShadow: isHighlighted 
                    ? `0 8px 24px -8px ${tier.id === "starter" ? "rgba(37, 99, 235, 0.25)" : "rgba(217, 119, 6, 0.25)"}, var(--mkt-card-shadow)` 
                    : "var(--mkt-card-shadow)",
                  padding: "var(--space-32)",
                  transition: "all 0.3s ease",
                  paddingTop: isHighlighted ? "calc(var(--space-32) + 12px)" : "var(--space-32)",
                }}
              >
                {/* Top accent border for highlighted cards */}
                {isHighlighted && (
                  <div 
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{
                      background: tier.id === "starter" 
                        ? "linear-gradient(90deg, var(--mkt-primary) 0%, var(--mkt-primary-hover) 100%)"
                        : "linear-gradient(90deg, var(--warning) 0%, var(--warning) 100%)",
                    }}
                  />
                )}

                {/* Diagonal highlight overlay */}
                <div 
                  className="absolute top-0 right-0 w-1/2 h-1/2 opacity-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent)",
                    borderRadius: "0 12px 0 0"
                  }}
                />
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Tier Name */}
                  <h3 
                    className="mb-3"
                    style={{
                      fontFamily: "var(--font-family)",
                      fontSize: "var(--font-size-2xl)",
                      lineHeight: "var(--line-height-tight)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--mkt-heading)",
                      letterSpacing: "var(--letter-spacing-tight)",
                    }}
                  >
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4 flex items-baseline gap-2">
                    <span 
                      style={{
                        fontFamily: "var(--font-family)",
                        fontSize: "clamp(36px, 5vw, 48px)",
                        lineHeight: "var(--line-height-tight)",
                        fontWeight: "var(--font-weight-bold)",
                        color: isHighlighted 
                          ? (tier.id === "starter" ? "var(--mkt-primary)" : "var(--warning)")
                          : "var(--mkt-heading)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {tier.price}
                    </span>
                    <span 
                      style={{
                        fontFamily: "var(--font-family)",
                        fontSize: "var(--font-size-base)",
                        color: "var(--mkt-text-dim)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {tier.period}
                    </span>
                  </div>
                  
                  {/* Description */}
                  <p 
                    className="mb-8"
                    style={{
                      fontFamily: "var(--font-family)",
                      fontSize: "var(--font-size-base)",
                      lineHeight: "var(--line-height-relaxed)",
                      color: "var(--mkt-text-dim)",
                      minHeight: "48px",
                    }}
                  >
                    {tier.description}
                  </p>
                  
                  {/* Features List */}
                  <ul className="mb-8 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: isHighlighted 
                              ? (tier.id === "starter" 
                                  ? "linear-gradient(135deg, var(--mkt-primary), var(--mkt-primary-hover))"
                                  : "linear-gradient(135deg, var(--warning), var(--warning))")
                              : "var(--mkt-surface-muted)",
                            border: isHighlighted ? "none" : "1px solid var(--mkt-outline)",
                            color: isHighlighted ? "white" : "var(--mkt-primary)",
                            fontSize: "12px",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          ✓
                        </div>
                        <span 
                          className="flex-1"
                          style={{
                            fontFamily: "var(--font-family)",
                            fontSize: "var(--font-size-base)",
                            lineHeight: "var(--line-height-relaxed)",
                            color: "var(--mkt-text)",
                            fontWeight: "var(--font-weight-normal)",
                          }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Value Stack for Starter - more compact */}
                  {isStarter && (
                    <div className="mb-6">
                      <ValueStack items={valueStackItems} />
                    </div>
                  )}
                  
                  {/* CTA Section */}
                  <div className="mt-8">
                    {tier.id === "free" ? (
                      <div>
                        <Button
                          variant="secondary"
                          onClick={() => onSubscribe(tier)}
                          size="lg"
                          className="w-full"
                          style={{
                            border: "2px solid var(--mkt-outline)",
                            fontWeight: "var(--font-weight-semibold)",
                          }}
                        >
                          Start for Free
                        </Button>
                        <p 
                          className="mt-3 text-center"
                          style={{
                            fontFamily: "var(--font-family)",
                            fontSize: "var(--font-size-xs)",
                            color: "var(--mkt-text-dim)",
                            fontWeight: "var(--font-weight-medium)",
                          }}
                        >
                          No card. No friction.
                        </p>
                      </div>
                    ) : isCurrentPlan ? (
                      <div 
                        className="text-center py-4 rounded-xl"
                        style={{
                          background: "linear-gradient(135deg, var(--mkt-card-blue), rgba(239, 246, 255, 0.5))",
                          border: "1px solid var(--mkt-primary)",
                        }}
                      >
                        <p 
                          style={{
                            fontFamily: "var(--font-family)",
                            fontSize: "var(--font-size-base)",
                            fontWeight: "var(--font-weight-semibold)",
                            color: "var(--mkt-primary)",
                          }}
                        >
                          Current Plan
                        </p>
                        <p 
                          className="mt-1"
                          style={{
                            fontFamily: "var(--font-family)",
                            fontSize: "var(--font-size-sm)",
                            color: "var(--mkt-text-dim)",
                          }}
                        >
                          Active
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant={isHighlighted ? "primary" : "secondary"}
                          onClick={() => onSubscribe(tier)}
                          size="lg"
                          className="w-full"
                          style={{
                            fontWeight: "var(--font-weight-semibold)",
                            ...(isHighlighted ? {
                              background: tier.id === "starter"
                                ? "linear-gradient(135deg, var(--mkt-primary), var(--mkt-primary-hover))"
                                : "linear-gradient(135deg, var(--warning), var(--warning))",
                              boxShadow: tier.id === "starter"
                                ? "0 4px 14px rgba(37, 99, 235, 0.3)"
                                : "0 4px 14px rgba(217, 119, 6, 0.3)",
                            } : {})
                          }}
                        >
                          {tier.id === "starter" ? "Unlock Founder-Fit Insights" : tier.id === "pro" ? "Get Maximum Clarity" : (isAuthenticated ? "Subscribe Now" : "Find My Startup Idea")}
                        </Button>
                        {tier.id === "starter" && (
                          <p 
                            className="mt-3 text-center"
                            style={{
                              fontFamily: "var(--font-family)",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--mkt-text-dim)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            Your smartest decision today.
                          </p>
                        )}
                        {tier.id === "pro" && (
                          <p 
                            className="mt-3 text-center"
                            style={{
                              fontFamily: "var(--font-family)",
                              fontSize: "var(--font-size-xs)",
                              color: "var(--mkt-text-dim)",
                              fontWeight: "var(--font-weight-medium)",
                            }}
                          >
                            For serious builders.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}

