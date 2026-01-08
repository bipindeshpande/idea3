import ReactMarkdown from "react-markdown";

/**
 * Risks Section Component
 */
export default function RisksSection({ riskRows, content, isEnriching }) {
  if (riskRows && riskRows.length > 0) {
    return (
      <div className="overflow-hidden rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-surface text-left uppercase tracking-wide text-primary">
            <tr>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3 w-32">Severity</th>
              <th className="px-4 py-3">Early mitigation</th>
            </tr>
          </thead>
          <tbody>
            {riskRows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-3 text-primary">{row.risk}</td>
                <td className="px-4 py-3 font-semibold text-primary">{row.severity}</td>
                <td className="px-4 py-3 text-primary">{row.mitigation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return content?.trim() ? (
    <div className="prose prose-slate max-w-none text-primary text-primary">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  ) : (
    <p className="text-sm text-primary text-primary italic">No risk information available yet.</p>
  );
}
