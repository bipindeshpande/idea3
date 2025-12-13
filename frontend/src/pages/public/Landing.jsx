import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import PageHeader from "../../components/layout/PageHeader.jsx";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

export default function LandingPage() {
  return (
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
          <Button>Explore ideas</Button>
        </Link>
      </div>

      {/* How it Works */}
      <div className="mt-10 md:mt-12">
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
          How it works
        </h2>
        <div className="grid gap-6 md:gap-8 md:grid-cols-4 mt-6 md:mt-8">
          {/* Explore */}
          <Card className="text-center">
            <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto">
              <span className="text-2xl">🔍</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore</h3>
            <p className="text-[15px] text-gray-700 leading-relaxed">
              See ideas tailored to your time, skills, and budget.
            </p>
          </Card>

          {/* Compare */}
          <Card className="text-center">
            <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto">
              <span className="text-2xl">⚖️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compare</h3>
            <p className="text-[15px] text-gray-700 leading-relaxed">
              View two or more ideas side by side to spot differences.
            </p>
          </Card>

          {/* Validate */}
          <Card className="text-center">
            <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Validate</h3>
            <p className="text-[15px] text-gray-700 leading-relaxed">
              Check risks, assumptions, and effort before committing to an idea.
            </p>
          </Card>

          {/* Revisit */}
          <Card className="text-center">
            <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Revisit</h3>
            <p className="text-[15px] text-gray-700 leading-relaxed">
              Come back anytime and update your ideas as your situation changes.
            </p>
          </Card>
        </div>
      </div>

      {/* Founder Network - Optional Context */}
      <Card className="mt-10 md:mt-12">
        <div className="flex items-start gap-4">
          <div className="icon-circle bg-[#f3f5ff] text-indigo-600">
            🤝
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">Founder Network (Optional)</h2>
            <p className="text-[15px] text-gray-700 leading-relaxed mb-4">
              See how other founders are exploring their ideas. Browse anonymized profiles and gain context from different perspectives.
            </p>
            <Link to="/founder-connect">
              <Button variant="secondary">Explore Founder Network</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Trust Badges - Simplified */}
      <div className="mt-10 md:mt-12 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 border border-gray-200">
          <span className="text-sm text-gray-600">✓</span>
          <span className="text-sm text-gray-600 font-medium">No credit card required</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 border border-gray-200">
          <span className="text-sm text-gray-600">✓</span>
          <span className="text-sm text-gray-600 font-medium">Free to start</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 border border-gray-200">
          <span className="text-sm text-gray-600">✓</span>
          <span className="text-sm text-gray-600 font-medium">Cancel anytime</span>
        </div>
      </div>
    </section>
  );
}
