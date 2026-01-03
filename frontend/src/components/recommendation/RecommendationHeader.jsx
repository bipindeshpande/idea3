import DiscoveryCard from "../discovery/DiscoveryCard.jsx";
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
  actions,
  notes,
}) {
  return (
    <DiscoveryCard padding="lg">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-default">
        <DiscoveryBadge variant="muted" size="sm">
          Idea #{activeIdea.index}
        </DiscoveryBadge>
        {(actions.length > 0 || notes.length > 0) && (
          <div className={`flex items-center ${DISCOVERY_SPACING.elementGapSmall}`}>
            {actions.length > 0 && (
              <DiscoveryBadge
                variant="default"
                size="sm"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                title={`${actions.length} action item${actions.length !== 1 ? 's' : ''}`}
              >
                {actions.length} Task{actions.length !== 1 ? 's' : ''}
              </DiscoveryBadge>
            )}
            {notes.length > 0 && (
              <DiscoveryBadge
                variant="default"
                size="sm"
                icon={
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                }
                title={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
              >
                {notes.length} Note{notes.length !== 1 ? 's' : ''}
              </DiscoveryBadge>
            )}
          </div>
        )}
      </div>
      <h1 className={`${DISCOVERY_TYPOGRAPHY.h1} mb-3`}>{activeIdea.title}</h1>
      <p className={`max-w-3xl ${DISCOVERY_TYPOGRAPHY.body}`}>{heroStatement}</p>

      {/* Idea Attributes */}
      <div className="mt-4">
        <IdeaAttributes idea={activeIdea} heroChips={heroChips} />
      </div>
    </DiscoveryCard>
  );
}

