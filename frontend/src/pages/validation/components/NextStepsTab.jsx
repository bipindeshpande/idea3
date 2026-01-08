import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { mapValidationToIntake, getExperienceSummaryFromValidation } from "../../../utils/mappers/validationToIntakeMapper.js";

export default function NextStepsTab({
  overallScore,
  isFree,
  isStarter,
  subscription,
  nextSteps,
  validation,
  currentValidation,
  scores,
  categoryAnswers,
  ideaExplanation,
  setInputs,
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* What's Next Section - Score-based recommendations */}
      <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl">📋</div>
          What's Next?
        </h2>
        {overallScore >= 7 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <h3 className="mb-2 text-lg font-semibold text-primary">🎉 Strong Potential Detected!</h3>
              <p className="mb-3 text-secondary leading-relaxed">
                Your idea shows strong potential with a score of {overallScore.toFixed(1)}/10. Here's your recommended path forward:
              </p>
              <ul className="ml-4 list-disc space-y-2 text-secondary leading-relaxed">
                <li>Create an MVP roadmap - Break down your idea into minimum viable features</li>
                <li>Validate with real customers - Conduct user interviews and gather feedback</li>
                <li>Build a landing page - Test demand before full development</li>
                <li>Consider funding options - Prepare pitch deck if seeking investment</li>
                <li>Set up legal structure - Choose business entity (LLC, Corp, etc.)</li>
              </ul>
            </div>
          </div>
        ) : overallScore >= 5 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <h3 className="mb-2 text-lg font-semibold text-primary">⚡ Good Potential, Needs Work</h3>
              <p className="mb-3 text-secondary leading-relaxed">
                Your idea has potential with a score of {overallScore.toFixed(1)}/10, but there are areas to strengthen:
              </p>
              <ul className="ml-4 list-disc space-y-2 text-secondary leading-relaxed">
                <li>Address weak areas - Focus on parameters scoring below 6</li>
                <li>Refine your value proposition - Make it clearer and more compelling</li>
                <li>Conduct market research - Validate assumptions with real data</li>
                <li>Improve problem-solution fit - Ensure you're solving a real pain point</li>
                <li>Re-validate after changes - Use our re-validation feature to track improvements</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <h3 className="mb-2 text-lg font-semibold text-primary">🔍 Consider Pivoting or Addressing Key Issues</h3>
              <p className="mb-3 text-secondary leading-relaxed">
                Your idea scored {overallScore.toFixed(1)}/10. Consider these actions:
              </p>
              <ul className="ml-4 list-disc space-y-2 text-secondary leading-relaxed">
                <li>Identify critical gaps - Review parameters scoring below 5</li>
                <li>Pivot or refine - Consider adjusting your idea based on feedback</li>
                <li>Address fundamental issues - Market fit, problem clarity, or business model</li>
                <li>Research competitors - Understand why similar ideas succeeded or failed</li>
                <li>Re-validate after major changes - Test improvements systematically</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Progress-Based Upgrade Prompts */}
      {(isFree || isStarter) && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl">🚀</div>
            Unlock More Features
          </h2>
          {isFree && (
            <div className="space-y-3">
              <p className="text-secondary leading-relaxed">
                You've used <strong>{subscription?.validations_used || 0} of 2</strong> free validations.
              </p>
              <p className="text-sm text-secondary mb-4">
                Upgrade to <strong>Starter ($9/month)</strong> to get 20 validations/month and compare your ideas side-by-side.
              </p>
              <Link
                to="/pricing"
                className="inline-block ui-btn ui-btn-primary focus-visible:outline-accent"
              >
                View Plans →
              </Link>
            </div>
          )}
          {isStarter && (
            <div className="space-y-3">
              <p className="text-secondary leading-relaxed">
                You've used <strong>{subscription?.validations_used || 0} of 20</strong> validations this month.
              </p>
              <p className="text-sm text-secondary mb-4">
                Upgrade to <strong>Pro ($29/month)</strong> for unlimited validations, advanced analytics, and priority support.
              </p>
              <Link
                to="/pricing"
                className="inline-block ui-btn ui-btn-primary focus-visible:outline-accent"
              >
                Upgrade to Pro →
              </Link>
            </div>
          )}
        </div>
      )}

      {nextSteps && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl">🚀</div>
              Your Next Steps
            </h2>
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-accent">Start Here</span>
          </div>
          <p className="mb-6 text-sm text-secondary">
            Follow these specific, actionable steps to move your idea forward. Each step includes resources and timelines.
          </p>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-outside space-y-4 text-secondary mb-4 ml-6" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="leading-relaxed text-base text-secondary" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-primary" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-secondary leading-relaxed mb-2" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-accent hover:text-accent-hover underline" target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {nextSteps}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Additional Actions */}
      <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">Additional Actions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={() => {
              const mappedFields = mapValidationToIntake(categoryAnswers);
              const experienceSummary = getExperienceSummaryFromValidation(categoryAnswers, ideaExplanation);
              setInputs({
                ...mappedFields,
                experience_summary: experienceSummary,
              });
              navigate("/advisor#intake-form");
            }}
            className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center transition hover:shadow-md"
          >
            <div className="mb-2 w-12 h-12 rounded-full bg-surface flex items-center justify-center text-2xl mx-auto">💡</div>
            <h3 className="mb-2 text-lg font-semibold text-primary">Discover Related Ideas</h3>
            <p className="text-sm text-secondary">
              Get personalized startup ideas based on your profile and interests
            </p>
          </button>
          <button
            onClick={() => {
              const revalidateData = {
                previousValidationId: validation?.id || currentValidation?.id,
                previousScore: overallScore,
                previousScores: scores,
                categoryAnswers: categoryAnswers,
                ideaExplanation: ideaExplanation,
                timestamp: new Date().toISOString(),
              };
              localStorage.setItem("revalidate_data", JSON.stringify(revalidateData));
              navigate("/validate-idea?revalidate=true");
            }}
            className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center transition hover:shadow-md"
          >
            <div className="mb-2 w-12 h-12 rounded-full bg-surface flex items-center justify-center text-2xl mx-auto">🔄</div>
            <h3 className="mb-2 text-lg font-semibold text-primary">Improve This Idea</h3>
            <p className="text-sm text-secondary">
              Update your idea based on feedback and re-validate to see improvements
            </p>
          </button>
        </div>
      </div>

      {/* Benchmarking Section */}
      <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-xl">📊</div>
          How Your Idea Compares
        </h2>
        <div className="space-y-4">
          {overallScore >= 8 ? (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <p className="text-secondary leading-relaxed">
                <strong>Top 15%</strong> - Your idea scores higher than 85% of validated ideas. This indicates exceptional potential.
              </p>
            </div>
          ) : overallScore >= 7 ? (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <p className="text-secondary leading-relaxed">
                <strong>Top 30%</strong> - Your idea scores higher than 70% of validated ideas. Strong potential with room for improvement.
              </p>
            </div>
          ) : overallScore >= 6 ? (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <p className="text-secondary leading-relaxed">
                <strong>Above Average</strong> - Your idea scores higher than 50% of validated ideas. Good foundation with clear improvement areas.
              </p>
            </div>
          ) : overallScore >= 5 ? (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <p className="text-secondary leading-relaxed">
                <strong>Average</strong> - Your idea is in the middle range. Average score for validated ideas is 5.5/10. Focus on strengthening weak areas.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
              <p className="text-secondary leading-relaxed">
                <strong>Below Average</strong> - Your idea scores below 50% of validated ideas. Consider significant refinements or pivoting.
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-secondary">
            * Comparison based on anonymized aggregated data from all validated ideas on our platform.
          </p>
        </div>
      </div>
    </div>
  );
}

