/**
 * IdeaAttributes - Component to display idea attributes (timeline, validation score, chips, etc.)
 */
import DiscoveryBadge from "./DiscoveryBadge.jsx";
import { DISCOVERY_TYPOGRAPHY, DISCOVERY_SPACING } from "./DiscoveryTheme.js";

export default function IdeaAttributes({
  idea,
  heroChips = [],
  className = ""
}) {
  return (
    <div className={className}>
      {/* Timeline */}
      {idea.timeline && (
        <div className="mt-0">
          <span className={`${DISCOVERY_TYPOGRAPHY.label} mb-2 block`}>Timeline</span>
          <DiscoveryBadge variant="muted" size="md">
            {idea.timeline}
          </DiscoveryBadge>
        </div>
      )}

      {/* Validation Score */}
      {idea.validation_score && idea.validation_score.trim() && !isNaN(parseFloat(idea.validation_score)) && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className={DISCOVERY_TYPOGRAPHY.label}>Validation Score</span>
            <span className={DISCOVERY_TYPOGRAPHY.bodySmall}>
              {Math.min(10, Math.max(0, parseFloat(idea.validation_score))).toFixed(1)}/10
            </span>
          </div>
          <div className="h-[6px] rounded-[4px] bg-surface overflow-hidden">
            <div 
              className="h-full bg-accent rounded-[4px] transition-all"
              style={{ width: `${Math.min(100, Math.max(0, (parseFloat(idea.validation_score) / 10) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Hero Chips */}
      {heroChips.length > 0 && (
        <div className={`mt-6 flex flex-wrap ${DISCOVERY_SPACING.elementGapSmall}`}>
          {heroChips.map(({ label, value }) => (
            <DiscoveryBadge key={`${label}-${value}`} variant="default" size="md">
              {label}: {value}
            </DiscoveryBadge>
          ))}
        </div>
      )}

      {/* Target Market */}
      {idea.target_market && (
        <div className="mt-4">
          <span className={`${DISCOVERY_TYPOGRAPHY.label} mb-2 block`}>Target Market</span>
          <p className={DISCOVERY_TYPOGRAPHY.bodySmall}>{idea.target_market}</p>
        </div>
      )}

      {/* Revenue Model */}
      {idea.revenue_model && (
        <div className="mt-4">
          <span className={`${DISCOVERY_TYPOGRAPHY.label} mb-2 block`}>Revenue Model</span>
          <p className={DISCOVERY_TYPOGRAPHY.bodySmall}>{idea.revenue_model}</p>
        </div>
      )}
    </div>
  );
}

