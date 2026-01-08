import ReactMarkdown from "react-markdown";

/**
 * Immediate Experiments Section Component
 */
export default function ImmediateExperimentsSection({ immediateExperimentsList, content, isEnriching }) {
  if (immediateExperimentsList && immediateExperimentsList.length > 0) {
    return (
      <ul className="space-y-2 text-sm text-primary text-primary">
        {immediateExperimentsList.map((item, index) => (
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
    <p className="text-sm text-primary text-primary italic">No experiments available yet.</p>
  );
}
