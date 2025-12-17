import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import MarketingLayout from "../../layouts/MarketingLayout.jsx";

export default function LandingPage() {
 return (
 <MarketingLayout fullWidth={true}>
 <section className="max-w-screen-lg mx-auto px-4 md:px-6 py-6">
 <Seo
 title="Startup Idea Advisor | Explore and Reflect on Your Ideas"
 description="A thoughtful space to explore startup ideas, gain clarity, and revisit your thinking over time. Discover ideas, validate concepts, compare options, and view insights—all at your own pace."
 path="/"
 />

 {/* Hero Section */}
 <PageHeader
 title="Explore ideas with clarity and confidence"
 subtitle="Take time to explore startup ideas, learn from what you see, and return as your situation changes. This is a space to think clearly before you commit."
 />
 <div className="mb-8">
 <Link to="/dashboard">
 <UIButton variant="primary">Explore ideas</UIButton>
 </Link>
 </div>

 {/* How it Works */}
 <div className="mt-10 md:mt-12">
 <UIHeading level="h1" className="text-primary mb-2">
 How it works
 </UIHeading>
 <div className="grid gap-6 md:gap-8 md:grid-cols-4 mt-6 md:mt-8">
 {/* Explore */}
 <Card className="text-center">
 <div className="icon-circle bg-surface text-accent mb-4 mx-auto">
 <span className="text-2xl">🔍</span>
 </div>
 <UIHeading level="h3" className="text-primary mb-2">Explore</UIHeading>
 <p className="text-base text-primary leading-relaxed">
 See ideas tailored to your time, skills, and budget.
 </p>
 </Card>

 {/* Compare */}
 <Card className="text-center">
 <div className="icon-circle bg-surface text-accent mb-4 mx-auto">
 <span className="text-2xl">⚖️</span>
 </div>
 <UIHeading level="h3" className="text-primary mb-2">Compare</UIHeading>
 <p className="text-base text-primary leading-relaxed">
 View two or more ideas side by side to spot differences.
 </p>
 </Card>

 {/* Validate */}
 <Card className="text-center">
 <div className="icon-circle bg-surface text-accent mb-4 mx-auto">
 <span className="text-2xl">✓</span>
 </div>
 <UIHeading level="h3" className="text-primary mb-2">Validate</UIHeading>
 <p className="text-base text-primary leading-relaxed">
 Check risks, assumptions, and effort before committing to an idea.
 </p>
 </Card>

 {/* Revisit */}
 <Card className="text-center">
 <div className="icon-circle bg-surface text-accent mb-4 mx-auto">
 <span className="text-2xl">🔄</span>
 </div>
 <UIHeading level="h3" className="text-primary mb-2">Revisit</UIHeading>
 <p className="text-base text-primary leading-relaxed">
 Come back anytime and update your ideas as your situation changes.
 </p>
 </Card>
 </div>
 </div>

 {/* Founder Network - Optional Context */}
 <Card className="mt-10 md:mt-12">
 <div className="flex items-start gap-4">
 <div className="icon-circle bg-surface text-accent">
 🤝
 </div>
 <div className="flex-1">
 <UIHeading level="h2" className="text-primary flex items-center gap-2 mb-2">Founder Network (Optional)</UIHeading>
 <p className="text-base text-primary leading-relaxed mb-4">
 See how other founders are exploring their ideas. Browse anonymized profiles and gain context from different perspectives.
 </p>
 <Link to="/founder-connect">
 <UIButton variant="secondary">Explore Founder Network</UIButton>
 </Link>
 </div>
 </div>
 </Card>

 {/* Trust Badges - Simplified */}
 <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3">
 <div className="flex items-center gap-1.5 rounded-full bg-app px-3 py-1.5 border border-default">
 <span className="text-xs text-secondary">✓</span>
 <span className="text-xs text-secondary font-medium">No credit card required</span>
 </div>
 <div className="flex items-center gap-1.5 rounded-full bg-app px-3 py-1.5 border border-default">
 <span className="text-xs text-secondary">✓</span>
 <span className="text-xs text-secondary font-medium">Free to start</span>
 </div>
 <div className="flex items-center gap-1.5 rounded-full bg-app px-3 py-1.5 border border-default">
 <span className="text-xs text-secondary">✓</span>
 <span className="text-xs text-secondary font-medium">Cancel anytime</span>
 </div>
 </div>
 </section>
 </MarketingLayout>
 );
}
