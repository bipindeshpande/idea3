import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * LearnMore - Expandable section with link to detailed resource page
 * Used to reduce clutter while still providing access to educational content
 */
export default function LearnMore({ 
  title = "Learn More", 
  summary, 
  linkTo, 
  linkText = "Read full guide →",
  children 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-accent/5 rounded-lg border border-accent/20 overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <span className="font-medium text-primary text-sm">{title}</span>
        </div>
        <span className="text-accent text-sm">
          {isExpanded ? "▲ Collapse" : "▼ Expand"}
        </span>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-accent/20 bg-surface/50">
          {summary && (
            <p className="text-sm text-secondary mb-3">{summary}</p>
          )}
          
          {children && (
            <div className="text-sm text-primary mb-3">
              {children}
            </div>
          )}

          {linkTo && (
            <Link
              to={linkTo}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {linkText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

