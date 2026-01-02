/**
 * DiscoveryErrorState - Standardized error state component for discovery pages
 */
import DiscoveryEmptyState from "./DiscoveryEmptyState.jsx";

export default function DiscoveryErrorState({
  error,
  primaryAction,
  secondaryAction,
  debugInfo
}) {
  return (
    <DiscoveryEmptyState
      title="Error Loading Report"
      message={error}
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
      variant="elevated"
      debugInfo={debugInfo}
    />
  );
}

