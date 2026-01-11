import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";

/**
 * Validation Methodology - Educational resource page
 * Generic validation framework that applies to all startup ideas
 */
export default function ValidationMethodology() {
  return (
    <>
      <Seo
        title="How to Validate Startup Ideas | Startup Idea Advisor"
        description="Learn proven methodologies for validating your startup ideas before investing significant time and resources."
        path="/resources/validation-methodology"
      />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/dashboard" className="text-accent hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-primary mb-4">
          How to Validate Startup Ideas
        </h1>
        <p className="text-xl text-secondary mb-8">
          A proven framework for testing your assumptions before building
        </p>

        {/* Introduction */}
        <section className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Why Validation Matters
          </h2>
          <p className="text-primary mb-4">
            Most startups fail not because they couldn't build the product, but because they built something nobody wanted. 
            Validation helps you avoid this trap by testing your assumptions early and cheaply.
          </p>
          <div className="bg-accent/10 border-l-4 border-accent p-4 rounded">
            <p className="text-primary font-medium">
              💡 Key Principle: Validate demand before building supply
            </p>
          </div>
        </section>

        {/* The 4-Stage Framework */}
        <section className="mb-8">
          <h2 className="text-3xl font-semibold text-primary mb-6">
            The 4-Stage Validation Framework
          </h2>

          {/* Stage 1 */}
          <div className="bg-surface rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Problem Validation
                </h3>
                <p className="text-secondary text-sm mb-4">
                  Confirm that the problem you're solving is real, painful, and worth solving
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Key Questions:</h4>
                <ul className="list-disc list-inside space-y-1 text-primary">
                  <li>Do people actually experience this problem?</li>
                  <li>How are they currently solving it?</li>
                  <li>How much does the problem cost them (time/money)?</li>
                  <li>Would they pay to solve it?</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-2">Validation Methods:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Customer Interviews:</strong> Talk to 20-30 potential customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Surveys:</strong> Quantify problem severity across larger audience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Research:</strong> Study existing solutions and their limitations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-surface rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Solution Validation
                </h3>
                <p className="text-secondary text-sm mb-4">
                  Test if your proposed solution actually solves the problem
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Validation Methods:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Mockups/Prototypes:</strong> Show designs without building</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Landing Page:</strong> Test value proposition and collect emails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Concierge MVP:</strong> Deliver solution manually to first customers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-surface rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Willingness to Pay
                </h3>
                <p className="text-secondary text-sm mb-4">
                  Confirm that customers will actually pay for your solution
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Validation Methods:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Pre-sales:</strong> Sell before you build (with refund option)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Paid Pilots:</strong> Charge for early access or beta</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>Crowdfunding:</strong> Test market demand with campaign</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-surface rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center text-2xl font-bold text-accent">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-primary mb-2">
                  Market Validation
                </h3>
                <p className="text-secondary text-sm mb-4">
                  Prove you can acquire customers at scale profitably
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Key Metrics:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>CAC (Customer Acquisition Cost):</strong> Cost to acquire one customer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>LTV (Lifetime Value):</strong> Revenue per customer over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent">→</span>
                    <span className="text-primary"><strong>LTV:CAC Ratio:</strong> Should be at least 3:1</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Validation Checklist */}
        <section className="bg-accent/5 rounded-xl p-8 mb-8 border border-accent/20">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Quick Validation Checklist
          </h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">I've interviewed at least 20 potential customers about the problem</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">70%+ of interviewees confirmed they experience this problem</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">I've shown a prototype/mockup to potential customers</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">At least 10 people said they'd pay for this solution</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">I've collected at least 3 paid commitments or pre-orders</span>
            </label>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="mt-1" />
              <span className="text-primary">I know how to reach 1000+ more customers like these</span>
            </label>
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="bg-surface rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Common Validation Mistakes
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-primary mb-1">❌ Talking only to friends and family</h4>
              <p className="text-secondary text-sm">They'll be too nice and won't give honest feedback</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-primary mb-1">❌ Asking "Would you use this?"</h4>
              <p className="text-secondary text-sm">People lie. Ask for commitment (pre-order, email, pilot customer)</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-primary mb-1">❌ Building first, validating later</h4>
              <p className="text-secondary text-sm">Validate demand before investing months in development</p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-primary mb-1">❌ Ignoring negative feedback</h4>
              <p className="text-secondary text-sm">Critical feedback is more valuable than polite encouragement</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Ready to Validate Your Idea?
          </h2>
          <p className="text-secondary mb-6">
            Use our AI-powered validation tool to get personalized validation questions for your specific idea.
          </p>
          <Link
            to="/validate"
            className="ui-btn ui-btn-primary inline-block"
          >
            Start Validation →
          </Link>
        </section>
      </div>
    </>
  );
}

