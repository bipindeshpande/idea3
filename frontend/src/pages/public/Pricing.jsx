import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

// Lazy load the entire payment modal to avoid loading Stripe until needed
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

  const colorClasses = {
    brand: {
      border: "border-gray-200",
      bg: "bg-white",
      button: "bg-indigo-600 hover:bg-indigo-700",
    },
    coral: {
      border: "border-gray-200",
      bg: "bg-white",
      button: "bg-indigo-600 hover:bg-indigo-700",
    },
  };

  return (
    <PageContainer>
      <Seo
        title="Pricing | Startup Idea Advisor"
        description="Start with 3 days free, then choose $5/week or $15/month for unlimited access to startup idea recommendations and validation."
        path="/pricing"
      />

      {/* Hero Section */}
      <header className="mb-8 text-center relative">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <PageHeader
            title="Start free, upgrade when you need more"
            description="Get 2 free validations and 4 free discoveries. No credit card required. Upgrade to unlock more when you're ready."
          />
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">🤝</span>
            <span className="text-sm text-gray-600">
              All plans include Founder Connect - find co-founders and collaborators
            </span>
          </div>
        </div>
      </header>

      {/* Pricing Tiers */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const colors = colorClasses[tier.color];
          const isCurrentPlan =
            isAuthenticated &&
            subscription &&
            subscription.type === tier.id &&
            subscription.is_active;

          return (
            <Card
              key={tier.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                tier.highlight ? "ring-2 ring-indigo-300 ring-offset-2" : ""
              }`}
            >
              <div className="mb-3">
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">{tier.name}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</p>
                  <p className="text-sm text-gray-600">{tier.period}</p>
                </div>
              </div>
              <p className="mb-4 text-[15px] text-gray-700 leading-relaxed">{tier.description}</p>
              <ul className="mb-4 space-y-2">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">✓</span>
                    <span className="text-[15px] text-gray-700 leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.id === "free" ? (
                <Card className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Default Plan</p>
                  <p className="mt-1 text-sm text-gray-600">No payment required</p>
                </Card>
              ) : isCurrentPlan ? (
                <Card className="text-center">
                  <p className="text-sm font-semibold text-gray-900">Current Plan</p>
                  <p className="mt-1 text-sm text-gray-600">
                    Active
                  </p>
                </Card>
              ) : (
                <Button
                  onClick={() => handleSubscribe(tier)}
                  className="w-full whitespace-nowrap"
                >
                  {isAuthenticated ? "Subscribe Now" : "Get Started"}
                </Button>
              )}
              {tier.highlight && (
                <div className="mt-3 text-center">
                  <span className="inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-md rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Subscribe to {selectedTier.name}</h2>
                  <button
                    onClick={() => setSelectedTier(null)}
                    className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center justify-center py-8">
                  <div className="text-[15px] text-gray-700 leading-relaxed">Loading payment form...</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
          <Card className="mx-4 w-full max-w-md text-center">
            <div className="mb-4 text-5xl">✓</div>
            <SectionHeader title="Payment Successful!" className="mb-2" />
            <p className="text-[15px] text-gray-700 leading-relaxed">Your subscription is now active. Redirecting...</p>
          </Card>
        </div>
      )}

      {/* FAQ Section */}
      <Card className="border-sand-200 dark:border-sand-800 bg-sand-50/80 dark:bg-sand-900/20">
        <SectionHeader title="Frequently Asked Questions" className="mb-3" />
        <div className="space-y-3">
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-slate-100">What's included in the free trial?</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300">
              The 3-day free trial includes full access to all features: unlimited idea discovery runs, idea validations, full reports, and PDF downloads.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-slate-100">Can I cancel anytime?</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-slate-100">What payment methods do you accept?</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300">
              We accept all major credit and debit cards through Stripe. Your payment information is securely processed and never stored on our servers.
            </p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-slate-100">What happens after my free validations are used?</h3>
            <p className="text-sm text-gray-700 dark:text-slate-300">
              After using your 2 free validations and 4 free discoveries, you'll need to subscribe to continue. Choose between Starter ($9/month), Pro ($15/month), or Annual ($120/year - save $60).
            </p>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
