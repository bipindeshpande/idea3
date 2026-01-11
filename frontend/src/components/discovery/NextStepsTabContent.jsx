import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import UIHeading from "../ui/ui-heading.jsx";
import UIButton from "../ui/ui-button.jsx";

/**
 * Component for displaying the next steps tab content
 */
export default function NextStepsTabContent({
  unifiedNextSteps,
  topIdeas,
  allIdeas,
  runId,
  currentRunId,
  effectiveReports,
  cachedRun,
  effectiveInputs
}) {
  const navigate = useNavigate();

  return (
    <div className="mb-4 rounded-3xl border-2 border-default to-white p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-3">
        <UIHeading level="h2" className="text-primary">🚀 Your Next Steps</UIHeading>
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">Start Here</span>
      </div>
      <p className="mb-6 text-secondary">
        Follow these personalized, actionable steps to move your startup idea forward. Each step is tailored to your profile, constraints, and top recommendation.
      </p>
      
      {unifiedNextSteps ? (
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside space-y-3 text-primary mb-4 ml-6" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed text-base text-primary" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-primary leading-relaxed mb-3" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <UIHeading level="h2" className="text-primary mt-6 mb-3" {...props} />
              ),
            }}
          >
            {unifiedNextSteps}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-sm text-secondary">
          No next steps were found for your recommendations. 
          This usually happens when the AI did not generate enrichment data for this run.
        </p>
      )}
      
      {topIdeas.length > 0 && (
        <div className="mt-6 pt-6 border-t border-default">
          <p className="mb-3 text-sm text-secondary">
            Want deeper validation and a comprehensive roadmap? Validate your top idea for detailed analysis across 10 key parameters.
          </p>
          <UIButton
            variant="primary"
            size="sm"
            onClick={() => {
              navigate(`/dashboard/recommendations/${topIdeas[0].index}${runId || currentRunId ? `?id=${runId || currentRunId}` : ''}`, {
                state: {
                  idea: topIdeas[0],
                  allIdeas: allIdeas,
                  recommendations: effectiveReports,
                  run: cachedRun, // Pass full run object to prevent recomputation
                  runId: runId || currentRunId,
                  inputs: effectiveInputs
                }
              });
            }}
          >
            Validate "{topIdeas[0].title || 'Your Top Idea'}"
          </UIButton>
        </div>
      )}
    </div>
  );
}

