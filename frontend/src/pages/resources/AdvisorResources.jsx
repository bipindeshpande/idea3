import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import UIButton from "../../components/ui/ui-button.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

export default function AdvisorResourcesPage() {
 const { isAuthenticated } = useAuth();

 // Redirect to public resources if not logged in
 if (!isAuthenticated) {
 return <Navigate to="/resources/templates" replace />;
 }

 return (
 <PageContainer maxWidth="4xl">
 <Seo
 title="Advisor Resources | Startup Idea Advisor"
 description="Practical resources to help you understand and use your startup recommendations effectively."
 path="/advisor-resources"
 />

 {/* Header */}
 <PageHeader
 title="Advisor Resources"
 description="Practical guidance to help you understand and act on your recommendations."
 className="mb-8"
 />

 {/* 1. How the Advisor Thinks */}
 <div className="mb-8">
 <SectionHeader title="How the Advisor Thinks" className="mb-4" />
 <div className="space-y-4">
 <Card>
 <SectionHeader title="How recommendations are generated" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 The advisor analyzes your time commitment, budget, skills, and risk tolerance to filter ideas that won't work for your situation. 
 Each recommendation includes market research, financial projections, and execution steps tailored to your constraints.
 </p>
 </Card>

 <Card>
 <SectionHeader title="What inputs matter most" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Your time commitment and budget are the primary filters. Skills determine execution feasibility. 
 Risk tolerance affects which opportunities are presented. Industry interest narrows the focus to areas you care about.
 </p>
 </Card>

 <Card>
 <SectionHeader title="Why some ideas are filtered out" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Ideas are excluded if they require more time or budget than you have, need skills you don't possess, 
 or involve risk levels outside your comfort zone. The goal is to show only ideas you can actually execute.
 </p>
 </Card>
 </div>
 </div>

 {/* 2. Frameworks You're Using */}
 <div className="mb-8">
 <SectionHeader title="Frameworks You're Using" className="mb-4" />
 <div className="space-y-4">
 <Card>
 <SectionHeader title="Risk vs reward framing" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Each idea is evaluated for both potential upside and downside risk. High-risk ideas require more validation 
 before commitment. Low-risk ideas can move faster but may have lower potential returns.
 </p>
 </Card>

 <Card>
 <SectionHeader title="Time-to-revenue logic" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Ideas are prioritized by how quickly they can generate revenue given your time commitment. 
 Part-time constraints favor ideas with faster paths to first dollar, while full-time commitments 
 can pursue longer-term opportunities.
 </p>
 </Card>

 <Card>
 <SectionHeader title="Skill leverage model" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Ideas that use your existing skills are prioritized over those requiring significant learning. 
 This reduces execution risk and time-to-market. Skills you can learn quickly are considered, 
 but ideas requiring years of expertise are deprioritized.
 </p>
 </Card>

 <Card>
 <SectionHeader title="Validation-before-build mindset" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 Every recommendation includes validation steps. The advisor assumes you'll test assumptions before 
 investing significant time or money. Ideas that can't be validated cheaply are flagged as higher risk.
 </p>
 </Card>
 </div>
 </div>

 {/* 3. How to Use Outputs */}
 <div className="mb-8">
 <SectionHeader title="How to Use Outputs" className="mb-4" />
 <div className="space-y-4">
 <Card>
 <SectionHeader title="How to read a Discovery result" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-3">
 Each idea includes: why it fits you (based on your inputs), financial snapshot (revenue potential and costs), 
 execution path (step-by-step), risks (what could go wrong), and validation questions (how to test it).
 </p>
 <p className="text-primary text-primary leading-relaxed">
 Start with "Why this idea fits you" to understand the match. Review the financial snapshot to assess viability. 
 Use the execution path as a roadmap, but adapt it to your situation.
 </p>
 </Card>

 <Card>
 <SectionHeader title="What to do if you disagree with a recommendation" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed">
 If an idea doesn't feel right, check if your inputs accurately reflect your situation. 
 Consider running validation to test the idea before dismissing it. You can also rerun discovery 
 with updated constraints or preferences to see different options.
 </p>
 </Card>

 <Card>
 <SectionHeader title="When to rerun vs when to validate" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-3">
 <strong className="text-primary">Rerun discovery</strong> when your constraints change 
 (more/less time, different budget, new skills) or you want to explore different industries or business models.
 </p>
 <p className="text-primary text-primary leading-relaxed">
 <strong className="text-primary">Run validation</strong> when you have a specific idea 
 you want to test. Validation provides deeper analysis, risk assessment, and go/no-go recommendations for that idea.
 </p>
 </Card>
 </div>
 </div>

 {/* 4. Free Learning Assets */}
 <div className="mb-8">
 <SectionHeader title="Free Learning Assets" className="mb-4" />
 <div className="grid gap-4 md:grid-cols-2">
 <Card>
 <SectionHeader title="Validation Checklist" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-4">
 A step-by-step checklist to validate any startup idea before building. Covers problem validation, 
 solution fit, market size, and customer willingness to pay.
 </p>
 <Link
 to="/resources/templates"
 className="inline-block text-base font-medium text-accent hover:text-accent transition"
 >
 View validation frameworks →
 </Link>
 </Card>

 <Card>
 <SectionHeader title="Customer Interview Script" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-4">
 A structured script for conducting customer discovery interviews. Helps you ask the right questions 
 to validate problems and solutions without leading the conversation.
 </p>
 <Link
 to="/resources/templates"
 className="inline-block text-base font-medium text-accent hover:text-accent transition"
 >
 View interview templates →
 </Link>
 </Card>

 <Card>
 <SectionHeader title="MVP Scoping Guide" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-4">
 How to define the minimum viable product for your idea. Focuses on identifying the smallest version 
 that tests your core assumption.
 </p>
 <Link
 to="/resources/templates"
 className="inline-block text-base font-medium text-accent hover:text-accent transition"
 >
 View MVP frameworks →
 </Link>
 </Card>

 <Card>
 <SectionHeader title="Experiment Templates" className="mb-2" />
 <p className="text-primary text-primary leading-relaxed mb-4">
 Ready-to-use templates for running low-cost experiments to test assumptions. Includes landing page tests, 
 pricing experiments, and demand validation methods.
 </p>
 <Link
 to="/resources/templates"
 className="inline-block text-base font-medium text-accent hover:text-accent transition"
 >
 View experiment templates →
 </Link>
 </Card>
 </div>
 </div>

 {/* Back to Dashboard */}
 <div className="mt-8 pt-6 border-t border-default">
 <UIButton as={Link} to="/dashboard" variant="secondary">
 ← Back to Dashboard
 </UIButton>
 </div>
 </PageContainer>
 );
}

