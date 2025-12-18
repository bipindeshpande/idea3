import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import Hero from "../../components/marketing/Hero.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import ContentBlock from "../../components/marketing/ContentBlock.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

// SEO metadata
export const seo = {
  title: "Startup Idea Advisor — Validate Ideas & Discover Opportunities",
  description: "Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps. Validate existing ideas or discover personalized opportunities.",
  keywords: ["startup ideas", "idea validation", "business ideas", "startup advisor", "ai startup", "idea discovery"],
  canonical: "/",
};

const features = [
  {
    icon: "🎯",
    title: "Personalized Profile Analysis",
    description: "Deep insights into your motivations, constraints, strengths, and opportunity angles tailored to your unique profile.",
    tint: "blue",
  },
  {
    icon: "💡",
    title: "Ranked Startup Ideas",
    description: "Top 3 ideas scored against your goals, time commitment, budget, and skills with detailed fit analysis.",
    tint: "purple",
  },
  {
    icon: "💰",
    title: "Financial Outlook",
    description: "Realistic startup costs, revenue projections, and breakeven timelines that respect your budget constraints.",
    tint: "orange",
  },
  {
    icon: "⚠️",
    title: "Risk Radar",
    description: "Identified risks with severity ratings and actionable mitigation strategies for each recommendation.",
    tint: "green",
  },
  {
    icon: "🔍",
    title: "Validation Questions",
    description: "Customer discovery scripts with guidance on what to listen for and how to act on responses.",
    tint: "yellow",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Tell us about you",
    description: "Share your goals, time commitment, budget, interests, work style, and experience. Our intake form captures what matters.",
  },
  {
    step: "2",
    title: "AI analyzes your profile",
    description: "Our AI system researches markets, analyzes financials, assesses risks, and validates ideas based on your profile.",
  },
  {
    step: "3",
    title: "Get your reports",
    description: "Receive a comprehensive profile analysis, ranked recommendations, and a full report with actionable next steps.",
  },
];

export default function HomePage() {
  return (
    <MarketingLayout fullWidth={true}>
      <Seo {...seo} />

      {/* Hero Section */}
      <Hero
        title="Validate your idea or discover new opportunities"
        subheadline="Choose your path: validate an existing startup idea across 10 key parameters, or let our AI discover personalized opportunities tailored to your profile, goals, and constraints."
        primaryCTA={{ to: "/validate-idea", label: "Validate Idea" }}
        secondaryCTA={{ to: "/advisor", label: "Discover Ideas" }}
        illustration={{
          gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))"
        }}
        className="mb-0"
        animate="fade"
      />

      {/* Features Strip */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Everything you need to succeed"
            subtitle="Comprehensive analysis and actionable insights tailored to your profile"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="scroll-reveal">
                <FeatureCard {...feature} animate="fade" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section 
        className="mkt-pad-section mkt-section-gradient-blue"
      >
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How It Works"
            subtitle="Three simple steps from profile to actionable recommendations"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div 
                key={index} 
                className="text-center animate-mkt-fadeUp"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: "var(--mkt-primary)",
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)"
                  }}
                >
                  {item.step}
                </div>
                <h3 
                  className="mkt-h3 font-semibold mb-4"
                  style={{ color: "var(--mkt-heading)" }}
                >
                  {item.title}
                </h3>
                <p 
                  className="mkt-body leading-relaxed"
                  style={{ color: "var(--mkt-paragraph)" }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Screenshots / Mockups */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="See it in action"
            subtitle="Beautiful, actionable reports that help you make informed decisions"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ContentBlock
              title="Validation Reports"
              description="Get comprehensive validation across 10 critical parameters. See detailed scores, risk assessments, and actionable insights in a beautifully formatted report."
              visual={{
                gradient: "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-green))",
                content: <div className="w-full h-full flex items-center justify-center"><div className="text-6xl opacity-50">📊</div></div>
              }}
              animate="slide"
            />
            <ContentBlock
              title="Idea Discovery"
              description="Discover personalized startup ideas tailored to your unique profile. Each idea includes financial projections, market analysis, and a 30/60/90 day roadmap."
              visual={{
                gradient: "linear-gradient(135deg, var(--mkt-card-purple), var(--mkt-card-orange))",
                content: <div className="w-full h-full flex items-center justify-center"><div className="text-6xl opacity-50">💡</div></div>
              }}
              reverse
              animate="slide"
            />
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section 
        className="mkt-pad-section mkt-section-gradient-purple"
      >
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="What You Get"
            subtitle="Everything you need to move from idea to action"
            center
            animate="slide"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Profile Summary",
                description: "Structured analysis of your motivations, constraints, strengths, and strategic considerations.",
                icon: "📊",
                tint: "blue",
              },
              {
                title: "Recommendation Matrix",
                description: "Compare ideas across goal fit, time fit, budget fit, skill fit, and work style alignment.",
                icon: "📈",
                tint: "green",
              },
              {
                title: "Complete PDF Report",
                description: "Download a comprehensive PDF combining profile analysis, recommendations, and full report sections.",
                icon: "📄",
                tint: "orange",
              },
            ].map((item, index) => (
              <div key={index} className="scroll-reveal">
                <FeatureCard {...item} animate="fade" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section 
        className="mkt-pad-section relative overflow-hidden"
        style={{ background: "var(--mkt-primary)" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 -left-32 w-96 h-96 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center scroll-reveal">
          <h2 
            className="mkt-h2 font-bold mb-6 text-white"
          >
            Ready to validate your idea?
          </h2>
          <p 
            className="mkt-body mb-10 text-white/90 leading-relaxed"
          >
            Get AI-powered recommendations tailored to your profile, goals, and constraints. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/validate-idea"
              className="px-8 py-4 bg-white text-primary rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              style={{
                color: "var(--mkt-primary)",
                boxShadow: "var(--mkt-layer-shadow)"
              }}
            >
              Validate Idea
            </Link>
            <Link
              to="/advisor"
              className="px-8 py-4 bg-white/10 text-white border-2 border-white/30 rounded-xl font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              Discover Ideas
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
