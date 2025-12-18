import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import HeroSection from "../../components/marketing/HeroSection.jsx";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import Blob from "../../components/marketing/Blob.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

// Lazy load the entire payment modal to avoid loading the payment provider until needed
const PaymentModal = lazy(() => {
 return import("./PaymentModal.jsx");
});

const tiers = [
 {
 id: "free",
 name: "Free",
 price: "$0",
 period: "forever",
 description: "Perfect for trying out the service. No credit card required.",
 features: [
 "2 idea validations (lifetime)",
 "4 idea discoveries (lifetime)",
 "3 founder connections/month",
 "Full reports",
 "PDF downloads",
 ],
 highlight: false,
 color: "brand",
 duration_days: 0,
 },
 {
 id: "starter",
 name: "Starter",
 price: "$9",
 period: "per month",
 description: "Best for regular users testing ideas.",
 features: [
 "20 validations/month",
 "10 discoveries/month",
 "15 founder connections/month",
 "Full reports",
 "PDF downloads",
 "Email support",
 ],
 highlight: false,
 color: "brand",
 duration_days: 30,
 },
 {
 id: "pro",
 name: "Pro",
 price: "$15",
 period: "per month",
 description: "For power users and serial entrepreneurs.",
 features: [
 "Unlimited validations",
 "Unlimited discoveries",
 "Unlimited founder connections",
 "Full reports",
 "PDF downloads",
 "Priority support",
 ],
 highlight: true,
 color: "coral",
 duration_days: 30,
 },
 {
 id: "annual",
 name: "Pro Annual",
 price: "$120",
 period: "per year",
 description: "Best value - save $60 (2 months free).",
 features: [
 "Unlimited validations",
 "Unlimited discoveries",
 "Unlimited founder connections",
 "Full reports",
 "PDF downloads",
 "Priority support",
 "Save $60/year",
 ],
 highlight: false,
 color: "brand",
 duration_days: 365,
 annual: true,
 },
];


export default function PricingPage() {
 const navigate = useNavigate();
 const { isAuthenticated, subscription, checkSubscription } = useAuth();
 const [selectedTier, setSelectedTier] = useState(null);
 const [paymentSuccess, setPaymentSuccess] = useState(false);

 useEffect(() => {
 if (paymentSuccess) {
 checkSubscription();
 setTimeout(() => {
 setPaymentSuccess(false);
 setSelectedTier(null);
 navigate("/dashboard");
 }, 2000);
 }
 }, [paymentSuccess, checkSubscription, navigate]);

 const handleSubscribe = (tier) => {
 if (!isAuthenticated) {
 navigate("/register", { state: { from: { pathname: "/pricing" } } });
 return;
 }
 setSelectedTier(tier);
 };

 const handlePaymentSuccess = () => {
 setPaymentSuccess(true);
 };

 // UI-only: keep tier data as-is, but visuals are driven by IDEA utilities (no Tailwind palette colors).

 return (
 <MarketingLayout>
 <PageContainer>
 <Seo
 title="Pricing | Startup Idea Advisor"
 description="Start with 3 days free, then choose $5/week or $15/month for unlimited access to startup idea recommendations and validation."
 path="/pricing"
 />

 {/* Hero Section */}
 <HeroSection
 title="Start free, upgrade when you need more"
 subtitle="Get 2 free validations and 4 free discoveries. No credit card required. Upgrade to unlock more when you're ready."
 primaryCTA={{ to: "/register", label: "Get Started Free" }}
 secondaryCTA={{ to: "/product", label: "Learn More" }}
 className="mb-20"
 />
 <div className="flex items-center justify-center gap-2 mb-12">
 <span className="text-2xl">🤝</span>
 <span className="text-base text-secondary">
 All plans include Founder Connect - find co-founders and collaborators
 </span>
 </div>

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 {/* Pricing Tiers */}
 <section className="relative py-12">
 <Blob size="medium" position="top-right" />
 <div className="grid gap-6 md:grid-cols-3 mb-12">
 {tiers.filter(t => !t.annual).map((tier, index) => {
 const isCurrentPlan =
 isAuthenticated &&
 subscription &&
 subscription.type === tier.id &&
 subscription.is_active;

 const colorMap = {
 brand: "marketing-card-blue",
 coral: "marketing-card-orange",
 };
 const colorClass = colorMap[tier.color] || "marketing-card-blue";

 return (
 <Card
 key={tier.id}
 className={`marketing-feature-card ${tier.highlight ? "marketing-card-orange border-accent" : colorClass} relative overflow-hidden marketing-fade-in`}
 style={{ animationDelay: `${index * 0.1}s` }}
 >
 {tier.highlight && (
 <div className="absolute top-0 right-0 bg-accent text-on-accent px-3 py-1 rounded-bl-lg text-xs font-semibold">
 Most Popular
 </div>
 )}
 <div className="mb-4">
 <UIHeading level="h3" className="marketing-card-title text-primary mb-2">
 {tier.name}
 </UIHeading>
 <div className="mt-3 flex items-baseline gap-2">
 <UIHeading level="h1" className="text-5xl font-bold tracking-tight text-primary font-mono">
 {tier.price}
 </UIHeading>
 <p className="text-base text-secondary">{tier.period}</p>
 </div>
 </div>
 <p className="mb-6 text-base text-secondary">{tier.description}</p>
 <ul className="mb-6 space-y-3">
 {tier.features.map((feature) => (
 <li key={feature} className="flex items-start gap-3">
 <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent text-xs font-semibold">✓</span>
 <span className="text-base text-secondary">{feature}</span>
 </li>
 ))}
 </ul>
 {tier.id === "free" ? (
 <div className="text-center py-3 rounded-lg bg-surface-muted">
 <p className="text-base font-semibold text-primary">Default Plan</p>
 <p className="mt-1 text-sm text-secondary">No payment required</p>
 </div>
 ) : isCurrentPlan ? (
 <div className="text-center py-3 rounded-lg bg-accent text-on-accent">
 <p className="text-base font-semibold">Current Plan</p>
 <p className="mt-1 text-sm opacity-90">Active</p>
 </div>
 ) : (
 <UIButton
 variant={tier.highlight ? "primary" : "secondary"}
 onClick={() => handleSubscribe(tier)}
 className="w-full marketing-btn-primary"
 >
 {isAuthenticated ? "Subscribe Now" : "Get Started"}
 </UIButton>
 )}
 </Card>
 );
 })}
 </div>
 </section>

 {/* Payment Modal - Lazy loaded */}
 {selectedTier && (
 <Suspense
 fallback={
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
  <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="text-lg font-semibold text-primary flex items-center gap-2">Subscribe to {selectedTier.name}</h2>
 <button
 onClick={() => setSelectedTier(null)}
     className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
 >
 ×
 </button>
 </div>
 <div className="flex items-center justify-center py-8">
    <div className="text-sm text-secondary">Loading payment form...</div>
 </div>
 </div>
 </div>
 }
 >
 <PaymentModal
 tier={selectedTier}
 onClose={() => setSelectedTier(null)}
 onSuccess={handlePaymentSuccess}
 />
 </Suspense>
 )}

 {/* Payment Success Message */}
 {paymentSuccess && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
 <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg text-center">
 <div className="mb-4 text-5xl">✓</div>
 <SectionHeader title="Payment Successful!" className="mb-2" />
 <p className="text-sm text-secondary">Your subscription is now active. Redirecting...</p>
 </div>
 </div>
 )}

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 {/* FAQ Section */}
 <section className="relative py-12">
 <Card className="marketing-card-blue">
 <SectionHeader title="Frequently Asked Questions" center className="mb-8" />
 <div className="space-y-6">
 <div>
  <UIHeading level="h3" className="marketing-card-title text-primary mb-2">What's included in the free plan?</UIHeading>
  <p className="text-base text-secondary">
 The free plan includes 2 idea validations and 4 idea discoveries (lifetime), plus 3 founder connections per month. Full reports and PDF downloads are included.
  </p>
 </div>
 <div>
  <UIHeading level="h3" className="marketing-card-title text-primary mb-2">Can I cancel anytime?</UIHeading>
  <p className="text-base text-secondary">
 Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
  </p>
 </div>
 <div>
  <UIHeading level="h3" className="marketing-card-title text-primary mb-2">What payment methods do you accept?</UIHeading>
  <p className="text-base text-secondary">
 We accept all major credit and debit cards through our payment provider. Your payment information is securely processed and never stored on our servers.
  </p>
 </div>
 <div>
  <UIHeading level="h3" className="marketing-card-title text-primary mb-2">What happens after my free validations are used?</UIHeading>
  <p className="text-base text-secondary">
 After using your 2 free validations and 4 free discoveries, you'll need to subscribe to continue. Choose between Starter ($9/month), Pro ($15/month), or Annual ($120/year - save $60).
  </p>
 </div>
 </div>
 </Card>
 </section>

 {/* CTA Section */}
 <CTASection
 title="Ready to get started?"
 description="Start with the free plan - no credit card required. Upgrade when you need more."
 primaryCTA={{ to: "/register", label: "Get Started Free" }}
 secondaryCTA={{ to: "/product", label: "Learn More" }}
 gradient
 className="my-20"
 />
 </PageContainer>
 </MarketingLayout>
 );
}
