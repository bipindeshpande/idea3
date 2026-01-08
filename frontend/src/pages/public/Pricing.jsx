import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { HeroSection, PricingTiersSection, FAQSection } from "../../sections/marketing/pricing";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";
import {
  heroData,
  tiers,
  starterValueStackItems,
  faqs,
  ctaData
} from "../../data/marketing/pricing.js";

const PaymentModal = lazy(() => import("./PaymentModal.jsx"));

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

  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.pricing);

  return (
    <MarketingLayout>
      <PageContainer>
        <Seo
          title="Pricing | Startup Idea Advisor"
          description="Start with 3 days free, then choose $5/week or $15/month for unlimited access to startup idea recommendations and validation. No credit card required for trial."
          path="/pricing"
          breadcrumbs={breadcrumbs}
        />

        <HeroSection title={heroData.title} subtitle={heroData.subtitle} primaryCTA={heroData.primaryCTA} secondaryCTA={heroData.secondaryCTA} className="mb-20" />

        <PricingTiersSection tiers={tiers} valueStackItems={starterValueStackItems} onSubscribe={handleSubscribe} />

        {selectedTier && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
                <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="mkt-h3 font-semibold text-primary flex items-center gap-2">Subscribe to {selectedTier.name}</h2>
                    <button
                      onClick={() => setSelectedTier(null)}
                      className="rounded-lg p-1 text-secondary transition hover:bg-surface-hover focus-visible:outline-accent"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center justify-center py-8">
                    <div className="mkt-body text-secondary">Loading payment form...</div>
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

        {paymentSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay-light backdrop-blur-sm">
            <div className="ui-card mx-4 w-full max-w-md rounded-[16px] p-6 shadow-card-lg text-center">
              <div className="mb-4 text-5xl">✓</div>
              <SectionHeader title="Payment Successful!" className="mb-2" />
              <p className="mkt-body text-secondary">Your subscription is now active. Redirecting...</p>
            </div>
          </div>
        )}

        <FAQSection faqs={faqs} />

        <CTASection {...ctaData} gradient className="my-12" />
      </PageContainer>
    </MarketingLayout>
  );
}
