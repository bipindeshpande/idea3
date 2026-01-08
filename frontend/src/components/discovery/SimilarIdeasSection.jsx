import { Link } from "react-router-dom";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * Component for displaying similar ideas from user's validation history
 */
export default function SimilarIdeasSection({ smartRecommendations }) {
  if (!smartRecommendations || !smartRecommendations.similar_ideas || smartRecommendations.similar_ideas.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 rounded-3xl border border-default bg-surface p-6 shadow-soft">
      <UIHeading level="h2" className="text-primary mb-4">
        💡 Similar High-Scoring Ideas from Your History
      </UIHeading>
      <p className="mb-4 text-sm text-secondary">
        Based on your validation history, here are similar ideas you've validated highly in the past:
      </p>
      <div className="space-y-3">
        {smartRecommendations.similar_ideas.slice(0, 3).map((idea, idx) => {
          // Clean up the description - remove numbered prefixes like "1. Problem:" and extract meaningful text
          let description = idea.idea_explanation || "";
          
          // Remove common prefixes like "1. Problem:", "2. Solution:", etc.
          description = description.replace(/^\d+\.\s*(Problem|Solution|User|Differentiation|Monetization|Scope)[:\s]*/i, "");
          
          // If description starts with common validation format markers, clean them up
          description = description.replace(/^(Problem|Solution|Target User|Differentiation|Monetization|Scope)[:\s]*/i, "");
          
          // Extract first sentence or meaningful portion
          const firstSentence = description.split(/[.!?]/)[0].trim();
          if (firstSentence && firstSentence.length > 20) {
            description = firstSentence;
          } else if (description.length > 200) {
            description = description.substring(0, 200).trim() + "...";
          }
          
          return (
            <div
              key={idea.validation_id || idx}
              className="rounded-lg border border-default bg-surface p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-accent">
                  Score: {idea.score.toFixed(1)}/10
                </span>
                <Link
                  to={`/validate-result?id=${idea.validation_id}`}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  View Validation →
                </Link>
              </div>
              {description && (
                <p className="text-sm text-secondary leading-relaxed">{description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

