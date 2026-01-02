/**
 * DiscoveryHeader - Standardized header component for discovery pages
 * Ensures consistent header styling across all discovery pages
 */
import { DISCOVERY_TYPOGRAPHY } from "./DiscoveryTheme.js";

export default function DiscoveryHeader({
  step,
  totalSteps,
  title,
  description,
  className = "",
  children
}) {
  return (
    <div className={`mb-6 ${className}`}>
      {step !== undefined && totalSteps && (
        <p className={DISCOVERY_TYPOGRAPHY.stepIndicator}>
          Step {step} of {totalSteps}
        </p>
      )}
      {title && (
        <h1 className={`mt-2 ${DISCOVERY_TYPOGRAPHY.h1}`}>
          {title}
        </h1>
      )}
      {description && (
        <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.subtitle}`}>
          {description}
        </p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

