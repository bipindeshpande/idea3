import ReactMarkdown from "react-markdown";

/**
 * Execution Path Section Component
 */
export default function ExecutionPathSection({ executionPhaseCards, content, isEnriching }) {
  if (executionPhaseCards && executionPhaseCards.length > 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {executionPhaseCards.map((phase) => (
          <div key={phase.title} className="ui-card2 ui-pad-md rounded-xl shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">{phase.title}</h3>
            <ol className="mt-3 space-y-2 text-sm text-primary">
              {phase.items.map((item) => (
                <li key={item.index} className="flex gap-3">
                  <span className="min-w-[2.25rem] rounded-full bg-surface px-2 py-1 text-center font-semibold text-primary">
                    {item.index}
                  </span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    );
  }

  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No execution path available yet.</p>
  );
}
