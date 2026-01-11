/**
 * DiscoveryEmptyState - Standardized empty state component for discovery pages
 */
import { Link } from "react-router-dom";
import { DISCOVERY_TYPOGRAPHY, DISCOVERY_SPACING } from "./DiscoveryTheme.js";

export default function DiscoveryEmptyState({
  title,
  message,
  primaryAction,
  secondaryAction,
  debugInfo,
  className = ""
}) {
  return (
    <div className={`text-center ${className}`}>
      <h3 className={`${DISCOVERY_TYPOGRAPHY.h3} mb-1`}>{title}</h3>
      <p className={`${DISCOVERY_TYPOGRAPHY.bodySmall} max-w-md mx-auto`}>
        {message}
      </p>
      {debugInfo && process.env.NODE_ENV === 'development' && (
        <details className="mt-4 text-left">
          <summary className={`${DISCOVERY_TYPOGRAPHY.caption} cursor-pointer`}>Debug Info</summary>
          <pre className="mt-2 text-xs overflow-auto max-h-64 bg-app p-2 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
      {(primaryAction || secondaryAction) && (
        <div className={`mt-4 flex ${DISCOVERY_SPACING.elementGap} justify-center`}>
          {primaryAction && (
            primaryAction.to ? (
              <Link
                to={primaryAction.to}
                className="ui-btn ui-btn-primary focus-visible:outline-accent"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <button
                onClick={primaryAction.onClick}
                className="ui-btn ui-btn-primary focus-visible:outline-accent"
              >
                {primaryAction.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.to ? (
              <Link
                to={secondaryAction.to}
                className="ui-btn ui-btn-secondary focus-visible:outline-accent"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="ui-btn ui-btn-secondary focus-visible:outline-accent"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

