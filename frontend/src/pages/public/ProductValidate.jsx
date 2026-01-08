import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import { HeroSection } from "../../sections/marketing/validate";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";
import {
  seo,
  heroData,
  whyUsFeatures,
  validationFeatures,
  howItWorksSteps,
  deliverables,
  ctaData
} from "../../data/marketing/validate.js";

export default function ProductValidatePage() {
  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.productValidate);

  return (
    <MarketingLayout>
      <Seo 
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.canonical}
        ogTitle={seo.ogTitle}
        ogDescription={seo.ogDescription}
        structuredData={seo.structuredData}
        breadcrumbs={breadcrumbs}
      />

      <HeroSection data={heroData} />

      <section className="mkt-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Why founders choose Startup Advisor" subtitle="What makes us different" center animate="slide" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {whyUsFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle title="Comprehensive Validation Report" subtitle="See what you'll receive after validation" center />
          <div 
            className="rounded-3xl p-12 mkt-card--floating"
            style={{
              background: "var(--mkt-surface)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            <div 
              className="w-full h-96 rounded-2xl mb-8"
              style={{
                background: "linear-gradient(135deg, var(--mkt-card-primary), var(--mkt-card-secondary))"
              }}
            />
            <div className="space-y-4">
              <h3 className="mkt-h3 font-bold" style={{ color: "var(--mkt-heading)" }}>Validation Score: 8.5/10</h3>
              <p className="mkt-body" style={{ color: "var(--mkt-paragraph)" }}>
                Your idea shows strong potential across all validation parameters. Key strengths include market opportunity and problem-solution fit.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-purple">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="What We Validate" subtitle="10 critical parameters for comprehensive analysis" center />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {validationFeatures.map((feature, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section mkt-section-gradient-green">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="How Validation Works" subtitle="Get comprehensive validation in three steps" center />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.2}s` }}>
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-xl font-bold"
                  style={{
                    background: index === 0 
                      ? "var(--mkt-primary)" 
                      : index === 1
                      ? "var(--mkt-card-secondary)"
                      : "var(--mkt-card-accent)", /* Accent green for variety */
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)",
                    border: "2px solid transparent",
                  }}
                >
                  {step.step}
                </div>
                <h3 className="mkt-h3 mb-3" style={{ color: "var(--mkt-heading)" }}>{step.title}</h3>
                <p className="mkt-body" style={{ color: "var(--mkt-paragraph)" }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle title="Validation Deliverables" subtitle="Comprehensive analysis included in your validation report" center />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {deliverables.map((deliverable, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 rounded-lg"
                style={{
                  background: "var(--mkt-surface-muted)",
                  border: "1px solid var(--mkt-outline)",
                }}
              >
                <span className="text-xl mt-0.5" style={{ color: "var(--mkt-primary)" }}>✓</span>
                <span className="text-base font-medium" style={{ color: "var(--mkt-heading)" }}>{deliverable}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection {...ctaData} gradient className="my-12" />
    </MarketingLayout>
  );
}
