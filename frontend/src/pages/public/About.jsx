import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { HeroSection } from "../../sections/marketing/about";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import Blob from "../../components/marketing/Blob.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function AboutPage() {
 return (
 <MarketingLayout>
 <PageContainer>
 <Seo
 title="About | Startup Idea Advisor"
 description="Learn why we built Startup Idea Advisor and how our AI advisor empowers founders to validate ideas faster."
 path="/about"
 />
 
 {/* Hero Section */}
 <HeroSection
 title="About"
 subtitle="We built Startup Idea Advisor after watching countless professionals struggle to translate their strengths into viable ventures. Our mission is to combine founder empathy with AI-assisted research so you can explore opportunities confidently and efficiently."
 className="mb-20"
 />

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

 <div className="space-y-12">

 {/* Our Mission Section */}
 <section className="relative py-8">
 <Card className="marketing-card-blue relative overflow-hidden">
 <Blob size="small" position="top-right" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">🎯</span>
 </div>
 <SectionHeader title="Our Mission" subtitle="Why we exist" center className="mb-6" />
 
 <div className="space-y-4 text-primary text-primary leading-relaxed">
 <p>
 We believe <strong>every entrepreneur deserves access to professional-grade validation</strong>, regardless of budget, background, or connections.
 </p>
 <p>
 Traditional validation is broken. Consultants charge $5,000+ for basic research. Incubators require applications and equity. Most founders are left guessing whether their idea is worth pursuing—or they skip validation entirely and build blindly.
 </p>
 <p>
 Startup Idea Advisor exists to change that. We combine AI-powered research with founder empathy to deliver <strong>advisor-grade analysis in minutes—not weeks, and at a fraction of the cost</strong>.
 </p>
 <p>
 By orchestrating multiple specialist AI agents, we automate the research, analysis, and strategic thinking that advisors do, so you can focus on building.
 </p>
 </div>
 </div>
 </Card>
 </section>

 {/* The Problem We Solve Section */}
 <section className="relative py-8">
 <Card className="marketing-card-purple relative overflow-hidden">
 <Blob size="small" position="bottom-left" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">🔍</span>
 </div>
 <SectionHeader title="The Problem We Solve" subtitle="What founders struggle with" center className="mb-6" />
 
 <div className="space-y-4 text-primary text-primary leading-relaxed">
 <p>
 Founders waste months (and thousands of dollars) on ideas that won't work because they don't have access to:
 </p>
 <ul className="list-disc list-outside ml-6 space-y-2">
 <li>Market research and competitive analysis</li>
 <li>Financial modeling and revenue projections</li>
 <li>Risk assessment and mitigation strategies</li>
 <li>Validation frameworks and customer discovery methods</li>
 <li>Personalized recommendations based on their unique constraints</li>
 </ul>
 <p>
 Most founders either <strong>skip validation and build blindly</strong> (leading to high failure rates), <strong>pay consultants thousands</strong> for basic research, or <strong>spend weeks doing manual research</strong> that's often incomplete or outdated.
 </p>
 <p>
 We automate the research and analysis that advisors do, so you can make informed decisions without the cost or time investment.
 </p>
 </div>
 </div>
 </Card>
 </section>

 {/* How It Works Section */}
 <section className="relative py-8">
 <Card className="marketing-card-teal relative overflow-hidden">
 <Blob size="small" position="top-right" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">⚙️</span>
 </div>
 <SectionHeader title="How We Deliver Advisor-Grade Analysis" subtitle="Our AI system explained" center className="mb-6" />
 
 <div className="space-y-4 text-primary text-primary leading-relaxed">
 <p>
 Our AI system uses multiple specialist agents working together to deliver comprehensive analysis:
 </p>
 <ul className="list-disc list-outside ml-6 space-y-2">
 <li><strong>Profile Analysis</strong> - Understands your goals, constraints, and strengths</li>
 <li><strong>Market Research</strong> - Analyzes markets, competitors, and industry trends</li>
 <li><strong>Idea Generation</strong> - Generates ideas tailored to your unique profile</li>
 <li><strong>Financial Modeling</strong> - Projects costs, revenue, and breakeven timelines</li>
 <li><strong>Risk Assessment</strong> - Identifies and provides mitigation strategies for potential risks</li>
 <li><strong>Validation Frameworks</strong> - Provides structured methods to test your ideas</li>
 </ul>
 <p>
 All of this happens in minutes, not weeks. And it's personalized to your unique situation—your time commitment, budget, skills, and goals.
 </p>
 <div className="mt-4">
 <Link to="/product">
 <UIButton variant="secondary" className="w-full md:w-auto">
 Learn more about how it works →
 </UIButton>
 </Link>
 </div>
 </div>
 </div>
 </Card>
 </section>

 {/* Founder Story Section */}
 <section className="relative py-8">
 <Card className="marketing-card-orange relative overflow-hidden">
 <Blob size="small" position="bottom-right" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">👨‍💼</span>
 </div>
 <SectionHeader title="Built by Entrepreneurs, for Entrepreneurs" subtitle="Our founder's story" center className="mb-6" />
 
 <div className="space-y-4 text-primary text-primary leading-relaxed">
 <p>
 After years of working in startups and watching countless entrepreneurs struggle with the same problem—<strong>how do I know if my idea is worth pursuing?</strong>—I decided to build something different.
 </p>
 <p>
 I've been there: spending weeks researching markets, analyzing competitors, and trying to validate ideas manually. The process was time-consuming, expensive, and often left me with more questions than answers. That's when I realized: <strong>what if AI could do the heavy lifting?</strong>
 </p>
 <p>
 Startup Idea Advisor was born from a simple belief: <strong>every entrepreneur deserves access to professional-grade validation</strong>, regardless of budget or connections. We combine AI-powered research with founder empathy to give you the insights you need—in minutes, not weeks.
 </p>
 <p>
 This isn't just another AI tool. It's built by someone who understands the startup journey, the uncertainty, and the need for honest, actionable feedback. <strong>We're here to help you make better decisions, faster.</strong>
 </p>
 </div>
 </div>
 </Card>
 </section>

 {/* What We Believe Section */}
 <section className="relative py-8">
 <Card className="marketing-card-blue relative overflow-hidden">
 <Blob size="small" position="top-left" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">💡</span>
 </div>
 <SectionHeader title="What We Believe" subtitle="Our core values" center className="mb-6" />
 
 <div className="space-y-5 text-primary text-primary leading-relaxed">
 <div>
 <h4 className="font-semibold text-primary mb-1">1. Ideas must fit the founder</h4>
 <p>
 The best startup idea for you is one that aligns with your goals, skills, time, and budget. Generic advice doesn't work. That's why every recommendation we generate is personalized to your unique profile and constraints.
 </p>
 </div>
 <div>
 <h4 className="font-semibold text-primary mb-1">2. Validation before building</h4>
 <p>
 Validate problems, test willingness to pay, and assess risks before writing code. This saves time and money. Our validation frameworks help you test assumptions quickly and cheaply.
 </p>
 </div>
 <div>
 <h4 className="font-semibold text-primary mb-1">3. Honest feedback &gt; false encouragement</h4>
 <p>
 We tell you the hard truths about your ideas because that's what helps you succeed. Our risk assessments and red flags are designed to help you avoid costly mistakes, not to discourage you.
 </p>
 </div>
 <div>
 <h4 className="font-semibold text-primary mb-1">4. Accessibility matters</h4>
 <p>
 Professional-grade validation shouldn't require VC connections or a $10,000 budget. We're committed to making advisor-quality insights available to every founder, regardless of their starting point.
 </p>
 </div>
 </div>
 </div>
 </Card>
 </section>

 {/* What's Next Section */}
 <section className="relative py-8">
 <Card className="marketing-card-purple relative overflow-hidden">
 <Blob size="small" position="top-right" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-6 mx-auto">
 <span className="text-3xl">🚀</span>
 </div>
 <SectionHeader title="What's Next" subtitle="Our vision and roadmap" center className="mb-6" />
 
 <div className="space-y-4 text-primary text-primary leading-relaxed">
 <p>
 We're constantly improving our AI models and adding new features based on founder feedback. Our goal is to make Startup Idea Advisor the most comprehensive, accurate, and helpful validation tool available.
 </p>
 <p>
 We're always looking for ways to improve the analysis, add new capabilities, and make the experience better for founders. Your feedback drives what we build next.
 </p>
 <p>
 Have ideas or feedback? We'd love to hear from you. <Link to="/contact" className="text-accent hover:text-accent font-semibold">Contact us</Link> or check out our <Link to="/blog" className="text-accent hover:text-accent font-semibold">blog</Link> for the latest updates and insights.
 </p>
 </div>
 </div>
 </Card>
 </section>

 </div>

 {/* Section Divider */}
 <div className="marketing-divider my-16" />

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

