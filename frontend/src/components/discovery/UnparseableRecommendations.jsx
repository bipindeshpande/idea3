import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import DiscoveryCard from "./DiscoveryCard.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "./DiscoveryTheme.js";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * Component for displaying unparseable recommendations with raw content
 */
export default function UnparseableRecommendations({ markdown }) {
  if (!markdown || markdown.length === 0) {
    return (
      <DiscoveryCard>
        <div className="text-center">
          <h3 className={`${DISCOVERY_TYPOGRAPHY.h3} mb-1`}>No Recommendations Available</h3>
          <p className={`${DISCOVERY_TYPOGRAPHY.bodySmall} max-w-md mx-auto`}>
            The recommendation report is empty or could not be loaded.
          </p>
          <div className={`mt-4 flex ${DISCOVERY_SPACING.elementGap} justify-center`}>
            <Link
              to="/advisor"
              className="ui-btn ui-btn-primary focus-visible:outline-accent"
            >
              Generate Recommendations
            </Link>
          </div>
        </div>
      </DiscoveryCard>
    );
  }

  return (
    <DiscoveryCard variant="elevated">
      <h2 className={DISCOVERY_TYPOGRAPHY.h3}>Unable to Parse Recommendations</h2>
      <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.bodySmall} mb-4`}>
        The recommendations couldn't be parsed into individual ideas. This might happen if the format is unexpected or the report is very brief.
      </p>
      <div className={DISCOVERY_SPACING.elementGap.replace('gap-', 'space-y-')}>
        <Link
          to="/advisor"
          className="ui-btn ui-btn-primary focus-visible:outline-accent"
        >
          Generate New Recommendations
        </Link>
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2">Raw Recommendations Content:</p>
          <div className="prose prose-slate max-w-none bg-surface p-4 rounded-lg border border-default text-xs max-h-96 overflow-y-auto">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="text-primary leading-relaxed mb-2" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-outside space-y-1 text-primary mb-2 ml-4" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-outside space-y-1 text-primary mb-2 ml-4" {...props} />
                ),
                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-primary" {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <UIHeading level="h1" className="text-primary mb-2 mt-3" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <UIHeading level="h2" className="text-primary mb-2 mt-3" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-semibold text-primary mb-1 mt-2" {...props} />
                ),
                h4: ({ node, ...props }) => (
                  <h4 className="text-sm font-semibold text-primary mb-1 mt-2" {...props} />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </DiscoveryCard>
  );
}

