import React from "react";
import { useNavigate } from "react-router-dom";
import UIButton from "../ui/ui-button.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

/**
 * Dashboard Quick Actions Component
 * Displays quick action buttons for Discover and Validate
 */
export default function DashboardQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="ui-card2 ui-card2--muted" style={{ padding: "8px 12px" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <UIHeading level="h4" className={WORKSPACE_TYPOGRAPHY.h4}>
            Quick Actions
          </UIHeading>
          <p className={`mt-0.5 ${WORKSPACE_TYPOGRAPHY.caption} leading-tight`}>
            Start a new discovery or validation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UIButton
            variant="primary"
            size="sm"
            onClick={() => navigate("/advisor")}
            className="flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Discover
          </UIButton>
          <UIButton
            variant="secondary"
            size="sm"
            onClick={() => navigate("/validate-idea")}
            className="flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validate
          </UIButton>
        </div>
      </div>
    </div>
  );
}

