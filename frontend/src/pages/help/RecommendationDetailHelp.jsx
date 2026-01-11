import { Link } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";

export default function RecommendationDetailHelp() {
  return (
    <>
      <Seo
        title="Recommendation Detail Help | Startup Idea Advisor"
        description="Learn how to understand and use the detailed recommendation information for your startup idea."
        path="/help/recommendation-detail"
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Understanding Your Recommendation
          </h1>
          <p className="text-lg text-secondary">
            A complete guide to exploring and acting on your personalized startup recommendation.
          </p>
        </div>

        {/* Overview */}
        <section className="bg-surface rounded-xl p-6 border border-divider">
          <h2 className="text-2xl font-semibold text-primary mb-4">📋 Overview</h2>
          <p className="text-primary mb-4">
            Each recommendation is a comprehensive analysis of a startup idea tailored to your profile, skills, and goals. 
            The information is organized into tabs for easy navigation.
          </p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <p className="text-primary"><strong>Overview:</strong> Why this idea fits you, financial projections, and immediate next steps</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <p className="text-primary"><strong>Validation & Risks:</strong> Questions to ask, risks to consider, and experiments to run</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <p className="text-primary"><strong>Execution:</strong> Step-by-step roadmap to launch your idea</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <p className="text-primary"><strong>Market Intel:</strong> Customer personas and market insights</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <p className="text-primary"><strong>Actions & Notes:</strong> Track tasks and capture your thoughts</p>
            </div>
          </div>
        </section>

        {/* Tab Details */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-primary">📑 Tab by Tab Guide</h2>

          {/* Overview Tab */}
          <div className="bg-surface rounded-xl p-6 border border-divider">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Overview Tab</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Why This Fits You</h4>
                <p className="text-sm text-secondary">
                  Explains how this idea aligns with your skills, experience, budget, and goals. 
                  This helps you understand why the AI recommended this specific opportunity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Financial Snapshot</h4>
                <p className="text-sm text-secondary">
                  Quick financial projections including startup costs, potential revenue, breakeven timeline, and profit margins. 
                  Use these estimates to assess financial viability.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Immediate Next Steps</h4>
                <p className="text-sm text-secondary">
                  Actionable steps you can take this week to validate and move forward with the idea. 
                  Start here if you're ready to explore this opportunity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Timeline & Effort</h4>
                <p className="text-sm text-secondary">
                  How long it will take to launch and how much weekly time commitment is required. 
                  Helps you plan if this fits your schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Validation & Risks Tab */}
          <div className="bg-surface rounded-xl p-6 border border-divider">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span>⚠️</span>
              <span>Validation & Risks Tab</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Validation Questions</h4>
                <p className="text-sm text-secondary">
                  Specific questions to ask potential customers before building. Includes what to listen for and how to act on responses. 
                  Use these in customer interviews or surveys.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Key Risks</h4>
                <p className="text-sm text-secondary">
                  Potential obstacles and how to mitigate them. Each risk includes severity level (High/Medium/Low) and suggested mitigation strategies.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Decision Checklist</h4>
                <p className="text-sm text-secondary">
                  Key criteria to evaluate before committing to this idea. Check off items as you validate them.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Immediate Experiments</h4>
                <p className="text-sm text-secondary">
                  Low-cost tests you can run this week to validate assumptions quickly. Learn fast without building the full product.
                </p>
              </div>
            </div>
          </div>

          {/* Execution Tab */}
          <div className="bg-surface rounded-xl p-6 border border-divider">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span>🚀</span>
              <span>Execution Tab</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Execution Roadmap</h4>
                <p className="text-sm text-secondary">
                  Phase-by-phase plan to launch your idea, from validation to growth. Each phase includes key milestones, 
                  estimated duration, and success metrics. Follow this roadmap to stay organized and focused.
                </p>
              </div>
            </div>
          </div>

          {/* Market Intel Tab */}
          <div className="bg-surface rounded-xl p-6 border border-divider">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span>📚</span>
              <span>Market Intel Tab</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Customer Persona</h4>
                <p className="text-sm text-secondary">
                  Detailed profile of your ideal customer including demographics, pain points, goals, and buying behavior. 
                  Use this to tailor your messaging and product features. Click "View Full Details" for complete analysis.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Market Opportunity</h4>
                <p className="text-sm text-secondary">
                  Market size, trends, competition, and growth potential. Understand the landscape before entering.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Additional Insights</h4>
                <p className="text-sm text-secondary">
                  Extra context, tips, and considerations specific to this market or industry.
                </p>
              </div>
            </div>
          </div>

          {/* Actions & Notes Tab */}
          <div className="bg-surface rounded-xl p-6 border border-divider">
            <h3 className="text-xl font-semibold text-primary mb-3 flex items-center gap-2">
              <span>📋</span>
              <span>Actions & Notes Tab</span>
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">Action Items</h4>
                <p className="text-sm text-secondary mb-2">
                  Create and track tasks specific to this idea. Actions are automatically saved and synced across devices.
                </p>
                <ul className="text-xs text-secondary space-y-1 ml-4">
                  <li>• Set status: Pending, In Progress, Completed, or Blocked</li>
                  <li>• Each idea has its own action list</li>
                  <li>• Actions persist when you switch between ideas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Notes</h4>
                <p className="text-sm text-secondary mb-2">
                  Capture thoughts, research findings, customer feedback, or any insights about this idea.
                </p>
                <ul className="text-xs text-secondary space-y-1 ml-4">
                  <li>• Notes are timestamped automatically</li>
                  <li>• Each note is tied to this specific idea only</li>
                  <li>• Great for tracking customer interview feedback</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-accent/5 rounded-xl p-6 border border-accent/20">
          <h2 className="text-2xl font-semibold text-primary mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center font-bold text-accent">
                1
              </div>
              <div>
                <h4 className="font-semibold text-primary">Validate Idea</h4>
                <p className="text-sm text-secondary">
                  Run this idea through our validation tool to get structured feedback and a validation score.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center font-bold text-accent">
                2
              </div>
              <div>
                <h4 className="font-semibold text-primary">Compare Ideas</h4>
                <p className="text-sm text-secondary">
                  View multiple recommendations side-by-side to decide which opportunity to pursue.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center font-bold text-accent">
                3
              </div>
              <div>
                <h4 className="font-semibold text-primary">Save for Later</h4>
                <p className="text-sm text-secondary">
                  Bookmark ideas you're interested in to easily find them later in your workspace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="bg-surface rounded-xl p-6 border border-divider">
          <h2 className="text-2xl font-semibold text-primary mb-4">💡 Pro Tips</h2>
          <div className="space-y-3 text-sm text-primary">
            <div className="flex items-start gap-2">
              <span className="text-accent">→</span>
              <p><strong>Start with validation questions:</strong> Don't build before talking to potential customers</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">→</span>
              <p><strong>Use Actions & Notes:</strong> Track your progress and insights as you explore the idea</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">→</span>
              <p><strong>Check risks early:</strong> Plan mitigation strategies before investing heavily</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">→</span>
              <p><strong>Read the customer persona carefully:</strong> Understanding your target customer is critical</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent">→</span>
              <p><strong>Explore multiple recommendations:</strong> Compare different opportunities before committing</p>
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="bg-surface rounded-xl p-6 border border-divider">
          <h2 className="text-2xl font-semibold text-primary mb-4">📚 Related Resources</h2>
          <div className="space-y-2">
            <Link to="/resources/validation-methodology" className="block text-accent hover:underline">
              → How to Validate Startup Ideas (Complete Framework)
            </Link>
            <Link to="/help/validate-idea" className="block text-accent hover:underline">
              → Using the Idea Validation Tool
            </Link>
            <Link to="/help/workspace" className="block text-accent hover:underline">
              → Managing Your Workspace
            </Link>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center py-4">
          <Link to="/dashboard" className="text-accent hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}

