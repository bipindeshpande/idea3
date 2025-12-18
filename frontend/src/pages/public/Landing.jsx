import { Link } from "react-router-dom";
import { useState } from "react";
import Seo from "../../components/common/Seo.jsx";
import HeroSection from "../../components/marketing/HeroSection.jsx";
import FeatureGrid from "../../components/marketing/FeatureGrid.jsx";
import SectionHeader from "../../components/marketing/SectionHeader.jsx";
import CTASection from "../../components/marketing/CTASection.jsx";
import Blob from "../../components/marketing/Blob.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

// Value panels from Product page
const valuePanels = [
 {
 icon: "🎯",
 title: "Personalized Profile Analysis",
 description: "Deep insights into your motivations, constraints, strengths, and opportunity angles tailored to your unique profile.",
 color: "blue",
 },
 {
 icon: "💡",
 title: "Ranked Startup Ideas",
 description: "Top 3 ideas scored against your goals, time commitment, budget, and skills with detailed fit analysis.",
 color: "purple",
 },
 {
 icon: "💰",
 title: "Financial Outlook",
 description: "Realistic startup costs, revenue projections, and breakeven timelines that respect your budget constraints.",
 color: "orange",
 },
 {
 icon: "⚠️",
 title: "Risk Radar",
 description: "Identified risks with severity ratings and actionable mitigation strategies for each recommendation.",
 color: "green",
 },
 {
 icon: "🔍",
 title: "Validation Questions",
 description: "Customer discovery scripts with guidance on what to listen for and how to act on responses.",
 color: "blue",
 },
 {
 icon: "🗺️",
 title: "30/60/90 Day Roadmap",
 description: "Customized execution plan with specific milestones and checkpoints for your chosen idea.",
 color: "purple",
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
 icon: "📊",
 },
 {
 title: "Recommendation Matrix",
 description: "Compare ideas across goal fit, time fit, budget fit, skill fit, and work style alignment.",
 icon: "📈",
 },
 {
 title: "Complete PDF Report",
 description: "Download a comprehensive PDF combining profile analysis, recommendations, and full report sections.",
 icon: "📄",
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

export default function LandingPage() {
 const [showParams, setShowParams] = useState(false);

 const colorMap = {
 blue: "marketing-card-blue",
 purple: "marketing-card-purple",
 orange: "marketing-card-orange",
 green: "marketing-card-green",
 };

 return (
 <MarketingLayout fullWidth={true}>
 <Seo
 title="Startup Idea Advisor | Validate Your Idea or Discover New Opportunities"
 description="Transform your profile into validated startup ideas with AI-powered analysis, financial outlook, and actionable roadmaps. Validate existing ideas or discover personalized opportunities."
 path="/"
 />

 {/* Hero Section */}
 <section className="marketing-hero relative">
 <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
 <UIHeading level="h1" className="marketing-hero-title text-white mb-6 animate-fadeInDown">
 Validate your idea or discover new opportunities
 </UIHeading>
 <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8 leading-relaxed animate-fadeInDown delay-100">
 Choose your path: validate an existing startup idea across 10 key parameters, or let our AI discover personalized opportunities tailored to your profile, goals, and constraints.
 </p>
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInDown delay-200">
 <UIButton
 as={Link}
 to="/validate-idea"
 variant="secondary"
 className="bg-white text-accent hover:bg-white/90 px-8 py-3 text-sm font-medium"
 >
 Validate Idea
 </UIButton>
 <UIButton
 as={Link}
 to="/advisor"
 variant="secondary"
 className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 px-8 py-3 text-sm font-medium"
 >
 Discover Ideas
 </UIButton>
 </div>
 <div className="mt-12 animate-fadeInDown delay-300">
 <svg className="w-6 h-6 mx-auto text-white/60 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
 </svg>
 </div>
 </div>
 </section>

 {/* What You Get Section */}
 <section className="marketing-section bg-white">
 <div className="max-w-7xl mx-auto px-6">
 <SectionHeader
 title="What You Get"
 subtitle="Comprehensive analysis and actionable insights tailored to your profile"
 center
 className="mb-12"
 />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {valuePanels.map((panel, index) => (
 <Card
 key={panel.title}
 className={`marketing-feature-card ${colorMap[panel.color]} marketing-fade-in`}
 style={{ animationDelay: `${index * 0.1}s` }}
 >
 <div className="marketing-icon-circle mb-4 mx-auto animate-scaleIn" style={{ animationDelay: `${index * 0.15}s` }}>
 <span className="text-3xl">{panel.icon}</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">
 {panel.title}
 </UIHeading>
 <p className="text-sm text-secondary leading-relaxed text-center mb-4">
 {panel.description}
 </p>
 <Link to="/product" className="text-sm text-accent hover:text-accent-hover font-medium text-center block">
 Learn more →
 </Link>
 </Card>
 ))}
 </div>
 </div>
 </section>

 {/* Validation Framework Section */}
 <section className="marketing-section marketing-card-purple relative overflow-hidden">
 <Blob size="medium" position="top-right" />
 <div className="max-w-7xl mx-auto px-6 relative z-10">
 <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg">
 <div className="flex flex-col md:flex-row items-start gap-6 p-6 md:p-8">
 <div className="marketing-icon-circle flex-shrink-0">
 <span className="text-4xl">📋</span>
 </div>
 <div className="flex-1">
 <UIHeading level="h2" className="marketing-section-title text-primary mb-2">
 10-Parameter Validation Framework
 </UIHeading>
 <p className="text-sm text-secondary leading-relaxed mb-6">
 The industry's clearest way to validate ideas. We analyze your startup concept across 10 critical dimensions to give you confidence before you build.
 </p>
 <button
 onClick={() => setShowParams(!showParams)}
 className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
 >
 {showParams ? "Hide Parameters ▲" : "Show Parameters ▼"}
 </button>
 {showParams && (
 <div className="mt-6 pt-6 border-t border-default">
 <div className="grid gap-4 sm:grid-cols-2">
 {validationParams.map((param, idx) => (
 <div key={idx} className="rounded-lg bg-white/60 p-4">
 <h4 className="text-sm font-semibold text-primary mb-1">{param.name}</h4>
 <p className="text-xs text-secondary">{param.desc}</p>
 </div>
 ))}
 </div>
 <div className="mt-6 text-center">
 <Link to="/validate-idea" className="text-sm text-accent hover:text-accent-hover font-medium">
 Start validating your idea →
 </Link>
 </div>
 </div>
 )}
 </div>
 </div>
 </Card>
 </div>
 </section>

 {/* How It Works Section */}
 <section className="marketing-section bg-white">
 <div className="max-w-7xl mx-auto px-6">
 <SectionHeader
 title="How It Works"
 subtitle="Three simple steps from profile to actionable recommendations"
 center
 className="mb-12"
 />
 <div className="grid gap-8 md:grid-cols-3">
 {howItWorks.map((item, index) => (
 <div
 key={item.step}
 className="text-center marketing-fade-in"
 style={{ animationDelay: `${index * 0.15}s` }}
 >
 <div className="marketing-icon-circle mb-6 mx-auto bg-accent text-on-accent animate-scaleIn" style={{ animationDelay: `${index * 0.2}s` }}>
 <span className="text-xl font-bold font-mono">{item.step}</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3">
 {item.title}
 </UIHeading>
 <p className="text-sm text-secondary leading-relaxed">
 {item.detail}
 </p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* Your Deliverables Section */}
 <section className="marketing-section marketing-card-gray relative overflow-hidden">
 <Blob size="small" position="bottom-left" />
 <div className="max-w-7xl mx-auto px-6 relative z-10">
 <SectionHeader
 title="Your Deliverables"
 subtitle="Everything you need to move from idea to action"
 center
 className="mb-12"
 />
 <div className="grid gap-8 md:grid-cols-3">
 {deliverables.map((item, index) => (
 <Card
 key={item.title}
 className="marketing-feature-card bg-white marketing-fade-in relative overflow-hidden"
 style={{ animationDelay: `${index * 0.1}s` }}
 >
 <div className="absolute top-0 right-0 marketing-blob marketing-blob--small opacity-20" />
 <div className="relative z-10">
 <div className="marketing-icon-circle mb-4 mx-auto animate-scaleIn" style={{ animationDelay: `${index * 0.15}s` }}>
 <span className="text-3xl">{item.icon}</span>
 </div>
 <UIHeading level="h3" className="marketing-card-title text-primary mb-3 text-center">
 {item.title}
 </UIHeading>
 <p className="text-sm text-secondary leading-relaxed text-center">
 {item.description}
 </p>
 </div>
 </Card>
 ))}
 </div>
 </div>
 </section>

 {/* Bottom CTA Section */}
 <CTASection
 title="Ready to validate your idea?"
 description="Get AI-powered recommendations tailored to your profile, goals, and constraints. No credit card required."
 primaryCTA={{ to: "/validate-idea", label: "Validate Idea" }}
 secondaryCTA={{ to: "/advisor", label: "Discover Ideas" }}
 gradient
 className="my-20"
 />
 </MarketingLayout>
 );
}
