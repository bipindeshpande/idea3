import ReactMarkdown from "react-markdown";

/**
 * Why Fit Section Component
 */
export default function WhyFitSection({ fitNarrativeMarkdown, isEnriching }) {
  if (!fitNarrativeMarkdown) {
    return <p className="text-sm text-primary text-primary italic">No content available yet.</p>;
  }

  return (
    <div className="mt-6 text-primary">
      <style>{`
        .fit-narrative-content ul {
          list-style-type: disc;
          margin-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
          padding-left: 0;
        }
        .fit-narrative-content ul ul {
          list-style-type: circle;
          margin-left: 2rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .fit-narrative-content ul ul ul {
          list-style-type: square;
          margin-left: 2rem;
        }
        .fit-narrative-content ol {
          list-style-type: decimal;
          margin-left: 1.5rem;
          margin-top: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .fit-narrative-content ol ol {
          list-style-type: lower-alpha;
          margin-left: 2rem;
        }
        .fit-narrative-content li {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          line-height: 1.7;
          padding-left: 0.25rem;
        }
        .fit-narrative-content li > p {
          margin: 0;
          display: inline;
        }
        .fit-narrative-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
        }
        .fit-narrative-content strong {
          font-weight: 600;
          color: #1e293b;
        }
      `}</style>
      <div className="fit-narrative-content">
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => (
              <p className="leading-relaxed mb-4" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol {...props} />
            ),
            li: ({ node, children, ...props }) => (
              <li className="leading-relaxed" {...props}>
                {children}
              </li>
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-primary" {...props} />
            ),
            em: ({ node, ...props }) => (
              <em className="italic text-secondary" {...props} />
            ),
          }}
        >
          {fitNarrativeMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
