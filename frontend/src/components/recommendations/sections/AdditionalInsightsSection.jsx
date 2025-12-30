import ReactMarkdown from "react-markdown";

/**
 * Additional Insights Section Component
 */
export default function AdditionalInsightsSection({ content, isEnriching }) {
  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No additional insights available yet.</p>
  );
}
