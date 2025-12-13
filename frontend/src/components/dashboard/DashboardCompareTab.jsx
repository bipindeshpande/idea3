import { memo } from "react";
import { Link } from "react-router-dom";

function DashboardCompareTab({
  allIdeas,
  allRuns,
  selectedIdeas,
  setSelectedIdeas,
  comparisonData,
  setComparisonData,
  comparing,
  performComparison,
}) {
  // Count total runs (discovery runs) and ideas
  const runCount = allRuns ? allRuns.length : 0;
  const ideaCount = allIdeas ? allIdeas.length : 0;
  // Define all comparison rows with their data extraction logic
  const comparisonRows = [
    {
      label: "1. Summary",
      getValue: (idea) => idea.summary || idea.fullData?.summary || "N/A",
      bgClass: "",
    },
    {
      label: "2. Startup Cost",
      getValue: (idea) => idea.metrics?.startupCost || "N/A",
      bgClass: "bg-gray-50",
    },
    {
      label: "3. Monthly Revenue Potential",
      getValue: (idea) => idea.metrics?.monthlyRevenue || "N/A",
      bgClass: "",
    },
    {
      label: "4. Market Size",
      getValue: (idea) => idea.metrics?.marketSize || "N/A",
      bgClass: "bg-gray-50",
    },
    {
      label: "5. Competition Level",
      getValue: (idea) => idea.metrics?.competitionLevel || "N/A",
      bgClass: "",
      isBadge: true,
    },
    {
      label: "6. Risk Level",
      getValue: (idea) => idea.metrics?.riskLevel || "N/A",
      bgClass: "bg-gray-50",
      isBadge: true,
    },
    {
      label: "7. Time to Market",
      getValue: (idea) => idea.metrics?.timeToMarket || "N/A",
      bgClass: "",
    },
    {
      label: "8. Target Customer Segment",
      getValue: (idea) => idea.metrics?.customerSegment || "N/A",
      bgClass: "bg-gray-50",
    },
    {
      label: "9. Key Strengths",
      getValue: (idea) => idea.metrics?.keyStrengths || idea.summary?.substring(0, 80) || "N/A",
      bgClass: "",
    },
    {
      label: "10. Scalability Potential",
      getValue: (idea) => idea.metrics?.scalability || "N/A",
      bgClass: "bg-gray-50",
      isBadge: true,
    },
  ];

  // Show placeholder when user has 0 ideas (no runs or no ideas extracted)
  if (ideaCount === 0 || runCount === 0) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No comparisons yet
        </h3>
        <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
          Comparisons will show up once you look at more than one idea.
        </p>
      </div>
    );
  }

  // Show placeholder when user has 1 run or less than 2 ideas
  if (runCount === 1 || ideaCount < 2) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          No comparisons yet
        </h3>
        <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
          Comparisons will show up once you look at more than one idea.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">Compare Ideas</h3>
        <p className="text-[15px] text-gray-700 leading-relaxed">
          Select up to 5 ideas to compare side-by-side. Compare different ideas from your discovery sessions to see their differences and similarities.
        </p>
      </div>

      {!comparisonData ? (
        <div className="space-y-6">
          {/* Ideas List */}
          <section className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Select Ideas to Compare</h4>
            </div>
            {allIdeas.length === 0 ? (
              <p className="text-[15px] text-gray-700 leading-relaxed">No ideas yet. These appear as you explore or validate ideas.</p>
            ) : (
              <div className="space-y-4">
                {allIdeas.map((idea) => {
                  const isSelected = selectedIdeas.has(idea.id);
                  return (
                    <label
                      key={idea.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSet = new Set(selectedIdeas);
                          if (newSet.has(idea.id)) {
                            newSet.delete(idea.id);
                          } else {
                            if (newSet.size >= 5) {
                              alert("Maximum 5 ideas can be compared at once");
                              return;
                            }
                            newSet.add(idea.id);
                          }
                          setSelectedIdeas(newSet);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">
                          {idea.title}
                        </p>
                        <p className="text-[15px] text-gray-700 leading-relaxed mt-1">
                          {idea.summary}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : "Unknown date"}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>

          {/* Compare Button */}
          <div className="flex justify-center">
            <button
              onClick={async () => {
                if (selectedIdeas.size === 0) {
                  alert("Please select at least one idea to compare");
                  return;
                }

                if (selectedIdeas.size > 5) {
                  alert("Maximum 5 ideas can be compared at once");
                  return;
                }

                await performComparison(selectedIdeas);
              }}
              disabled={comparing || selectedIdeas.size === 0}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {comparing ? "Comparing..." : `Compare ${selectedIdeas.size} Idea${selectedIdeas.size !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">Comparison Results</h4>
            <button
              onClick={() => {
                setComparisonData(null);
                setSelectedIdeas(new Set());
              }}
              className="px-5 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm hover:shadow-md"
            >
              Compare Different Ideas
            </button>
          </div>

          {/* Ideas Comparison Table */}
          {comparisonData && comparisonData.ideas && comparisonData.ideas.length > 0 && (() => {
            // Filter rows to only show those where at least one idea has non-N/A data
            const visibleRows = comparisonRows.filter(row => {
              return comparisonData.ideas.some(idea => {
                const value = row.getValue(idea);
                return value && value !== "N/A" && value.trim() !== "";
              });
            });

            return (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Parameter</th>
                      {comparisonData.ideas.map((idea, idx) => (
                        <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 min-w-[200px]">
                          <div className="font-bold">{idea.title || `Idea ${idx + 1}`}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : ""}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className={`border-b border-gray-100 ${row.bgClass}`}>
                        <td className={`px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 ${row.bgClass || "bg-white"} z-10`}>
                          {row.label}
                        </td>
                        {comparisonData.ideas.map((idea, idx) => {
                          const value = row.getValue(idea);
                          return (
                            <td key={idx} className={`px-4 py-3 text-sm text-gray-700 ${row.label.includes("Revenue") ? "font-semibold text-green-600" : row.label.includes("Startup Cost") ? "font-semibold" : ""} ${row.label.includes("Summary") ? "max-w-md" : ""}`}>
                              {row.isBadge ? (
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                  value === "Low" ? "bg-green-100 text-green-700" :
                                  value === "Medium" || value === "Moderate" ? "bg-yellow-100 text-yellow-700" :
                                  value === "High" || value === "Intense" ? "bg-red-100 text-red-700" :
                                  value === "Excellent" || value === "Good" ? "bg-green-100 text-green-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {value}
                                </span>
                              ) : (
                                value
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default memo(DashboardCompareTab);

