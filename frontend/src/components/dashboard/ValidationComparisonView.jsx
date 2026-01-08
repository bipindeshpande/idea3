import UIButton from "../ui/ui-button.jsx";

/**
 * Component for displaying validation comparison table
 */
export default function ValidationComparisonView({
  comparisonData,
  onResetComparison
}) {
  if (!comparisonData?.validations) {
    return null;
  }

  return (
    <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-primary">Validation Comparison</h3>
        <UIButton
          variant="secondary"
          onClick={onResetComparison}
        >
          Compare Different Validations
        </UIButton>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-default bg-app">
              <th className="px-4 py-3 text-left text-xs font-semibold text-primary sticky left-0 bg-app z-10">
                Parameter
              </th>
              {comparisonData.validations.map((validation, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-primary min-w-[200px]">
                  <div className="font-bold">{validation.title || `Validation ${idx + 1}`}</div>
                  <div className="text-sm text-secondary mt-1">
                    {validation.created_at ? new Date(validation.created_at).toLocaleDateString() : ""}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-default">
              <td className="px-4 py-3 text-sm font-medium text-primary sticky left-0 bg-surface z-10">
                Overall Score
              </td>
              {comparisonData.validations.map((validation, idx) => (
                <td key={idx} className="px-4 py-3 text-sm text-primary font-semibold">
                  {validation.overall_score !== undefined && validation.overall_score !== null
                    ? `${validation.overall_score.toFixed(1)}/10`
                    : "N/A"}
                </td>
              ))}
            </tr>
            {comparisonData.validations[0]?.scores && Object.keys(comparisonData.validations[0].scores).map(category => (
              <tr key={category} className="border-b border-default bg-app">
                <td className="px-4 py-3 text-sm font-medium text-primary sticky left-0 bg-app z-10 capitalize">
                  {category.replace(/_/g, ' ')}
                </td>
                {comparisonData.validations.map((validation, idx) => (
                  <td key={idx} className="px-4 py-3 text-sm text-primary">
                    {validation.scores?.[category] !== undefined
                      ? `${validation.scores[category].toFixed(1)}/10`
                      : "N/A"}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-default">
              <td className="px-4 py-3 text-sm font-medium text-primary sticky left-0 bg-surface z-10">
                Idea Explanation
              </td>
              {comparisonData.validations.map((validation, idx) => (
                <td key={idx} className="px-4 py-3 text-sm text-primary max-w-md">
                  {validation.summary || "N/A"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

