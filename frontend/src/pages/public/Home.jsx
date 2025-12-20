/**
 * Home Page - Marketing Landing Page
 * 
 * Rules:
 * - 3-5 sections max
 * - ~2 screen heights + footer
 * - Each section must justify itself (Conversion | Trust | Clarity)
 * - Uses new token system
 * - Simple composition
 */

import Seo from "../../components/common/Seo.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { HeroSection } from "../../sections/marketing/home";
import { 
  ValueSection, 
  CTASection,
  PersonasSection
} from "../../components/marketing/sections";
import Button from "../../components/marketing/Button.jsx";
import Card from "../../components/marketing/Card.jsx";
import {
  seo,
  heroData,
  features,
  howItWorksSteps,
  personas,
  whatYouGetItems,
} from "../../data/marketing/home.js";

export default function HomePage() {
  // Use Cases Data
  const useCases = [
    {
      icon: "💡",
      title: "Discover Startup Ideas",
      description: "Get AI-powered startup idea recommendations tailored to your skills, constraints, and goals. Each idea includes financial projections and validation roadmaps.",
      cta: { to: "/advisor", label: "Discover Ideas" }
    },
    {
      icon: "✅",
      title: "Validate Your Idea",
      description: "Validate existing startup ideas with comprehensive analysis across 10 critical parameters. Get risk assessments and actionable insights.",
      cta: { to: "/validate-idea", label: "Validate Idea" }
    },
    {
      icon: "👥",
      title: "Find Co-Founders",
      description: "Connect with other founders, find collaborators, and build your startup team through our Founder Network.",
      cta: { to: "/product/network", label: "Join Network" }
    },
  ];

  // Combined Value Items - Top 6 most important from features + whatYouGetItems
  const combinedValueItems = [
    // Top features
    features[0], // Personalized Profile Analysis
    features[1], // Ranked Startup Ideas
    features[2], // Financial Outlook
    features[3], // Risk Radar
    // Top deliverables
    whatYouGetItems[1], // Recommendation Matrix
    whatYouGetItems[2], // Complete PDF Report
  ];

  // CTA data
  const ctaData = {
    title: "Ready to find your startup idea?",
    description: "Get AI-powered recommendations tailored to your profile, goals, and constraints.",
    primaryCTA: { to: "/advisor", label: "Find My Startup Idea" },
    secondaryCTA: { to: "/product", label: "See Example Outputs" },
  };

  return (
    <MarketingLayout>
      <Seo {...seo} />
      
      {/* Section 1: Hero (Conversion) */}
      <HeroSection data={heroData} />
      
      {/* Section 2: Use Cases + How It Works (Clarity) - CONSOLIDATED */}
      <section className="section-padding" data-section-file="UseCasesAndHowItWorks.jsx">
        <div className="container">
          {/* Combined Header */}
          <div className="text-center mb-12">
            <h2 
              className="mb-4"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-3xl)",
                lineHeight: "var(--line-height-tight)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--mkt-heading)",
              }}
            >
              What you can do and how it works
            </h2>
            <p 
              className="max-w-2xl mx-auto"
              style={{
                fontFamily: "var(--font-family)",
                fontSize: "var(--font-size-lg)",
                lineHeight: "var(--line-height-relaxed)",
                color: "var(--mkt-text-dim)",
              }}
            >
              Three powerful ways to find, validate, and build your startup, plus a simple process to get started
            </p>
          </div>

          {/* Use Cases Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.map((useCase, index) => {
                // Semantic color flow: Discover (Blue - primary), Validate (Green - success), Network (Purple - secondary)
                const accentMap = ["primary", "accent-2", "accent-1"]; // Blue, Green, Purple
                return (
                  <Card 
                    key={index} 
                    padding="md" 
                    variant={index === 1 ? "elevated" : "default"}
                    accent={accentMap[index]}
                    className="scroll-reveal flex flex-col"
                  >
                    {useCase.icon && (
                      <div 
                        className="mb-4"
                        style={{ 
                          fontSize: "40px",
                          display: "inline-block"
                        }}
                      >
                        {useCase.icon}
                      </div>
                    )}
                    <h3 
                      className="mb-3 flex-grow"
                      style={{
                        fontFamily: "var(--font-family)",
                        fontSize: "var(--font-size-xl)",
                        lineHeight: "var(--line-height-tight)",
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--mkt-heading)",
                      }}
                    >
                      {useCase.title}
                    </h3>
                    {useCase.description && (
                      <p 
                        className="mb-4 flex-grow"
                        style={{
                          fontFamily: "var(--font-family)",
                          fontSize: "var(--font-size-base)",
                          lineHeight: "var(--line-height-normal)",
                          color: "var(--mkt-text-dim)",
                        }}
                      >
                        {useCase.description}
                      </p>
                    )}
                    {useCase.cta && (
                      <div className="mt-auto">
                        <Button
                          to={useCase.cta.to}
                          variant="secondary"
                          size="md"
                        >
                          {useCase.cta.label}
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* How It Works Steps */}
          <div>
            <div className="text-center mb-12">
              <h3 
                className="mb-4"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-2xl)",
                  lineHeight: "var(--line-height-tight)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--mkt-heading)",
                }}
              >
                How It Works
              </h3>
              <p 
                className="max-w-2xl mx-auto"
                style={{
                  fontFamily: "var(--font-family)",
                  fontSize: "var(--font-size-lg)",
                  lineHeight: "var(--line-height-relaxed)",
                  color: "var(--mkt-text-dim)",
                }}
              >
                Three simple steps from profile to actionable recommendations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {howItWorksSteps.map((step, index) => (
                  <div key={index} className="relative scroll-reveal">
                    {/* Connector Line (desktop only) */}
                    {index < howItWorksSteps.length - 1 && (
                      <div 
                        className="hidden md:block absolute top-12 left-full w-full h-0.5"
                        style={{
                          backgroundColor: "var(--mkt-outline)",
                          width: "calc(100% - 48px)",
                          marginLeft: "24px",
                        }}
                      />
                    )}
                    
                    <Card 
                      padding="md" 
                      variant={index === 1 ? "elevated" : "default"}
                      accent={index === 0 ? "primary" : index === 1 ? "accent-1" : "accent-2"} // Blue → Purple → Green flow
                      className="text-center"
                    >
                      {/* Step Number - Progressive flow: Blue (start) → Purple (middle) → Green (completion) */}
                      <div 
                        className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center font-bold"
                        style={{
                          backgroundColor: index === 0 
                            ? "var(--mkt-primary)" 
                            : index === 1
                            ? "var(--mkt-card-secondary)"
                            : "var(--mkt-card-accent)", /* Green for completion */
                          color: "white",
                          fontFamily: "var(--font-family)",
                          fontSize: "var(--font-size-xl)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        {step.step || index + 1}
                      </div>
                      
                      {/* Step Title */}
                      <h3 
                        className="mb-3"
                        style={{
                          fontFamily: "var(--font-family)",
                          fontSize: "var(--font-size-xl)",
                          lineHeight: "var(--line-height-tight)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--mkt-heading)",
                        }}
                      >
                        {step.title}
                      </h3>
                      
                      {/* Step Description */}
                      {step.description && (
                        <p 
                          style={{
                            fontFamily: "var(--font-family)",
                            fontSize: "var(--font-size-base)",
                            lineHeight: "var(--line-height-normal)",
                            color: "var(--mkt-text-dim)",
                          }}
                        >
                          {step.description}
                        </p>
                      )}
                    </Card>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Section 3: Value Proposition + What You Get (Clarity) - CONSOLIDATED */}
      <ValueSection
        title="Why clarity matters and what you get"
        subtitle="Every day spent on the wrong idea is a day you can't get back. Know what fits before you commit months of effort—and get comprehensive reports with actionable insights."
        items={combinedValueItems}
      />
      
      {/* Section 4: Who It's For (Trust) */}
      <PersonasSection
        title="Who is this for?"
        subtitle="Built for founders at every stage of their journey"
        personas={personas}
      />
      
      {/* Section 5: CTA (Conversion) */}
      <CTASection {...ctaData} />
    </MarketingLayout>
  );
}
