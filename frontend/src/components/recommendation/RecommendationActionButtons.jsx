import { useNavigate } from "react-router-dom";

/**
 * Action buttons for recommendation detail page
 */
export default function RecommendationActionButtons({
  activeIdea,
  inputs,
  reports,
  validateRecommendationIdea,
  validating,
  backPath,
  backState
}) {
  const navigate = useNavigate();

  if (!activeIdea) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={async () => {
          const result = await validateRecommendationIdea(
            activeIdea,
            inputs,
            reports?.profile_analysis
          );
          if (result.success && result.validation?.id) {
            navigate(`/validate-result?id=${result.validation.id}`);
          }
        }}
        disabled={validating || !activeIdea}
        className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {validating ? "Validating..." : "Validate Idea"}
      </button>
      <button
        onClick={() => navigate(backPath, { state: backState })}
        className="ui-btn ui-btn-secondary focus-visible:outline-accent"
      >
        Back to top ideas
      </button>
    </div>
  );
}

