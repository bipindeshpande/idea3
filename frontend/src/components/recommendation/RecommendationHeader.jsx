import DiscoveryBadge from "../discovery/DiscoveryBadge.jsx";
import IdeaAttributes from "../discovery/IdeaAttributes.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "../discovery/DiscoveryTheme.js";

/**
 * Recommendation Header Component
 */
export default function RecommendationHeader({
  activeIdea,
  heroStatement,
  heroChips,
}) {
  // Safety check: Don't render if activeIdea is missing
  if (!activeIdea) {
    return null;
  }
  
  // Ensure heroChips is always an array (never null/undefined)
  const safeHeroChips = Array.isArray(heroChips) ? heroChips : [];
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-default">
        <DiscoveryBadge variant="muted" size="sm">
          Idea #{activeIdea.index}
        </DiscoveryBadge>
      </div>
      <h1 className={`${DISCOVERY_TYPOGRAPHY.h1} mb-3`}>{activeIdea.title}</h1>
      <p className={`max-w-3xl ${DISCOVERY_TYPOGRAPHY.body}`}>{heroStatement}</p>

      {/* Idea Attributes */}
      <div className="mt-4">
        <IdeaAttributes idea={activeIdea} heroChips={safeHeroChips} />
      </div>
    </div>
  );
}

