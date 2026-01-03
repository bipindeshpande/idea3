import UICard from "../../../components/ui/ui-card.jsx";
import PageHeader from "../../../components/workflow/PageHeader.jsx";

/**
 * Hero section displayed on step 0 (before form starts)
 * Shows information about the validation process
 */
export default function ValidationHero({ onAutoFill }) {
  return (
    <div className="mb-8">
      <UICard variant="muted" className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <PageHeader
            title="Validate Your Startup Idea"
            subtitle="Get a comprehensive AI-powered analysis of your business idea across 10 key validation parameters. Understand market viability, risks, and opportunities before you build."
          />
          {process.env.NODE_ENV === "development" && (
            <button
              type="button"
              onClick={onAutoFill}
              className="ui-btn ui-btn-secondary focus-visible:outline-accent whitespace-nowrap flex-shrink-0"
            >
              🔧 Auto-Fill (Dev)
            </button>
          )}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary">Market Analysis</h3>
              <p className="text-xs text-secondary mt-1">
                Assess market size, competition, and demand for your idea.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary">Risk Assessment</h3>
              <p className="text-xs text-secondary mt-1">
                Identify potential challenges and how to mitigate them.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary">Viability Score</h3>
              <p className="text-xs text-secondary mt-1">
                Get an overall score and actionable recommendations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-on-accent flex items-center justify-center text-xs font-bold">
              4
            </div>
            <div>
              <h3 className="text-base font-semibold text-primary">Next Steps</h3>
              <p className="text-xs text-secondary mt-1">
                Receive a clear roadmap for validating and launching your idea.
              </p>
            </div>
          </div>
        </div>
      </UICard>
    </div>
  );
}

