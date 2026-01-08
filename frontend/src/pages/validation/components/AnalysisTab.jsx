import ReactMarkdown from "react-markdown";
import { VALIDATION_PARAMETERS, FALLBACK_DETAIL } from "../constants.js";
import { getScoreMeta } from "../utils.js";

export default function AnalysisTab({ parameterLookup, recommendations }) {
  return (
    <div className="space-y-6">
      {/* Summary Recommendations - Primary Content */}
      {recommendations && (
        <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-4">Summary Recommendations</h2>
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => {
                  const text = node.children?.[0]?.value || "";
                  if (text && text.length > 50 && !text.includes("\n")) {
                    return <p className="text-secondary leading-relaxed mb-4" {...props} />;
                  }
                  return <p className="text-secondary leading-relaxed mb-4" {...props} />;
                },
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-outside space-y-2 text-secondary leading-relaxed mb-4 ml-6" style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }} {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-outside space-y-2 text-secondary leading-relaxed mb-4 ml-6" style={{ listStyleType: 'decimal', paddingLeft: '1.5rem' }} {...props} />
                ),
                li: ({ node, ...props }) => {
                  const hasNestedList = node.children?.some(child =>
                    child.type === 'element' && (child.tagName === 'ul' || child.tagName === 'ol')
                  );
                  return (
                    <li
                      className={`leading-relaxed text-secondary ${hasNestedList ? 'mb-2' : 'mb-3'}`}
                      style={{ display: 'list-item', listStylePosition: 'outside' }}
                      {...props}
                    />
                  );
                },
                strong: ({ node, ...props }) => (
                  <strong className="font-semibold text-primary" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mt-6 mb-4" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mt-5 mb-3" {...props} />
                ),
              }}
            >
              {recommendations}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Parameter-by-Parameter Detailed Analysis - Secondary Content */}
      <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
        <h2 className="text-lg font-semibold text-primary flex items-center gap-2 mb-6">Parameter-by-Parameter Detailed Analysis</h2>
        <p className="text-sm text-secondary mb-6">Deep dive into each validation parameter with specific insights and analysis.</p>
        <div className="space-y-6">
          {VALIDATION_PARAMETERS.map((parameter) => {
            const data = parameterLookup[parameter] || { score: 0, details: null };
            const details = data.details;
            if (!details || details === FALLBACK_DETAIL) return null;

            return (
              <div key={parameter} className="rounded-lg border border-default bg-surface-muted p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-primary">{parameter}</h3>
                  <div className={`rounded-full px-3 py-1 text-xs font-medium ${getScoreMeta(data.score).badge}`}>
                    {data.score.toFixed(1)} / 10
                  </div>
                </div>
                <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                  {details}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

