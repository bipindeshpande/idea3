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
  title: "Product Overview | Startup Idea Advisor",
  description: "Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps.",
  keywords: "startup ideas, idea validation, product features, ai startup advisor, business idea generator, startup validation",
  canonical: "/product",
  ogTitle: "Product Overview | Startup Idea Advisor",
  ogDescription: "Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Startup Idea Advisor",
    description: "AI-powered platform for validating startup ideas and discovering personalized business opportunities",
    url: "https://ideabunch.com/product",
    brand: {
      "@type": "Brand",
      name: "Startup Idea Advisor"
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock"
    }
  }
};

const valuePanels = [
  {
    icon: "🎯",
    title: "Personalized Profile Analysis",
    summary: "Deep insights into your motivations, constraints, strengths, and opportunity angles tailored to your unique profile.",
    tint: "blue",
  },
  {
    icon: "💡",
    title: "Ranked Startup Ideas",
    summary: "Top 3 ideas scored against your goals, time commitment, budget, and skills with detailed fit analysis.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Outlook",
    summary: "Realistic startup costs, revenue projections, and breakeven timelines that respect your budget constraints.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Radar",
    summary: "Identified risks with severity ratings and actionable mitigation strategies for each recommendation.",
    tint: "green",
  },
  {
    icon: "🔍",
    title: "Validation Questions",
    summary: "Customer discovery scripts with guidance on what to listen for and how to act on responses.",
    tint: "yellow",
  },
  {
    icon: "🗺️",
    title: "30/60/90 Day Roadmap",
    summary: "Customized execution plan with specific milestones and checkpoints for your chosen idea.",
    tint: "purple",
  },
];

const validationParams = [
  { name: "Market Opportunity", desc: "Market size, growth trends, addressable market (TAM, SAM, SOM)" },
  { name: "Problem-Solution Fit", desc: "Customer pain point validation, solution relevance, willingness to pay" },
  { name: "Competitive Landscape", desc: "Direct/indirect competitors, differentiation opportunities, barriers to entry" },
  { name: "Target Audience Clarity", desc: "Customer personas, market segmentation, acquisition channels, LTV" },
  { name: "Business Model Viability", desc: "Revenue streams, pricing strategy, unit economics, CAC" },
  { name: "Technical Feasibility", desc: "Build complexity, required resources, tech stack, time to market" },
  { name: "Financial Sustainability", desc: "Startup costs, operating expenses, revenue projections, breakeven" },
  { name: "Scalability Potential", desc: "Growth potential, expansion opportunities, operational scalability" },
  { name: "Risk Assessment", desc: "Key risks identified, severity ratings, mitigation strategies" },
  { name: "Go-to-Market Strategy", desc: "Launch plan, distribution channels, marketing & sales approach" },
];

export default function ProductPage() {
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
        title="Validate your idea or discover new opportunities"
        subheadline="Choose your path: validate an existing startup idea across 10 key parameters, or let our AI discover personalized opportunities tailored to your profile, goals, and constraints."
        primaryCTA={{ to: "/validate-idea", label: "Validate Idea" }}
        secondaryCTA={{ to: "/advisor", label: "Discover Ideas" }}
        illustration={{
          gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))"
        }}
        animate="fade"
      />

      {/* Screenshot Mockup Block */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="See It In Action"
            subtitle="Experience our platform with a live preview"
            center
            animate="slide"
          />
          <div className="max-w-5xl mx-auto mt-12 scroll-reveal">
            <MockupBrowser url="https://app.startupideaadvisor.com/dashboard">
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

      {/* Value Panels / Features */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="What You Get"
            subtitle="Comprehensive analysis and actionable insights tailored to your profile"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {valuePanels.map((panel, index) => (
              <div key={index} className="scroll-reveal">
                <FeatureCard
                  icon={panel.icon}
                  title={panel.title}
                  description={panel.summary}
                  tint={panel.tint}
                  animate="fade"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10-Parameter Validation Framework */}
      <section className="mkt-pad-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="10-Parameter Validation Framework"
            subtitle="The industry's most comprehensive idea validation system"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validationParams.map((param, index) => (
              <div
                key={index}
                className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "var(--mkt-surface)",
                  border: "1px solid var(--mkt-outline)",
                  boxShadow: "var(--mkt-card-shadow)"
                }}
              >
                <h3
                  className="text-lg font-semibold mb-3"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  {param.name}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--mkt-paragraph)" }}
                >
                  {param.desc}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/product/validate"
              className="inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "var(--mkt-primary)",
                color: "white",
                boxShadow: "var(--mkt-card-shadow)"
              }}
            >
              Learn More About Validation →
            </Link>
          </div>
        </div>
      </section>

      {/* Product Features - Deep Dive */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <ContentBlock
            title="Discover Ideas"
            description="Let our AI discover personalized startup opportunities tailored to your unique profile, goals, and constraints. Get ranked recommendations with detailed fit analysis, financial projections, and actionable roadmaps."
            visual={{
              gradient: "linear-gradient(135deg, var(--mkt-card-purple), var(--mkt-card-orange))",
            }}
          />
          <ContentBlock
            title="Validate Ideas"
            description="Get comprehensive validation across 10 critical parameters. Know if your startup idea is worth pursuing before you build. Includes market analysis, financial viability, risk assessment, and more."
            visual={{
              gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
            }}
            reverse
          />
          <ContentBlock
            title="Founder Network"
            description="Connect with other founders to find co-founders, collaborators, and build your startup team. Privacy-first networking designed for entrepreneurs with anonymized profiles until mutual acceptance."
            visual={{
              gradient: "linear-gradient(135deg, var(--mkt-card-green), var(--mkt-card-blue))",
            }}
          />
        </div>
      </section>

      {/* Founder Connect Highlight */}
      <section className="mkt-pad-section mkt-section-gradient-purple">
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="rounded-3xl p-12 mkt-card--floating"
            style={{
              background: "var(--mkt-surface)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="text-6xl">🤝</div>
              <div className="flex-1">
                <h2
                  className="mkt-h2 font-bold mb-4"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  Founder Connect - Find Your Co-Founder
                </h2>
                <p
                  className="mkt-body mb-6 leading-relaxed"
                  style={{ color: "var(--mkt-paragraph)" }}
                >
                  After validating your idea or discovering new opportunities, connect with other founders to find co-founders, collaborators, and build your startup team. Browse anonymized profiles and listings, send connection requests, and reveal identities when both sides accept.
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    "Create your founder profile and list validated ideas for collaboration",
                    "Browse anonymized founder profiles and idea listings",
                    "Privacy-first: identities only revealed after mutual acceptance",
                    "Credit-based limits: Free (3/month), Starter (15/month), Pro (unlimited)",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className="text-xl mt-0.5"
                        style={{ color: "var(--mkt-primary)" }}
                      >
                        ✓
                      </span>
                      <span
                        className="text-base"
                        style={{ color: "var(--mkt-paragraph)" }}
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/product/network"
                  className="inline-block px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--mkt-primary)",
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)"
                  }}
                >
                  Explore Founder Connect →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links to Product Pages */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Explore Our Products"
            subtitle="Learn more about each feature"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Discover Ideas",
                description: "AI-powered idea discovery tailored to your profile",
                link: "/product/discover",
                tint: "purple",
                icon: "💡",
              },
              {
                title: "Validate Ideas",
                description: "10-parameter validation framework for comprehensive analysis",
                link: "/product/validate",
                tint: "blue",
                icon: "🔍",
              },
              {
                title: "Founder Network",
                description: "Privacy-first networking to find co-founders",
                link: "/product/network",
                tint: "green",
                icon: "🤝",
              },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="block animate-mkt-fadeUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  tint={item.tint}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3-Step Section */}
      <section className="mkt-pad-section mkt-section-gradient-purple">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How It Works"
            subtitle="Get started in three simple steps"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Choose Your Path",
                description: "Validate an existing idea or discover new opportunities. Tell us about your goals, constraints, and experience.",
                icon: "🎯",
              },
              {
                step: "2",
                title: "AI Analysis",
                description: "Our AI system researches markets, analyzes financials, assesses risks, and generates personalized recommendations.",
                icon: "🤖",
              },
              {
                step: "3",
                title: "Get Your Reports",
                description: "Receive comprehensive analysis, ranked recommendations, financial projections, and actionable next steps.",
                icon: "📊",
              },
            ].map((step, index) => (
              <div 
                key={index}
                className="text-center scroll-reveal"
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
            title="What You'll Receive"
            subtitle="Comprehensive deliverables included with every session"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              "Personalized Profile Analysis",
              "Top 3 Ranked Startup Ideas",
              "Financial Outlook & Projections",
              "Risk Assessment & Mitigation",
              "Validation Questions & Scripts",
              "30/60/90 Day Roadmap",
              "Market Opportunity Analysis",
              "Competitive Landscape Review",
              "Go-to-Market Strategy",
              "Technical Feasibility Assessment",
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

      {/* CTA Section */}
      <CTASection
        title="Ready to get started?"
        description="Validate your existing idea or discover new opportunities tailored to your profile. No credit card required."
        primaryCTA={{ to: "/validate-idea", label: "Validate Idea" }}
        secondaryCTA={{ to: "/advisor", label: "Discover Ideas" }}
        gradient
        className="my-20"
      />
    </MarketingLayout>
  );
}
