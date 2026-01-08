import ReactMarkdown from "react-markdown";

/**
 * Immediate Next Steps Section Component
 */
export default function ImmediateNextStepsSection({ discoveryNextSteps, immediateNextSteps, content, isEnriching }) {
  if (discoveryNextSteps) {
    return (
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown
          components={{
            ul: ({ node, ...props }) => (
              <ul className="space-y-2 text-sm text-primary text-primary list-disc list-inside" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
          }}
        >
          {discoveryNextSteps}
        </ReactMarkdown>
      </div>
    );
  }

  if (immediateNextSteps && immediateNextSteps.length > 0) {
    return (
      <ul className="space-y-2 text-sm text-primary text-primary">
        {immediateNextSteps.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-1 text-primary text-primary">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No next steps available yet.</p>
  );
}
