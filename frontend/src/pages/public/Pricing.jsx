import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";
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
 <header className="mb-8 text-center relative">
 <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-surface opacity-[0.09] blur-2xl pointer-events-none"></div>
 <div className="relative z-10">
 <PageHeader
 title="Start free, upgrade when you need more"
 description="Get 2 free validations and 4 free discoveries. No credit card required. Upgrade to unlock more when you're ready."
 />
 <div className="flex items-center justify-center gap-2">
 <span className="text-lg">🤝</span>
 <span className="text-sm text-secondary">
 All plans include Founder Connect - find co-founders and collaborators
 </span>
 </div>
 </div>
 </header>

 {/* Pricing Tiers */}
 <div className="mb-10 grid gap-4 md:grid-cols-3">
 {tiers.filter(t => !t.annual).map((tier) => {
 const isCurrentPlan =
 isAuthenticated &&
 subscription &&
 subscription.type === tier.id &&
 subscription.is_active;

 return (
 <Card
 key={tier.id}
   className={`group relative overflow-hidden ui-card rounded-[16px] p-6 transition ${
    tier.highlight ? "border-accent shadow-card-lg" : "shadow-card"
   }`}
 >
 <div className="mb-3">
 <p className="text-lg font-semibold text-primary flex items-center gap-2">{tier.name}</p>
 <div className="mt-2 flex items-baseline gap-2">
 <p className="text-4xl font-bold tracking-tight text-primary">{tier.price}</p>
 <p className="text-sm text-secondary">{tier.period}</p>
 </div>
 </div>
  <p className="mb-4 text-sm text-secondary">{tier.description}</p>
 <ul className="mb-4 space-y-2">
 {tier.features.map((feature) => (
 <li key={feature} className="flex items-start gap-3">
     <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-accent">✓</span>
     <span className="text-sm text-secondary">{feature}</span>
 </li>
 ))}
 </ul>
 {tier.id === "free" ? (
 <Card className="text-center">
 <p className="text-sm font-semibold text-primary">Default Plan</p>
 <p className="mt-1 text-sm text-secondary">No payment required</p>
 </Card>
 ) : isCurrentPlan ? (
 <Card className="text-center">
 <p className="text-sm font-semibold text-primary">Current Plan</p>
 <p className="mt-1 text-sm text-secondary">
 Active
 </p>
 </Card>
 ) : (
  <button
   type="button"
   onClick={() => handleSubscribe(tier)}
   className={`w-full whitespace-nowrap focus-visible:outline-accent ${tier.highlight ? "ui-btn ui-btn-primary" : "ui-btn ui-btn-secondary"}`}
  >
   {isAuthenticated ? "Subscribe Now" : "Get Started"}
  </button>
 )}
 {tier.highlight && (
 <div className="mt-3 text-center">
    <span className="inline-block rounded-full bg-surface-muted px-4 py-1.5 text-xs font-semibold text-accent">
 Most Popular
 </span>
 </div>
 )}
 </Card>
 );
 })}
 </div>

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

 {/* FAQ Section */}
 <div className="ui-card rounded-[16px] p-6 shadow-card">
 <SectionHeader title="Frequently Asked Questions" className="mb-3" />
 <div className="space-y-3">
 <div>
  <h3 className="mb-2 font-semibold text-primary">What's included in the free trial?</h3>
  <p className="text-sm text-secondary">
 The 3-day free trial includes full access to all features: unlimited idea discovery runs, idea validations, full reports, and PDF downloads.
 </p>
 </div>
 <div>
  <h3 className="mb-2 font-semibold text-primary">Can I cancel anytime?</h3>
  <p className="text-sm text-secondary">
 Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
 </p>
 </div>
 <div>
  <h3 className="mb-2 font-semibold text-primary">What payment methods do you accept?</h3>
  <p className="text-sm text-secondary">
 We accept all major credit and debit cards through our payment provider. Your payment information is securely processed and never stored on our servers.
 </p>
 </div>
 <div>
  <h3 className="mb-2 font-semibold text-primary">What happens after my free validations are used?</h3>
  <p className="text-sm text-secondary">
 After using your 2 free validations and 4 free discoveries, you'll need to subscribe to continue. Choose between Starter ($9/month), Pro ($15/month), or Annual ($120/year - save $60).
 </p>
 </div>
 </div>
 </div>
 </PageContainer>
 </MarketingLayout>
 );
}
