import Seo from "../../components/common/Seo.jsx";
import WhatsNew from "../../components/dashboard/WhatsNew.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import SectionHeader from "../../components/layout/SectionHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";

export default function AboutPage() {
  return (
    <PageContainer>
      <Seo
        title="About | Startup Idea Advisor"
        description="Learn why we built Startup Idea Advisor and how our AI advisor empowers founders to validate ideas faster."
        path="/about"
      />
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="relative">
            <div className="absolute -top-10 -left-10 w-[260px] h-[260px] rounded-full bg-indigo-300 opacity-[0.09] blur-2xl pointer-events-none"></div>
            <div className="relative z-10">
            <PageHeader 
              title="About"
              description="We built Startup Idea Advisor after watching countless professionals struggle to translate their strengths into viable ventures. Our mission is to combine founder empathy with AI-assisted research so you can explore opportunities confidently and efficiently."
            />
            {/* Founder Story Section */}
            <Card className="mt-10 md:mt-12">
              <div className="mb-6 flex items-center gap-4">
                <div className="icon-circle bg-[#f3f5ff] text-indigo-600 text-2xl">
                  👨‍💼
                </div>
                <div>
                  <SectionHeader title="Built by Entrepreneurs, for Entrepreneurs" />
                  <p className="mt-1 text-sm text-gray-600">Our founder's story</p>
                </div>
              </div>
              
              <div className="space-y-4 text-[15px] text-gray-700 leading-relaxed">
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
            </Card>

            <div className="mt-6 md:mt-8 grid gap-6 md:gap-8 md:grid-cols-2">
              <Card>
                <SectionHeader title="Why we exist" />
                <p className="mt-2 text-[15px] text-gray-700 leading-relaxed">
                  Traditional ideation services are expensive, slow, and rarely personalized. By orchestrating multiple
                  specialist agents, we give founders advisor-grade analysis on demand.
                </p>
              </Card>
              <Card>
                <SectionHeader title="What we believe" />
                <p className="mt-2 text-[15px] text-gray-700 leading-relaxed">
                  The best ideas start with the founder. Understanding your goals, skills, and constraints is essential to
                  crafting opportunities that are aligned and executable.
                </p>
              </Card>
            </div>
            </div>
          </Card>
        </div>

        {/* What's New Sidebar */}
        <div className="lg:col-span-1">
          <WhatsNew />
        </div>
      </div>
    </PageContainer>
  );
}

