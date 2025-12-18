import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import Hero from "../../components/marketing/Hero.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import ContentBlock from "../../components/marketing/ContentBlock.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import MockupBrowser from "../../components/marketing/mockups/MockupBrowser.jsx";

// SEO metadata
export const seo = {
  title: "Startup Idea Advisor — Validate Ideas",
  description: "Validate your startup idea across 10 critical parameters. Get comprehensive analysis including market opportunity, financial viability, risk assessment, and more.",
  keywords: "idea validation, startup validation, validate business idea, startup idea analysis, idea feasibility, business idea validation",
  canonical: "/product/validate",
  ogTitle: "Startup Idea Advisor — Validate Ideas",
  ogDescription: "Validate your startup idea across 10 critical parameters. Get comprehensive analysis including market opportunity, financial viability, risk assessment, and more.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Startup Idea Validation",
    applicationCategory: "BusinessApplication",
    description: "Comprehensive startup idea validation tool analyzing 10 critical parameters",
    url: "https://ideabunch.com/product/validate",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};

const validationFeatures = [
  {
    icon: "📈",
    title: "Market Opportunity",
    description: "Analyze market size, growth trends, and addressable market to assess opportunity.",
    tint: "blue",
  },
  {
    icon: "⚔️",
    title: "Competitive Landscape",
    description: "Understand competitors, differentiation opportunities, and barriers to entry.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Viability",
    description: "Assess startup costs, revenue projections, and financial sustainability.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    description: "Identify key risks with severity ratings and mitigation strategies.",
    tint: "green",
  },
];

export default function ProductValidatePage() {
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
      />

      {/* Hero Section */}
      <Hero
        title="Validate your idea with market-grade analysis"
        subheadline="Get comprehensive validation across 10 critical parameters. Know if your startup idea is worth pursuing before you build."
        primaryCTA={{ to: "/validate-idea", label: "Validate Your Idea" }}
        secondaryCTA={{ to: "/product", label: "View All Features" }}
        illustration={{
          gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))"
        }}
      />

      {/* Screenshot Mockup Block */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Validation Report Preview"
            subtitle="See what your comprehensive validation report looks like"
            center
          />
          <div className="max-w-5xl mx-auto mt-12">
            <MockupBrowser url="https://app.startupideaadvisor.com/validate-result">
              <div 
                className="w-full h-80 rounded-lg"
                style={{ 
                  background: "linear-gradient(135deg, #e5e7eb, #d1d5db)",
                  border: "1px solid var(--mkt-outline)"
                }}
              />
            </MockupBrowser>
          </div>
        </div>
      </section>

      {/* Validation Report UI Mockup */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <SectionTitle
            title="Comprehensive Validation Report"
            subtitle="See what you'll receive after validation"
            center
          />
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
                background: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))"
              }}
            />
            <div className="space-y-4">
              <h3 
                className="mkt-h3 font-bold"
                style={{ color: "var(--mkt-heading)" }}
              >
                Validation Score: 8.5/10
              </h3>
              <p 
                className="mkt-body"
                style={{ color: "var(--mkt-paragraph)" }}
              >
                Your idea shows strong potential across all validation parameters. Key strengths include market opportunity and problem-solution fit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Validation Features */}
      <section className="mkt-pad-section mkt-section-gradient-purple">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="What We Validate"
            subtitle="10 critical parameters for comprehensive analysis"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {validationFeatures.map((feature, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scorecards */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Detailed Scorecards"
            subtitle="Get insights across every dimension"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ContentBlock
              title="Market Analysis"
              description="We assess market size, growth potential, competitive landscape, and your positioning to give you a clear picture of opportunity."
              visual={{
                gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
              }}
            />
            <ContentBlock
              title="Financial Projections"
              description="Detailed financial modeling including startup costs, revenue forecasts, unit economics, and breakeven analysis."
              visual={{
                gradient: "linear-gradient(135deg, var(--mkt-card-orange), var(--mkt-card-yellow))",
              }}
              reverse
            />
          </div>
        </div>
      </section>

      {/* How It Works - 3-Step Section */}
      <section className="mkt-pad-section mkt-section-gradient-green">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How Validation Works"
            subtitle="Get comprehensive validation in three steps"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Submit Your Idea",
                description: "Describe your startup idea, target market, and business model. Our system captures all the details needed for analysis.",
                icon: "💡",
              },
              {
                step: "2",
                title: "AI Validates Across 10 Parameters",
                description: "Our AI analyzes market opportunity, competitive landscape, financial viability, risks, and more across 10 critical dimensions.",
                icon: "🔍",
              },
              {
                step: "3",
                title: "Receive Validation Report",
                description: "Get a comprehensive report with scores, insights, risk assessment, and actionable recommendations for each parameter.",
                icon: "📋",
              },
            ].map((step, index) => (
              <div 
                key={index}
                className="text-center animate-mkt-fadeUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div 
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-2xl font-bold"
                  style={{
                    background: "var(--mkt-surface)",
                    color: "var(--mkt-primary)",
                    boxShadow: "var(--mkt-card-shadow)",
                    border: "2px solid var(--mkt-primary)",
                  }}
                >
                  {step.step}
                </div>
                <h3 
                  className="mkt-h3 mb-4"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  {step.title}
                </h3>
                <p 
                  className="mkt-body"
                  style={{ color: "var(--mkt-paragraph)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real Deliverables List */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Validation Deliverables"
            subtitle="Comprehensive analysis included in your validation report"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              "Overall Validation Score",
              "Market Opportunity Analysis",
              "Problem-Solution Fit Assessment",
              "Competitive Landscape Review",
              "Target Audience Clarity",
              "Business Model Viability",
              "Technical Feasibility Analysis",
              "Financial Sustainability Projections",
              "Scalability Potential Assessment",
              "Risk Assessment & Mitigation",
              "Go-to-Market Strategy",
              "Actionable Recommendations",
            ].map((deliverable, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl"
                style={{
                  background: "var(--mkt-surface-muted)",
                  border: "1px solid var(--mkt-outline)",
                }}
              >
                <span
                  className="text-xl mt-0.5"
                  style={{ color: "var(--mkt-primary)" }}
                >
                  ✓
                </span>
                <span
                  className="text-base font-medium"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  {deliverable}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to validate your startup idea?"
        description="Get comprehensive validation across 10 critical parameters. Start now—no credit card required."
        primaryCTA={{ to: "/validate-idea", label: "Validate Your Idea" }}
        secondaryCTA={{ to: "/pricing", label: "View Pricing" }}
        gradient
        className="my-20"
      />
    </MarketingLayout>
  );
}
