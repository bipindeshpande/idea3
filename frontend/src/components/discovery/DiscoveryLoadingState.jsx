/**
 * DiscoveryLoadingState - Standardized loading state component for discovery pages
 */
import DiscoveryCard from "./DiscoveryCard.jsx";
import { DISCOVERY_TYPOGRAPHY } from "./DiscoveryTheme.js";

export default function DiscoveryLoadingState({
  title = "Loading...",
  message = "Please wait while we load your data.",
  size = "md",
  className = ""
}) {
  const spinnerSizes = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  return (
    <DiscoveryCard className={className}>
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className={`${spinnerSizes[size]} animate-spin rounded-full border-default border-t-brand-600`}></div>
        </div>
        <h2 className={DISCOVERY_TYPOGRAPHY.h3}>{title}</h2>
        <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.subtitle}`}>{message}</p>
      </div>
    </DiscoveryCard>
  );
}

