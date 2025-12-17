import { memo } from "react";
import { Link } from "react-router-dom";
import UIBadge from "../ui/ui-badge.jsx";

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
 bgClass: "bg-app",
 },
 {
 label: "3. Monthly Revenue Potential",
 getValue: (idea) => idea.metrics?.monthlyRevenue || "N/A",
 bgClass: "",
 },
 {
 label: "4. Market Size",
 getValue: (idea) => idea.metrics?.marketSize || "N/A",
 bgClass: "bg-app",
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
 bgClass: "bg-app",
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
 bgClass: "bg-app",
 },
 {
 label: "9. Key Strengths",
 getValue: (idea) => idea.metrics?.keyStrengths || idea.summary?.substring(0, 80) || "N/A",
 bgClass: "",
 },
 {
 label: "10. Scalability Potential",
 getValue: (idea) => idea.metrics?.scalability || "N/A",
 bgClass: "bg-app",
 isBadge: true,
 },
 ];

 // Show placeholder when user has 0 ideas (no runs or no ideas extracted)
 if (ideaCount === 0 || runCount === 0) {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No comparisons yet
 </h3>
 <p className="text-primary text-secondary leading-relaxed max-w-md mx-auto">
 Comparisons will show up once you look at more than one idea.
 </p>
 </div>
 );
 }

 // Show placeholder when user has 1 run or less than 2 ideas
 if (runCount === 1 || ideaCount < 2) {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center">
 <h3 className="text-lg font-semibold text-primary mb-1">
 No comparisons yet
 </h3>
 <p className="text-primary text-secondary leading-relaxed max-w-md mx-auto">
 Comparisons will show up once you look at more than one idea.
 </p>
 </div>
 );
 }

 return (
 <div className="space-y-6">
 <div className="mb-6">
 <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">Compare Ideas</h3>
 <p className="text-primary text-primary leading-relaxed">
 Compare your ideas side by side. Select up to 5 ideas to see their differences and similarities.
 </p>
 </div>

 {!comparisonData ? (
 <div className="space-y-6">
 {/* Ideas List */}
 <section className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-lg font-semibold text-primary flex items-center gap-2">Select Ideas to Compare</h4>
 </div>
 {allIdeas.length === 0 ? (
 <p className="text-primary text-primary leading-relaxed">No ideas yet. These appear as you explore or validate ideas.</p>
 ) : (
 <div className="space-y-4">
 {allIdeas.map((idea) => {
 const isSelected = selectedIdeas.has(idea.id);
 return (
 <label
 key={idea.id}
 className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
 isSelected
 ? "border-default bg-surface"
 : "border-default hover:border-default"
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
 className="rounded border-default text-accent "
 />
 <div className="flex-1">
 <p className="text-lg font-semibold text-primary">
 {idea.title}
 </p>
 <p className="text-primary text-primary leading-relaxed mt-1">
 {idea.summary}
 </p>
 <p className="text-sm text-secondary mt-1">
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
 className="px-5 py-2.5 rounded-lg font-medium text-on-accent bg-accent hover:bg-accent-hover transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {comparing ? "Comparing..." : `Compare ${selectedIdeas.size} Idea${selectedIdeas.size !== 1 ? "s" : ""}`}
 </button>
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h4 className="text-lg font-semibold text-primary flex items-center gap-2">Comparison Results</h4>
 <button
 onClick={() => {
 setComparisonData(null);
 setSelectedIdeas(new Set());
 }}
 className="px-5 py-2.5 rounded-lg font-medium text-accent bg-surface hover:bg-surface transition-all shadow-sm hover:shadow-md"
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
 <tr className="border-b border-default bg-app">
 <th className="px-4 py-3 text-left text-xs font-semibold text-primary sticky left-0 bg-app z-10">Parameter</th>
 {comparisonData.ideas.map((idea, idx) => (
 <th key={idx} className="px-4 py-3 text-left text-xs font-semibold text-primary min-w-[200px]">
 <div className="font-bold">{idea.title || `Idea ${idx + 1}`}</div>
 <div className="text-sm text-secondary mt-1">
 {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : ""}
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {visibleRows.map((row, rowIdx) => (
 <tr key={rowIdx} className={`border-b border-default ${row.bgClass}`}>
 <td className={`px-4 py-3 text-sm font-medium text-primary sticky left-0 ${row.bgClass || "bg-surface"} z-10`}>
 {row.label}
 </td>
 {comparisonData.ideas.map((idea, idx) => {
 const value = row.getValue(idea);
 return (
 <td key={idx} className={`px-4 py-3 text-sm text-primary ${row.label.includes("Revenue") ? "font-semibold text-success" : row.label.includes("Startup Cost") ? "font-semibold" : ""} ${row.label.includes("Summary") ? "max-w-md" : ""}`}>
{row.isBadge ? (
(() => {
let badgeVariant = "info";
if (value === "Low" || value === "Excellent" || value === "Good") badgeVariant = "success";
else if (value === "Medium" || value === "Moderate") badgeVariant = "warning";
else if (value === "High" || value === "Intense") badgeVariant = "info";
return (
<UIBadge variant={badgeVariant} className="px-2 py-1 text-xs font-semibold">
{value}
</UIBadge>
);
})()
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

