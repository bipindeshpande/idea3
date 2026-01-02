import ReactMarkdown from "react-markdown";

/**
 * Market Opportunity Section Component
 */
export default function MarketOpportunitySection({ marketInsights, content, isEnriching }) {
  if (marketInsights.length > 0) {
    return (
      <ul className="space-y-3 text-sm text-primary text-primary">
        {marketInsights.map((insight, index) => (
          <li key={index} className="flex gap-3 ui-card2 ui-pad-sm rounded-xl shadow-card">
            <span className="mt-1 text-primary">📈</span>
            <span>{insight}</span>
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
    <p className="text-sm text-primary text-primary italic">No market opportunity information available yet.</p>
  );
}
