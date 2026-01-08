import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import Card from "../../components/ui/Card.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";

export default function HowAdvisorThinksPage() {
 const { isAuthenticated } = useAuth();

 // Redirect to login if not authenticated
 if (!isAuthenticated) {
 return <Navigate to="/login" replace />;
 }

 return (
 <PageContainer maxWidth="4xl">
 <Seo
 title="How the Advisor Thinks | Startup Idea Advisor"
 description="Understand how the advisor generates recommendations, what inputs matter most, and why some ideas are filtered out."
 path="/how-advisor-thinks"
 />

 {/* Header */}
 <PageHeader
 title="How the Advisor Thinks"
 description="Understand how recommendations are generated and what influences the advisor's decisions."
 className="mb-8"
 />

 {/* How recommendations are generated */}
 <div className="mb-8">
 <SectionHeader title="How recommendations are generated" className="mb-4" />
 <Card>
 <p className="text-primary text-primary leading-relaxed mb-4">
 The advisor analyzes your time commitment, budget, skills, and risk tolerance to filter ideas that won't work for your situation. 
 Each recommendation includes market research, financial projections, and execution steps tailored to your constraints.
 </p>
 <p className="text-primary text-primary leading-relaxed">
 The system uses AI to match your profile with validated startup ideas, ensuring that every recommendation is realistic given your current situation and resources.
 </p>
 </Card>
 </div>

 {/* What inputs matter most */}
 <div className="mb-8">
 <SectionHeader title="What inputs matter most" className="mb-4" />
 <Card>
 <p className="text-primary text-primary leading-relaxed mb-4">
 <strong className="text-primary">Time Commitment:</strong> This is the primary filter. Ideas requiring more time than you can commit are automatically excluded.
 </p>
 <p className="text-primary text-primary leading-relaxed mb-4">
 <strong className="text-primary">Budget:</strong> Your available budget determines which ideas are financially feasible. High-capital ideas won't appear if your budget is limited.
 </p>
 <p className="text-primary text-primary leading-relaxed mb-4">
 <strong className="text-primary">Skills:</strong> Your existing skills determine execution feasibility. Ideas requiring skills you don't have are deprioritized unless they can be learned quickly.
 </p>
 <p className="text-primary text-primary leading-relaxed">
 <strong className="text-primary">Risk Tolerance:</strong> This affects which opportunities are presented. Conservative profiles see lower-risk ideas, while high-risk tolerance shows more ambitious opportunities.
 </p>
 </Card>
 </div>

 {/* Why some ideas are filtered out */}
 <div className="mb-8">
 <SectionHeader title="Why some ideas are filtered out" className="mb-4" />
 <Card>
 <p className="text-primary text-primary leading-relaxed mb-4">
 Ideas are excluded if they:
 </p>
 <ul className="list-disc list-inside space-y-2 text-primary text-primary leading-relaxed mb-4 ml-4">
 <li>Require more time or budget than you have available</li>
 <li>Need skills you don't possess and can't quickly learn</li>
 <li>Involve risk levels outside your comfort zone</li>
 <li>Don't align with your stated industry interests</li>
 <li>Have unrealistic market conditions or competitive landscapes</li>
 </ul>
 <p className="text-primary text-primary leading-relaxed">
 The goal is to show only ideas you can actually execute given your current situation, resources, and constraints.
 </p>
 </Card>
 </div>

 {/* Frameworks Used */}
 <div className="mb-8">
 <SectionHeader title="Frameworks the Advisor Uses" className="mb-4" />
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
 </PageContainer>
 );
}

