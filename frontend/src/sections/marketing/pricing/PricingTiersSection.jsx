import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.jsx";
import Card from "../../../components/ui/Card.jsx";
import UIButton from "../../../components/ui/ui-button.jsx";
import UIHeading from "../../../components/ui/ui-heading.jsx";
import PriceBadge from "../../../components/marketing/pricing/PriceBadge.jsx";
import ValueStack from "../../../components/marketing/pricing/ValueStack.jsx";
import Blob from "../../../components/marketing/Blob.jsx";

export default function PricingTiersSection({ tiers, valueStackItems, onSubscribe }) {
  const { isAuthenticated, subscription } = useAuth();

  return (
    <section className="mkt-section relative">
      <Blob size="medium" position="top-right" />
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.filter(t => !t.annual).map((tier, index) => {
          const isCurrentPlan = isAuthenticated && subscription && subscription.type === tier.id && subscription.is_active;
          const colorMap = {
            brand: "marketing-card-blue",
            coral: "marketing-card-orange",
          };
          const colorClass = colorMap[tier.color] || "marketing-card-blue";
          const isStarter = tier.id === "starter";
          const isPro = tier.id === "pro";

          return (
            <Card
              key={tier.id}
              className={`marketing-feature-card ${tier.highlight ? "marketing-card-orange border-accent" : colorClass} ${isStarter ? "mkt-pricing-highlight" : ""} relative overflow-hidden marketing-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {isStarter && <PriceBadge variant="best" />}
              {isPro && <PriceBadge variant="pro" />}
              
              {tier.highlight && !isStarter && !isPro && (
                <div className="absolute top-0 right-0 bg-accent text-on-accent px-3 py-1 rounded-bl-lg mkt-eyebrow font-semibold">
                  Most Popular
                </div>
              )}
              
              <div className="mb-4">
                <UIHeading level="h3" className="marketing-card-title text-primary mb-2">
                  {tier.name}
                </UIHeading>
                <div className="mt-3 flex items-baseline gap-2">
                  <UIHeading level="h1" className="text-5xl font-bold tracking-tight text-primary font-mono" style={{ fontSize: "3rem", lineHeight: "1" }}>
                    {tier.price}
                  </UIHeading>
                  <p className="mkt-body text-secondary">{tier.period}</p>
                </div>
              </div>
              
              <p className="mb-6 mkt-body text-secondary">{tier.description}</p>
              
              <ul className="mb-6 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent mkt-eyebrow font-semibold">✓</span>
                    <span className="mkt-body text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              
              {isStarter && <ValueStack items={valueStackItems} />}
              
              {tier.id === "free" ? (
                <div>
                  <UIButton
                    variant="secondary"
                    onClick={() => onSubscribe(tier)}
                    className="w-full marketing-btn-primary"
                  >
                    Start for Free
                  </UIButton>
                  <p className="mkt-eyebrow mt-2 text-center mkt-pricing-anchor">No card. No friction.</p>
                </div>
              ) : isCurrentPlan ? (
                <div className="text-center py-3 rounded-lg bg-accent text-on-accent">
                  <p className="mkt-body font-semibold">Current Plan</p>
                  <p className="mt-1 mkt-body opacity-90" style={{ fontSize: "0.875rem" }}>Active</p>
                </div>
              ) : (
                <div>
                  <UIButton
                    variant={tier.highlight ? "primary" : "secondary"}
                    onClick={() => onSubscribe(tier)}
                    className="w-full marketing-btn-primary"
                  >
                    {tier.id === "starter" ? "Unlock Founder-Fit Insights" : tier.id === "pro" ? "Get Maximum Clarity" : (isAuthenticated ? "Subscribe Now" : "Find My Startup Idea")}
                  </UIButton>
                  {tier.id === "starter" && (
                    <p className="mkt-eyebrow mt-2 text-center mkt-pricing-anchor">Your smartest decision today.</p>
                  )}
                  {tier.id === "pro" && (
                    <p className="mkt-eyebrow mt-2 text-center mkt-pricing-anchor">For serious builders.</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

