import DiscoveryCard from "./DiscoveryCard.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "./DiscoveryTheme.js";

/**
 * Component for displaying conflict adjustment messages
 */
export default function ConflictAdjustmentMessage({ conflictAdjustment }) {
  if (!conflictAdjustment || !conflictAdjustment.message) {
    return null;
  }

  return (
    <DiscoveryCard variant="info">
      <div className={`flex items-start ${DISCOVERY_SPACING.elementGap}`}>
        <div className="text-xl shrink-0">💡</div>
        <div className="flex-1">
          <p className={`${DISCOVERY_TYPOGRAPHY.body} text-accent`}>
            {conflictAdjustment.message}
          </p>
          {conflictAdjustment.optional_clarification && (
            <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.bodySmall} text-accent italic`}>
              {conflictAdjustment.optional_clarification}
            </p>
          )}
        </div>
      </div>
    </DiscoveryCard>
  );
}

