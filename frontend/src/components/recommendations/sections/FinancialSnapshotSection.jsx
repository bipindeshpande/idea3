import ReactMarkdown from "react-markdown";

/**
 * Financial Snapshot Section Component
 */
export default function FinancialSnapshotSection({ financialSnapshot, content, isEnriching }) {
  if (financialSnapshot.length > 0) {
    return (
      <div className="overflow-hidden ui-card2 ui-radius-card">
        <table className="min-w-full text-sm">
          <thead className="bg-surface text-left uppercase tracking-wide text-primary">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3">Focus</th>
              <th className="px-4 py-3">Estimate</th>
              <th className="px-4 py-3 text-right">Benchmark</th>
            </tr>
          </thead>
          <tbody className="text-primary">
            {financialSnapshot.map(({ focus, estimate, metric }, index) => (
              <tr key={`${focus}-${index}`}>
                <td className="px-4 py-3 text-primary">✓</td>
                <td className="px-4 py-3 font-semibold text-primary">{focus}</td>
                <td className="px-4 py-3">{estimate}</td>
                <td className="px-4 py-3 text-right font-semibold text-primary">{metric}</td>
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
    <p className="text-sm text-primary text-primary italic">No financial snapshot available yet.</p>
  );
}
