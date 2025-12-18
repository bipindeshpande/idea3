import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import Hero from "../../components/marketing/Hero.jsx";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import UIInput from "../../components/ui/ui-input.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

// SEO metadata
export const seo = {
  title: "Startup Idea Advisor — Templates",
  description: "Download free templates for startup idea validation, customer discovery, business planning, and more. Professional templates designed for entrepreneurs.",
  keywords: ["startup templates", "business plan template", "validation template", "customer discovery template", "startup resources"],
  canonical: "/resources/templates",
};

const templates = [
  {
    icon: "📋",
    title: "Idea Validation Template",
    description: "Structured framework for validating your startup idea across 10 key parameters. Includes scoring sheets and action plans.",
    tint: "blue",
    category: "Validation",
  },
  {
    icon: "👥",
    title: "Customer Discovery Script",
    description: "Ready-to-use interview scripts for customer discovery. Includes questions, follow-ups, and analysis framework.",
    tint: "green",
    category: "Discovery",
  },
  {
    icon: "📊",
    title: "Business Model Canvas",
    description: "Interactive canvas for mapping your business model. Visual framework for planning revenue, costs, and value proposition.",
    tint: "orange",
    category: "Planning",
  },
  {
    icon: "💰",
    title: "Financial Projections Template",
    description: "Excel template for startup financial projections. Includes revenue models, expense tracking, and breakeven analysis.",
    tint: "purple",
    category: "Finance",
  },
  {
    icon: "🎯",
    title: "Go-to-Market Plan",
    description: "Step-by-step template for planning your launch. Includes market entry strategy, channels, and metrics.",
    tint: "yellow",
    category: "Marketing",
  },
  {
    icon: "🤝",
    title: "Co-Founder Agreement Template",
    description: "Legal template for co-founder agreements. Covers equity, roles, vesting, and conflict resolution.",
    tint: "blue",
    category: "Legal",
  },
];

export default function ResourceTemplatesPage() {
  return (
    <MarketingLayout>
      <Seo {...seo} />

      {/* Hero Section */}
      <Hero
        title="Startup Templates"
        subheadline="Download free templates for validation, customer discovery, business planning, and more. Professional templates designed for entrepreneurs."
        primaryCTA={{ to: "/register", label: "Get Access" }}
        secondaryCTA={{ to: "/resources", label: "View All Resources" }}
        illustration={{
          gradient: "linear-gradient(135deg, var(--mkt-card-orange), var(--mkt-card-yellow))"
        }}
      />

      {/* Search Input */}
      <section className="py-12" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-3xl mx-auto px-6">
          <UIInput
            type="search"
            placeholder="Search templates..."
            className="w-full"
            style={{
              background: "var(--mkt-surface)",
              borderColor: "var(--mkt-outline)",
              fontSize: "var(--mkt-body)"
            }}
          />
        </div>
      </section>

      {/* Templates Grid */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Free Templates"
            subtitle="Professional templates to help you build your startup"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <FeatureCard
                key={index}
                icon={template.icon}
                title={template.title}
                description={template.description}
                tint={template.tint}
              >
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--mkt-divider)" }}>
                  <span 
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--mkt-primary)" }}
                  >
                    {template.category}
                  </span>
                </div>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use */}
      <section className="mkt-pad-section mkt-section-gradient-blue">
        <div className="max-w-4xl mx-auto px-6">
          <SectionTitle
            title="How to Use These Templates"
            subtitle="Get the most out of our resources"
            center
          />
          <div 
            className="rounded-2xl p-10 mkt-card--floating"
            style={{
              background: "var(--mkt-surface)",
              boxShadow: "var(--mkt-layer-shadow)"
            }}
          >
            <div className="space-y-8">
              {[
                {
                  title: "1. Download & Customize",
                  description: "All templates are available in editable formats (PDF, Excel, Google Docs). Customize them to fit your specific needs.",
                },
                {
                  title: "2. Follow the Framework",
                  description: "Each template includes instructions and best practices. Follow the framework to ensure you cover all important aspects.",
                },
                {
                  title: "3. Iterate & Improve",
                  description: "Templates are starting points. Update them as you learn more about your market, customers, and business model.",
                },
              ].map((item, index) => (
                <div key={index}>
                  <h3 
                    className="mkt-h3 font-semibold mb-3"
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
        </div>
      </section>

      {/* CTA */}
      <CTASection
        title="Ready to use these templates?"
        description="Get access to all templates and more resources. Free account includes template downloads."
        primaryCTA={{ to: "/register", label: "Sign Up Free" }}
        secondaryCTA={{ to: "/resources", label: "View All Resources" }}
        gradient
        className="my-20"
      />
    </MarketingLayout>
  );
}
