import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { HeroSection, PricingTiersSection, CostSection, FAQSection } from "../../sections/marketing/pricing";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import LogoStrip from "../../components/marketing/credibility/LogoStrip.jsx";
import NeuroProof from "../../components/marketing/NeuroProof.jsx";
import UseCaseList from "../../components/marketing/credibility/UseCaseList.jsx";
import PriceToggle from "../../components/marketing/pricing/PriceToggle.jsx";
import PriceComparisonTable from "../../components/marketing/pricing/PriceComparisonTable.jsx";
import GuaranteeBlock from "../../components/marketing/pricing/GuaranteeBlock.jsx";
import {
  heroData,
  preheadline,
  pricingPrimingText,
  costItems,
  fearRemovalText,
  credibilityHeadline,
  neuroProofData,
  tiers,
  starterValueStackItems,
  upgradeReasons,
  purchaseUseCases,
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

  return (
    <MarketingLayout>
      <PageContainer>
        <Seo
          title="Pricing | Startup Idea Advisor"
          description="Start with 3 days free, then choose $5/week or $15/month for unlimited access to startup idea recommendations and validation."
          path="/pricing"
        />

        <HeroSection title={heroData.title} subtitle={heroData.subtitle} primaryCTA={heroData.primaryCTA} secondaryCTA={heroData.secondaryCTA} className="mb-20" />
        
        <section className="py-4" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="mkt-pricing-preheadline">{preheadline}</p>
          </div>
        </section>

        <PriceToggle />
        <div className="flex items-center justify-center gap-2 mb-12">
          <span className="text-2xl">🤝</span>
          <span className="mkt-body text-secondary">All plans include Founder Connect - find co-founders and collaborators</span>
        </div>

        <div className="marketing-divider my-16" />

        <section className="py-8" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="mkt-preheadline">{pricingPrimingText}</p>
          </div>
        </section>

        <CostSection items={costItems} fearRemovalText={fearRemovalText} />

        <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h3 className="mkt-h3 font-semibold" style={{ color: "var(--mkt-heading)" }}>{credibilityHeadline}</h3>
          </div>
        </section>

        <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
          <LogoStrip count={8} />
        </section>

        <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
          <NeuroProof {...neuroProofData} />
        </section>

        <PricingTiersSection tiers={tiers} valueStackItems={starterValueStackItems} onSubscribe={handleSubscribe} />

        <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <PriceComparisonTable />
          </div>
        </section>

        <section className="mkt-section-sm" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <GuaranteeBlock />
          </div>
        </section>

        <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
          <div className="max-w-4xl mx-auto px-6">
            <SectionHeader title="Why founders upgrade" center className="mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upgradeReasons.map((item, i) => (
                <div key={i} className="p-4 rounded-lg" style={{ background: "var(--mkt-surface-muted)", border: "1px solid var(--mkt-outline)" }}>
                  <h4 className="font-semibold mb-2 mkt-body" style={{ color: "var(--mkt-heading)" }}>{item.title}</h4>
                  <p className="mkt-body" style={{ color: "var(--mkt-paragraph)", fontSize: "0.875rem" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <UseCaseList items={purchaseUseCases} ctaText="See how upgrading helps →" ctaTo="/pricing" />

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

        <div className="marketing-divider my-16" />

        <FAQSection faqs={faqs} />

        <CTASection {...ctaData} gradient className="my-12" />
      </PageContainer>
    </MarketingLayout>
  );
}
