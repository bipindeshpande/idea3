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
  title: "Startup Idea Advisor — Discover Ideas",
  description: "Let AI discover personalized startup opportunities tailored to your profile, goals, and constraints. Get ranked recommendations with detailed fit analysis.",
  keywords: "discover startup ideas, ai idea generator, personalized startup recommendations, business idea discovery, startup idea discovery",
  canonical: "/product/discover",
  ogTitle: "Startup Idea Advisor — Discover Ideas",
  ogDescription: "Let AI discover personalized startup opportunities tailored to your profile, goals, and constraints. Get ranked recommendations with detailed fit analysis.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Startup Idea Discovery",
    applicationCategory: "BusinessApplication",
    description: "AI-powered startup idea discovery tool that generates personalized business opportunities",
    url: "https://ideabunch.com/product/discover",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};

const exampleIdeas = [
  {
    title: "AI-Powered Fitness Coach",
    description: "Personalized workout plans based on fitness goals and schedule",
    icon: "🏋️",
    tint: "blue",
  },
  {
    title: "Sustainable Home Goods Marketplace",
    description: "Curated marketplace for eco-friendly home products",
    icon: "🌱",
    tint: "green",
  },
  {
    title: "Remote Team Collaboration Platform",
    description: "Tools for distributed teams to collaborate effectively",
    icon: "👥",
    tint: "purple",
  },
];

const features = [
  {
    icon: "🎯",
    title: "Personalized Profile Matching",
    description: "Our AI analyzes your goals, time, budget, skills, and work style to find ideas that truly fit you.",
    tint: "blue",
  },
  {
    icon: "📊",
    title: "Ranked Recommendations",
    description: "Get top 3 ideas with detailed scoring across goal fit, time fit, budget fit, and skill fit.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Analysis",
    description: "Understand startup costs, revenue potential, and breakeven timelines for each idea.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Assessment",
    description: "See potential risks and mitigation strategies before you commit to building.",
    tint: "green",
  },
];

export default function ProductDiscoverPage() {
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
        title="Discover high-quality startup ideas"
        subheadline="Let our AI discover personalized startup opportunities tailored to your unique profile, goals, and constraints."
        primaryCTA={{ to: "/advisor", label: "Start Discovery" }}
        secondaryCTA={{ to: "/product", label: "View All Features" }}
        illustration={{
          gradient: "linear-gradient(135deg, var(--mkt-card-purple), var(--mkt-card-orange))"
        }}
      />

      {/* Screenshot Mockup Block */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Discovery Dashboard Preview"
            subtitle="See how our AI generates personalized recommendations"
            center
          />
          <div className="max-w-5xl mx-auto mt-12">
            <MockupBrowser url="https://app.startupideaadvisor.com/advisor">
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

      {/* Example Idea Cards */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Example Ideas Generated"
            subtitle="See the quality of ideas our AI discovers"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {exampleIdeas.map((idea, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...idea} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AI Generates Ideas */}
      <section className="mkt-pad-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How AI Generates Ideas"
            subtitle="Our intelligent system matches opportunities to your unique profile"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Blocks */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6 space-y-20">
          <ContentBlock
            title="Market Research"
            description="Our AI analyzes market trends, competitor landscapes, and growth opportunities to identify viable ideas that match your profile."
            visual={{
              gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
            }}
          />
          <ContentBlock
            title="Financial Modeling"
            description="Each idea includes detailed financial projections, startup costs, revenue models, and breakeven analysis tailored to your budget."
            visual={{
              gradient: "linear-gradient(135deg, var(--mkt-card-orange), var(--mkt-card-yellow))",
            }}
            reverse
          />
        </div>
      </section>

      {/* How It Works - 3-Step Section */}
      <section className="mkt-pad-section mkt-section-gradient-blue">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How Discovery Works"
            subtitle="Get personalized startup ideas in three steps"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                step: "1",
                title: "Complete Your Profile",
                description: "Share your goals, time commitment, budget, skills, and work style. Our intake form captures everything we need.",
                icon: "📝",
              },
              {
                step: "2",
                title: "AI Generates Ideas",
                description: "Our AI researches markets, analyzes opportunities, and generates personalized startup ideas tailored to your profile.",
                icon: "🤖",
              },
              {
                step: "3",
                title: "Review Recommendations",
                description: "Receive top 3 ranked ideas with detailed fit analysis, financial projections, risk assessment, and roadmaps.",
                icon: "📊",
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
            title="Discovery Deliverables"
            subtitle="Everything you'll receive from your discovery session"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              "Personalized Profile Analysis",
              "Top 3 Ranked Startup Ideas",
              "Goal Fit Scoring",
              "Time Commitment Analysis",
              "Budget Fit Assessment",
              "Skill Match Evaluation",
              "Financial Outlook & Projections",
              "Risk Assessment & Mitigation",
              "30/60/90 Day Roadmap",
              "Validation Questions & Scripts",
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
        title="Ready to discover your next startup idea?"
        description="Get personalized recommendations in minutes. No credit card required."
        primaryCTA={{ to: "/advisor", label: "Start Discovery Session" }}
        secondaryCTA={{ to: "/pricing", label: "View Pricing" }}
        gradient
        className="my-20"
      />
    </MarketingLayout>
  );
}
