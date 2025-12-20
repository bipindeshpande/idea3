import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { HeroSection } from "../../sections/marketing/product";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

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
      <HeroSection
        data={{
          eyebrow: "Product Overview",
          title: "Everything you need to find and validate your startup idea.",
          subheadline: "AI-powered tools for idea discovery, validation, and founder networking. Get comprehensive analysis, ranked recommendations, and actionable insights tailored to your profile.",
          primaryCTA: { to: "/advisor", label: "Get Started" },
          secondaryCTA: { to: "/pricing", label: "See Pricing" },
        }}
      />

      {/* V7: Why Us Section */}
      <section className="mkt-pad-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Why founders choose Startup Advisor"
            subtitle="What makes us different"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <FeatureCard
              title="Clarity vs guesswork"
              description="Get objective scoring and data-driven insights instead of guessing which idea to pursue."
              tint="blue"
              eyebrow="Data-Driven"
              microBenefit="No more decision paralysis"
            />
            <FeatureCard
              title="Founder personalization"
              description="Every recommendation is tailored to YOUR skills, time, budget, and goals—not generic advice."
              tint="purple"
              eyebrow="Personalized"
              microBenefit="Ideas that actually fit your life"
            />
            <FeatureCard
              title="Structured, repeatable insights"
              description="Use the same frameworks that successful founders use—YC, Lean Startup, and Product Discovery principles."
              tint="orange"
              eyebrow="Proven Frameworks"
              microBenefit="Learn while you build"
            />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validationParams.map((param, index) => (
              <div
                key={index}
                className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
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
              className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              style={{
                background: "var(--mkt-primary)",
                color: "white",
                boxShadow: "var(--mkt-card-shadow)"
              }}
            >
              See How Validation Works →
            </Link>
          </div>
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
            <div className="flex flex-col md:flex-row items-start gap-6">
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
                  className="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
                  style={{
                    background: "var(--mkt-primary)",
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)"
                  }}
                >
                  Show Me Founder Connect →
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
            title="See Our Products"
            subtitle="Learn more about each feature"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Real Deliverables List */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="What You'll Receive"
            subtitle="Comprehensive deliverables included with every session"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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
                className="flex items-start gap-2 p-3 rounded-lg"
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
        className="my-12"
      />
    </MarketingLayout>
  );
}
