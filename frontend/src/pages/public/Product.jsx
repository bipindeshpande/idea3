import { Link } from "react-router-dom";
import { useState } from "react";
import Seo from "../../components/common/Seo.jsx";
import ExpandableDetails from "../../components/common/ExpandableDetails.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

const valuePanels = [
  {
    title: "Personalized Profile Analysis",
    summary: "Deep insights into your motivations, constraints, strengths, and opportunity angles tailored to your unique profile.",
    icon: "🎯",
    color: "brand",
    details: [
      "Motivation analysis: Why you want to start",
      "Constraint mapping: Time, budget, skills assessed",
      "Strength identification: What you bring to the table",
      "Opportunity angles: Strategic considerations for your profile"
    ],
  },
  {
    title: "Ranked Startup Ideas",
    summary: "Top 3 ideas scored against your goals, time commitment, budget, and skills with detailed fit analysis.",
    icon: "💡",
    color: "aqua",
    details: [
      "Scored across 5 dimensions: Goal fit, time fit, budget fit, skill fit, work style",
      "Detailed fit analysis for each idea",
      "Clear ranking with rationale",
      "Comparison matrix to evaluate options"
    ],
  },
  {
    title: "Financial Outlook",
    summary: "Realistic startup costs, revenue projections, and breakeven timelines that respect your budget constraints.",
    icon: "💰",
    color: "coral",
    details: [
      "Startup costs breakdown (initial + monthly)",
      "Revenue projections (conservative, realistic, optimistic scenarios)",
      "Breakeven timeline analysis",
      "Unit economics (LTV, CAC, margins)",
      "Funding requirements if needed"
    ],
  },
  {
    title: "Risk Radar",
    summary: "Identified risks with severity ratings and actionable mitigation strategies for each recommendation.",
    icon: "⚠️",
    color: "sand",
    details: [
      "5-10 key risks identified per idea",
      "Severity ratings (Low, Medium, High)",
      "Impact analysis for each risk",
      "Actionable mitigation strategies",
      "Early warning signals to watch"
    ],
  },
  {
    title: "Validation Questions",
    summary: "Customer discovery scripts with guidance on what to listen for and how to act on responses.",
    icon: "🔍",
    color: "brand",
    details: [
      "Structured customer interview scripts",
      "What to listen for in responses",
      "How to interpret feedback",
      "Next steps based on validation results"
    ],
  },
  {
    title: "30/60/90 Day Roadmap",
    summary: "Customized execution plan with specific milestones and checkpoints for your chosen idea.",
    icon: "🗺️",
    color: "aqua",
    details: [
      "Days 0-30: Validation phase (customer interviews, MVP)",
      "Days 30-60: Building phase (development, early customers)",
      "Days 60-90: Launch phase (public launch, marketing, sales)",
      "Specific milestones and deliverables for each phase",
      "Success metrics and checkpoints"
    ],
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Tell us about you",
    detail: "Share your goals, time commitment, budget, interests, work style, and experience. Our intake form captures what matters.",
  },
  {
    step: "2",
    title: "AI analyzes your profile",
    detail: "Our AI system researches markets, analyzes financials, assesses risks, and validates ideas based on your profile.",
  },
  {
    step: "3",
    title: "Get your reports",
    detail: "Receive a comprehensive profile analysis, ranked recommendations, and a full report with actionable next steps.",
  },
];

const deliverables = [
  {
    title: "Profile Summary",
    description: "Structured analysis of your motivations, constraints, strengths, and strategic considerations.",
  },
  {
    title: "Recommendation Matrix",
    description: "Compare ideas across goal fit, time fit, budget fit, skill fit, and work style alignment.",
  },
  {
    title: "Complete PDF Report",
    description: "Download a comprehensive PDF combining profile analysis, recommendations, and full report sections.",
  },
];

export default function ProductPage() {
  return (
    <PageContainer maxWidth="lg">
      <Seo
        title="Product Overview | Startup Idea Advisor"
        description="Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps."
        path="/product"
      />

      {/* Hero Section */}
      <header className="relative mb-10 md:mb-12">
        <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <PageHeader
            title="Validate your idea or discover new opportunities"
            description="Choose your path: validate an existing startup idea across 10 key parameters, or let our AI discover personalized opportunities tailored to your profile, goals, and constraints."
          />
          <div className="flex flex-col items-start gap-4 sm:flex-row mt-6">
            <Button as={Link} to="/validate-idea">
              Validate Idea 🚀
            </Button>
            <Button as={Link} to="/advisor">
              Discover Ideas 💡
            </Button>
          </div>
        </div>
      </header>

      {/* Value Panels */}
      <section>
        <SectionHeader title="What You Get" className="text-3xl md:text-4xl mb-4" />
        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {valuePanels.map((panel) => {
            return (
              <Card
                key={panel.title}
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="icon-circle bg-[#f3f5ff] text-indigo-600 text-xl">
                    {panel.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{panel.title}</h3>
                </div>
                <p className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">{panel.summary}</p>
                {panel.details && (
                  <ExpandableDetails triggerText="What's included" icon="→">
                    <ul className="space-y-1.5">
                      {panel.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="mt-0.5 text-indigo-600">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </ExpandableDetails>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 10 Validation Parameters - Expandable Section */}
      <section className="mt-16">
        <details className="group rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">10-Parameter Validation Framework</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  See all parameters we analyze when validating your startup idea
                </p>
              </div>
              <span className="flex-shrink-0 text-xl text-brand-600  transition-transform group-open:rotate-180">▼</span>
            </div>
          </summary>
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
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
              ].map((param, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{param.name}</h3>
                  <p className="mt-2 text-[15px] text-gray-700 dark:text-slate-300">{param.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center">
              <Link to="/validate-idea" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300">
                Start validating your idea →
              </Link>
            </p>
          </div>
        </details>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-16 relative">
        <div className="absolute top-[-60px] left-[-60px] w-[260px] h-[260px] rounded-full bg-indigo-200 opacity-[0.08] blur-2xl"></div>
        <div className="relative rounded-xl border border-gray-200  bg-white  p-6 md:p-7 shadow-sm">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 ">How It Works</h2>
            <p className="mt-2 text-sm text-gray-500 ">
              Three simple steps from profile to actionable recommendations
            </p>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {howItWorks.map((item) => (
              <article key={item.step} className="group relative overflow-hidden rounded-xl border border-gray-200  bg-white  p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="mb-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#f3f5ff]  flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-600 ">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ">{item.title}</h3>
                </div>
                <p className="text-[15px] leading-relaxed text-gray-700 ">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      {/* Deliverables */}
      <section className="mt-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-900 dark:text-slate-50">Your Deliverables</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {deliverables.map((item) => (
            <article key={item.title} className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">{item.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Founder Connect Section */}
      <section className="mt-16 rounded-xl border border-gray-200  bg-white  p-6 md:p-7 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f3f5ff]  flex items-center justify-center text-2xl">
            🤝
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-semibold text-gray-900 ">Founder Connect - Find Your Co-Founder</h2>
            <p className="mb-3 text-[15px] leading-relaxed text-gray-700 ">
              After validating your idea or discovering new opportunities, connect with other founders to find co-founders, collaborators, and build your startup team. Browse anonymized profiles and listings, send connection requests, and reveal identities when both sides accept.
            </p>
            <ul className="mb-4 space-y-1.5 text-sm text-gray-500 ">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-[10px] font-semibold text-brand-700 dark:text-brand-300">✓</span>
                <span>Create your founder profile and list validated ideas for collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-[10px] font-semibold text-brand-700 dark:text-brand-300">✓</span>
                <span>Browse anonymized founder profiles and idea listings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-[10px] font-semibold text-brand-700 dark:text-brand-300">✓</span>
                <span>Privacy-first: identities only revealed after mutual acceptance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/50 text-[10px] font-semibold text-brand-700 dark:text-brand-300">✓</span>
                <span>Credit-based limits: Free (3/month), Starter (15/month), Pro (unlimited)</span>
              </li>
            </ul>
            <Link
              to="/founder-connect"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Explore Founder Connect 🤝
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <div className="mt-16 rounded-xl border border-gray-200  bg-white  p-6 md:p-7 shadow-sm">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl font-semibold text-gray-900 ">Ready to get started?</h2>
          <p className="mt-2 text-sm text-gray-500 ">
            Validate your existing idea or discover new opportunities tailored to your profile. No credit card required.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/validate-idea"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-coral-500/25 transition-all duration-200 hover:from-coral-600 hover:to-coral-700 hover:shadow-xl hover:shadow-coral-500/30 hover:-translate-y-0.5"
            >
              Validate Idea
            </Link>
            <Link
              to="/advisor"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              Discover Ideas
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-slate-300/60 dark:border-slate-600/60 bg-white  px-6 py-3 text-sm font-semibold text-slate-700  shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}


