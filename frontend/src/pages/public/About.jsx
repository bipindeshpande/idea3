import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { HeroSection } from "../../sections/marketing/about";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import Blob from "../../components/marketing/Blob.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";
import { generateBreadcrumbs, breadcrumbPatterns } from "../../utils/seo/breadcrumbs.js";

export default function AboutPage() {
  const breadcrumbs = generateBreadcrumbs(breadcrumbPatterns.about);

  return (
    <MarketingLayout>
      <PageContainer>
        <Seo
          title="About | Startup Idea Advisor"
          description="Learn why we built Startup Idea Advisor and how our AI-powered platform helps founders validate startup ideas faster with advisor-grade analysis in minutes, not weeks."
          path="/about"
          breadcrumbs={breadcrumbs}
        />
        
        {/* Hero Section - Enhanced with eyebrow */}
        <HeroSection
          eyebrow="About Us"
          title="About"
          subtitle="We built Startup Idea Advisor after watching countless professionals struggle to translate their strengths into viable ventures. Our mission is to combine founder empathy with AI-assisted research so you can explore opportunities confidently and efficiently."
          className="mkt-section-lg mb-12"
        />

        {/* Mission + Problem - 2 Column Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {/* Our Mission Section */}
          <section className="relative">
            <Card className="marketing-card-blue relative overflow-hidden h-full">
              <Blob size="small" position="top-right" />
              <div className="relative z-10">
                <div className="marketing-icon-circle mb-6 mx-auto">
                  <span className="text-3xl">🎯</span>
                </div>
                <SectionHeader title="Our Mission" subtitle="Why we exist" center className="mb-6" />
                
                <div className="space-y-4 mkt-body leading-relaxed">
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(37, 99, 235, 0.05)', borderLeft: '3px solid var(--mkt-primary)' }}>
                    <p className="mb-0">
                      We believe <strong>every entrepreneur deserves access to professional-grade validation</strong>, regardless of budget, background, or connections.
                    </p>
                  </div>
                  <p>
                    Traditional validation is broken. Consultants charge <span className="font-semibold" style={{ color: 'var(--mkt-primary)' }}>$5,000+</span> for basic research. Incubators require applications and equity.
                  </p>
                  <p>
                    Startup Idea Advisor exists to change that. We combine AI-powered research with founder empathy to deliver <strong className="px-1 rounded" style={{ background: 'rgba(37, 99, 235, 0.1)' }}>advisor-grade analysis in minutes—not weeks</strong>.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* The Problem We Solve Section */}
          <section className="relative">
            <Card className="marketing-card-purple relative overflow-hidden h-full">
              <Blob size="small" position="bottom-left" />
              <div className="relative z-10">
                <div className="marketing-icon-circle mb-6 mx-auto">
                  <span className="text-3xl">🔍</span>
                </div>
                <SectionHeader title="The Problem" subtitle="What founders struggle with" center className="mb-6" />
                
                <div className="space-y-4 mkt-body leading-relaxed">
                  <p>
                    Founders waste months (and thousands of dollars) on ideas that won't work because they don't have access to:
                  </p>
                  <ul className="space-y-2 mt-4">
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--mkt-primary)' }}>✗</span>
                      <span>Market research and competitive analysis</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--mkt-primary)' }}>✗</span>
                      <span>Financial modeling and revenue projections</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--mkt-primary)' }}>✗</span>
                      <span>Risk assessment and mitigation strategies</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--mkt-primary)' }}>✗</span>
                      <span>Validation frameworks and customer discovery</span>
                    </li>
                  </ul>
                  <p className="mt-4">
                    Most founders either <strong>skip validation and build blindly</strong> or <strong>pay consultants thousands</strong> for basic research.
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </div>

        {/* How It Works Section - Full Width with Grid */}
        <section className="relative mkt-section-lg mb-12">
          <Card className="marketing-card-teal relative overflow-hidden">
            <Blob size="small" position="top-right" />
            <div className="relative z-10">
              <SectionHeader title="How We Deliver Advisor-Grade Analysis" subtitle="Our AI system explained" center className="mb-8" />
              
              <div className="space-y-4 mkt-body leading-relaxed mb-6">
                <p className="text-center max-w-2xl mx-auto">
                  Our AI system uses multiple specialist agents working together to deliver comprehensive analysis:
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
                {[
                  { title: "Profile Analysis", desc: "Understands your goals, constraints, and strengths" },
                  { title: "Market Research", desc: "Analyzes markets, competitors, and industry trends" },
                  { title: "Idea Generation", desc: "Generates ideas tailored to your unique profile" },
                  { title: "Financial Modeling", desc: "Projects costs, revenue, and breakeven timelines" },
                  { title: "Risk Assessment", desc: "Identifies and provides mitigation strategies" },
                  { title: "Validation Frameworks", desc: "Provides structured methods to test your ideas" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-3 p-4 rounded-lg" style={{ background: 'var(--mkt-surface)' }}>
                    <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: 'var(--mkt-card-accent)', color: 'var(--mkt-primary)' }}>✓</span>
                    <div>
                      <strong className="mkt-h3 block mb-1">{feature.title}</strong>
                      <span className="mkt-body text-sm">{feature.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-center mt-8 mkt-body">
                All of this happens in <strong>minutes, not weeks</strong>. And it's personalized to your unique situation—your time commitment, budget, skills, and goals.
              </p>
              
              <div className="mt-6 text-center">
                <Link to="/product">
                  <UIButton variant="secondary" className="w-full md:w-auto">
                    Learn more about how it works →
                  </UIButton>
                </Link>
              </div>
            </div>
          </Card>
        </section>

        {/* Founder Story Section - Full Width */}
        <section className="relative mkt-section-lg mb-12">
          <Card className="marketing-card-secondary relative overflow-hidden">
            <Blob size="small" position="bottom-right" />
            <div className="relative z-10">
              <SectionHeader title="Built by Entrepreneurs, for Entrepreneurs" subtitle="Our founder's story" center className="mb-6" />
              
              <div className="space-y-5 mkt-body leading-relaxed max-w-3xl mx-auto">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.05)', borderLeft: '3px solid var(--mkt-primary)' }}>
                  <p className="mb-0">
                    After years of working in startups and watching countless entrepreneurs struggle with the same problem—<strong>how do I know if my idea is worth pursuing?</strong>—I decided to build something different.
                  </p>
                </div>
                <p>
                  I've been there: spending weeks researching markets, analyzing competitors, and trying to validate ideas manually. The process was time-consuming, expensive, and often left me with more questions than answers. That's when I realized: <strong className="px-1 rounded" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>what if AI could do the heavy lifting?</strong>
                </p>
                <p>
                  Startup Idea Advisor was born from a simple belief: <strong>every entrepreneur deserves access to professional-grade validation</strong>, regardless of budget or connections. We combine AI-powered research with founder empathy to give you the insights you need—<span className="font-semibold" style={{ color: 'var(--mkt-primary)' }}>in minutes, not weeks</span>.
                </p>
                <p>
                  This isn't just another AI tool. It's built by someone who understands the startup journey, the uncertainty, and the need for honest, actionable feedback. <strong>We're here to help you make better decisions, faster.</strong>
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* What We Believe Section - 2x2 Grid */}
        <section className="relative mkt-section-lg mb-12">
          <Card className="marketing-card-blue relative overflow-hidden">
            <Blob size="small" position="top-left" />
            <div className="relative z-10">
              <SectionHeader title="What We Believe" subtitle="Our core values" center className="mb-8" />
              
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { num: "1", title: "Ideas must fit the founder", desc: "The best startup idea for you is one that aligns with your goals, skills, time, and budget. Generic advice doesn't work. That's why every recommendation we generate is personalized to your unique profile and constraints." },
                  { num: "2", title: "Validation before building", desc: "Validate problems, test willingness to pay, and assess risks before writing code. This saves time and money. Our validation frameworks help you test assumptions quickly and cheaply." },
                  { num: "3", title: "Honest feedback > false encouragement", desc: "We tell you the hard truths about your ideas because that's what helps you succeed. Our risk assessments and red flags are designed to help you avoid costly mistakes, not to discourage you." },
                  { num: "4", title: "Accessibility matters", desc: "Professional-grade validation shouldn't require VC connections or a $10,000 budget. We're committed to making advisor-quality insights available to every founder, regardless of their starting point." },
                ].map((value, idx) => (
                  <div key={idx} className="relative pl-6 border-l-2" style={{ borderColor: 'rgba(37, 99, 235, 0.2)' }}>
                    <div className="absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--mkt-primary)' }}>{value.num}</div>
                    <h4 className="mkt-h3 mb-2 mt-1">{value.title}</h4>
                    <p className="mkt-body">{value.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* What's Next Section - Simplified */}
        <section className="relative mkt-section mb-12">
          <Card className="marketing-card-purple relative overflow-hidden">
            <Blob size="small" position="top-right" />
            <div className="relative z-10">
              <SectionHeader title="What's Next" subtitle="Our vision and roadmap" center className="mb-6" />
              
              <div className="space-y-4 mkt-body leading-relaxed max-w-2xl mx-auto text-center">
                <p>
                  We're constantly improving our AI models and adding new features based on founder feedback. Our goal is to make Startup Idea Advisor the most comprehensive, accurate, and helpful validation tool available.
                </p>
                <p>
                  Have ideas or feedback? We'd love to hear from you. <Link to="/contact" className="text-accent hover:text-accent-hover font-semibold">Contact us</Link> or check out our <Link to="/blog" className="text-accent hover:text-accent-hover font-semibold">blog</Link> for the latest updates and insights.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* Section Divider */}
        <div className="mkt-divider my-12" />

        {/* CTA Section */}
        <CTASection
          title="Ready to explore your startup ideas?"
          description="Get personalized startup ideas, validation frameworks, and advisor-grade analysis in minutes."
          primaryCTA={{ to: "/advisor", label: "Start Discovery Session" }}
          secondaryCTA={{ to: "/product", label: "See How It Works" }}
          gradient
          className="my-12"
        />
      </PageContainer>
    </MarketingLayout>
  );
}
