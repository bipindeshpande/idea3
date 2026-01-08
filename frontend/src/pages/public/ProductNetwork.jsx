import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { HeroSection } from "../../sections/marketing/network";
import FeatureCard from "../../components/marketing/FeatureCard.jsx";
import SectionTitle from "../../components/marketing/SectionTitle.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import MockupBrowser from "../../components/marketing/mockups/MockupBrowser.jsx";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";

// SEO metadata
export const seo = {
  title: "Startup Idea Advisor — Founder Network",
  description: "Connect with other founders to find co-founders, collaborators, and build your startup team. Privacy-first networking for entrepreneurs.",
  keywords: "co-founder, founder network, startup networking, find co-founder, startup collaboration, founder connect",
  canonical: "/product/network",
  ogTitle: "Startup Idea Advisor — Founder Network",
  ogDescription: "Connect with other founders to find co-founders, collaborators, and build your startup team. Privacy-first networking for entrepreneurs.",
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Founder Network",
    applicationCategory: "SocialNetworkingApplication",
    description: "Privacy-first networking platform for founders to find co-founders and collaborators",
    url: "https://ideabunch.com/product/network",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  }
};

const roles = [
  {
    title: "Technical Founders",
    description: "Engineers, developers, and technical experts looking for business partners.",
    icon: "💻",
    tint: "blue", // Primary - most common role
  },
  {
    title: "Designers",
    description: "Product designers and UX experts seeking technical co-founders.",
    icon: "🎨",
    tint: "purple", // Secondary - supporting role
  },
  {
    title: "Marketers",
    description: "Growth hackers and marketers looking for product teams.",
    icon: "📈",
    tint: "green", // Success/positive - growth-oriented
  },
  {
    title: "Business Founders",
    description: "Business-minded entrepreneurs seeking technical talent.",
    icon: "💼",
    tint: "blue", // Important - cycles back to primary
  },
];

const features = [
  {
    icon: "🔒",
    title: "Privacy-First",
    description: "Identities remain anonymous until both sides accept a connection request. Browse safely and connect on your terms.",
    tint: "blue", // Primary - most important feature
  },
  {
    icon: "🤝",
    title: "Smart Matching",
    description: "Browse anonymized profiles and listings. Filter by skills, interests, and idea categories to find the perfect match.",
    tint: "purple", // Secondary - supporting feature
  },
  {
    icon: "📊",
    title: "Profile Analytics",
    description: "See who viewed your profile and track your connection success rate to optimize your listing.",
    tint: "green", // Success/positive - analytics show positive outcomes
  },
];

export default function ProductNetworkPage() {
  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.productNetwork);

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

      {/* Hero Section */}
      <HeroSection
        data={{
          title: "Find the right co-founder",
          subheadline: "Connect with other founders to find co-founders, collaborators, and build your startup team. Privacy-first networking designed for entrepreneurs.",
          primaryCTA: { to: "/founder-connect", label: "Show Me Examples" },
          secondaryCTA: { to: "/product", label: "View All Features" },
          illustration: {
            gradient: "linear-gradient(135deg, var(--mkt-card-primary), var(--mkt-card-secondary))"
          }
        }}
      />

      {/* Screenshot Mockup Block */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Founder Network Preview"
            subtitle="See how privacy-first networking works"
            center
          />
          <div className="max-w-5xl mx-auto mt-12">
            <MockupBrowser url="https://app.startupideaadvisor.com/founder-connect">
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

      {/* Roles Cards */}
      <section className="mkt-pad-section" style={{ background: "var(--mkt-surface)" }}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="Connect with Founders"
            subtitle="Find the perfect co-founder or collaborator"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...role} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mkt-pad-section mkt-section-gradient-green">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How It Works"
            subtitle="Privacy-first networking for founders"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="animate-mkt-fadeUp" style={{ animationDelay: `${index * 0.1}s` }}>
                <FeatureCard {...feature} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3-Step Section */}
      <section className="mkt-pad-section mkt-section-gradient-green">
        <div className="max-w-7xl mx-auto px-6">
          <SectionTitle
            title="How Founder Network Works"
            subtitle="Connect with founders in three simple steps"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Build your founder profile and list validated ideas you're looking to collaborate on. Keep it anonymous until mutual acceptance.",
                icon: "👤",
              },
              {
                step: "2",
                title: "Browse & Connect",
                description: "Browse anonymized founder profiles and idea listings. Filter by skills, interests, and categories to find the perfect match.",
                icon: "🔍",
              },
              {
                step: "3",
                title: "Reveal & Collaborate",
                description: "Send connection requests. When both sides accept, identities are revealed and you can start collaborating.",
                icon: "🤝",
              },
            ].map((step, index) => (
              <div 
                key={index}
                className="text-center animate-mkt-fadeUp"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div 
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-xl font-bold"
                  style={{
                    background: index === 0 
                      ? "var(--mkt-primary)" 
                      : index === 1
                      ? "var(--mkt-card-secondary)"
                      : "var(--mkt-card-accent)", /* Green for completion */
                    color: "white",
                    boxShadow: "var(--mkt-card-shadow)",
                    border: "2px solid transparent",
                  }}
                >
                  {step.step}
                </div>
                <h3 
                  className="mkt-h3 mb-3"
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
            title="Network Features"
            subtitle="Everything you get with Founder Network"
            center
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[
              "Anonymized Profile Browsing",
              "Idea Listing & Discovery",
              "Privacy-First Connections",
              "Mutual Acceptance System",
              "Profile Analytics",
              "Skill-Based Filtering",
              "Interest Matching",
              "Connection Request Management",
              "Credit-Based Limits",
              "Co-Founder Search",
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

      {/* CTA */}
      <CTASection
        title="Ready to find your co-founder?"
        description="Join the Founder Network and connect with other entrepreneurs. Free plan includes 3 connections per month."
        primaryCTA={{ to: "/founder-connect", label: "Show Me Examples" }}
        secondaryCTA={{ to: "/pricing", label: "View Pricing" }}
        gradient
        className="my-12"
      />
    </MarketingLayout>
  );
}
