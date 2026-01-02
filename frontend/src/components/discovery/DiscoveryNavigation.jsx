/**
 * DiscoveryNavigation - Standardized navigation component for discovery pages
 */
import { Link, useNavigate } from "react-router-dom";
import { DISCOVERY_SPACING } from "./DiscoveryTheme.js";

export default function DiscoveryNavigation({
  backPath,
  backLabel = "Back",
  backState,
  rightContent,
  className = ""
}) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className={`flex items-center ${DISCOVERY_SPACING.elementGap} text-sm`}>
        {backPath && (
          <button
            onClick={() => navigate(backPath, { state: backState })}
            className="inline-flex items-center gap-2 text-primary hover:text-accent-hover transition-colors"
          >
            <span aria-hidden="true">←</span> {backLabel}
          </button>
        )}
      </div>
      {rightContent && (
        <div>
          {rightContent}
        </div>
      )}
    </div>
  );
}

