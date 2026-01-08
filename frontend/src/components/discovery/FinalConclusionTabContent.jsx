import ReactMarkdown from "react-markdown";
import UIHeading from "../ui/ui-heading.jsx";
import UIBadge from "../ui/ui-badge.jsx";

/**
 * Component for displaying the final conclusion tab content
 */
export default function FinalConclusionTabContent({ finalRecommendation, finalConclusion }) {
  return (
    <div className="rounded-3xl border-2 border-default bg-surface p-8 shadow-soft">
      {finalRecommendation && typeof finalRecommendation === 'object' && finalRecommendation.decision ? (
        // Premium structured Final Recommendation
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <UIHeading level="h2" className="text-primary">Final Recommendation</UIHeading>
            {/* Decision Badge */}
            {(() => {
              const decision = finalRecommendation.decision || 'validate_further';
              const badgeConfig = {
                pursue: { label: 'Pursue', variant: 'success' },
                pursue_with_caution: { label: 'Pursue with Caution', variant: 'warning' },
                validate_further: { label: 'Validate Further', variant: 'info' },
                consider_pivot: { label: 'Consider Pivot', variant: 'info' },
                do_not_pursue: { label: 'Do Not Pursue', variant: 'danger' }
              };
              const config = badgeConfig[decision] || badgeConfig.validate_further;
              return (
                <UIBadge variant={config.variant} className="px-4 py-2 text-sm font-semibold">
                  {config.label}
                </UIBadge>
              );
            })()}
          </div>
          
          {/* Rationale */}
          {finalRecommendation.rationale && Array.isArray(finalRecommendation.rationale) && finalRecommendation.rationale.length > 0 && (
            <div className="space-y-3">
              <UIHeading level="h3" className="text-primary">Strategic Rationale</UIHeading>
              <ul className="space-y-3">
                {finalRecommendation.rationale.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
                      {index + 1}
                    </span>
                    <p className="text-secondary leading-relaxed flex-1">
                      {item}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Recommended Path */}
          {finalRecommendation.recommended_path && (
            <div className="rounded-xl border-2 border-default bg-surface p-6">
              <UIHeading level="h3" className="text-primary mb-2">Recommended Path</UIHeading>
              <p className="text-secondary leading-relaxed text-lg">
                {finalRecommendation.recommended_path}
              </p>
            </div>
          )}
        </div>
      ) : finalConclusion ? (
        // Legacy markdown format
        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => (
                <UIHeading level="h2" className="text-primary mb-4" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <UIHeading level="h3" className="text-primary mb-3 mt-4" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-secondary leading-relaxed mb-3" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-outside space-y-2 text-secondary mb-4 ml-6" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-primary" {...props} />
              ),
            }}
          >
            {finalConclusion}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-secondary italic">
          Final recommendation is being generated. Please check back shortly.
        </p>
      )}
    </div>
  );
}

