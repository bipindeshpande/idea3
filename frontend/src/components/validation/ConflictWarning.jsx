import { useState } from "react";

/**
 * Component to display conflict warnings/errors with actionable suggestions
 */
export default function ConflictWarning({ conflicts, onDismiss }) {
  const [dismissedConflicts, setDismissedConflicts] = useState(new Set());

  const handleDismiss = (index) => {
    setDismissedConflicts(new Set([...dismissedConflicts, index]));
  };

  const visibleConflicts = conflicts.filter((_, index) => !dismissedConflicts.has(index));

  if (visibleConflicts.length === 0) {
    return null;
  }

  const errorConflicts = visibleConflicts.filter(c => c.severity === "error");
  const warningConflicts = visibleConflicts.filter(c => c.severity === "warning");

  return (
    <div className="space-y-3">
      {/* Error Conflicts - Block submission */}
      {errorConflicts.length > 0 && (
        <div className="rounded-xl border-2 border-accent/50 bg-accent/10 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-accent mb-2">⚠️ Conflicts Detected - Cannot Submit</h4>
              <div className="space-y-2">
                {errorConflicts.map((conflict, index) => (
                  <div key={index} className="bg-surface rounded-lg p-3 border border-accent/30">
                    <p className="text-sm text-primary mb-1">{conflict.message}</p>
                    {conflict.suggestion && (
                      <p className="text-xs text-secondary italic mt-1">
                        💡 {conflict.suggestion}
                      </p>
                    )}
                    <div className="text-xs text-secondary mt-2">
                      Affected fields: <span className="font-medium">{conflict.field}</span>
                      {conflict.relatedField && (
                        <> and <span className="font-medium">{conflict.relatedField}</span></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Conflicts - Allow submission but inform */}
      {warningConflicts.length > 0 && (
        <div className="rounded-xl border border-warning/50 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-warning flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-warning mb-2">⚠️ Warnings - Review Recommended</h4>
              <div className="space-y-2">
                {warningConflicts.map((conflict, index) => (
                  <div key={index} className="bg-surface rounded-lg p-3 border border-warning/30">
                    <p className="text-sm text-primary mb-1">{conflict.message}</p>
                    {conflict.suggestion && (
                      <p className="text-xs text-secondary italic mt-1">
                        💡 {conflict.suggestion}
                      </p>
                    )}
                    {onDismiss && (
                      <button
                        onClick={() => handleDismiss(conflicts.indexOf(conflict))}
                        className="text-xs text-secondary hover:text-primary mt-2 underline"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

