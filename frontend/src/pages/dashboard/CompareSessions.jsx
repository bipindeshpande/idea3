import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { parseStructuredIdeas } from "../../utils/parsers/index.js";
import { extractComparisonMetrics } from "../../utils/dashboard/extractComparisonMetrics.js";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";
import UIBadge from "../../components/ui/ui-badge.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../../components/workspace/WorkspaceTheme.js";

export default function CompareSessionsPage() {
 const { getAuthHeaders, isAuthenticated } = useAuth();
 const navigate = useNavigate();
 const [runs, setRuns] = useState([]);
 const [validations, setValidations] = useState([]);
 const [allIdeas, setAllIdeas] = useState([]); // All ideas extracted from runs
 const [selectedIdeas, setSelectedIdeas] = useState(new Set()); // Selected idea IDs (format: "runId-ideaIndex")
 const [comparisonData, setComparisonData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [comparing, setComparing] = useState(false);

 useEffect(() => {
 if (!isAuthenticated) {
 navigate("/login");
 return;
 }

 const loadSessions = async () => {
 try {
 const response = await fetch("/api/user/activity", {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 const runsData = data.activity?.runs || [];
 setRuns(runsData);
 setValidations(data.activity?.validations || []);
 
 // Extract all ideas from runs
 const ideasList = [];
 runsData.forEach((run) => {
 if (run.reports?.personalized_recommendations) {
 const topIdeas = parseStructuredIdeas(run.reports.personalized_recommendations, 3);
 topIdeas.forEach((idea) => {
 ideasList.push({
 id: `${run.run_id}-${idea.index}`,
 runId: run.run_id,
 ideaIndex: idea.index,
 title: idea.title,
 summary: idea.summary,
 runInputs: run.inputs,
 runCreatedAt: run.created_at,
 });
 });
 }
 });
 setAllIdeas(ideasList);
 }
 }
 } catch (error) {
 console.error("Failed to load sessions:", error);
 } finally {
 setLoading(false);
 }
 };

 loadSessions();
 }, [isAuthenticated, getAuthHeaders, navigate]);

 const handleCompare = async () => {
 if (selectedIdeas.size === 0) {
 alert("Please select at least one idea to compare");
 return;
 }

 if (selectedIdeas.size > 5) {
 alert("Maximum 5 ideas can be compared at once");
 return;
 }

 setComparing(true);
 
 try {
 // Get selected ideas data
 const selectedIdeasData = allIdeas.filter(idea => selectedIdeas.has(idea.id));
 
 // Group by run_id to fetch full run data
 const runIds = [...new Set(selectedIdeasData.map(idea => idea.runId))];
 
 const requestBody = {
 run_ids: runIds,
 validation_ids: [],
 };
 
 const response = await fetch("/api/user/compare-sessions", {
 method: "POST",
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 body: JSON.stringify(requestBody),
 });
 
 if (response.ok) {
 const data = await response.json();
 
 if (data.success) {
        if (data.comparison) {
          // Extract only the selected ideas from the comparison data
          const ideasComparison = {
            ideas: selectedIdeasData.map(idea => {
              const run = data.comparison.runs?.find(r => r.run_id === idea.runId);
              if (run && run.reports?.personalized_recommendations) {
                const topIdeas = parseStructuredIdeas(run.reports.personalized_recommendations, 3);
                const matchedIdea = topIdeas.find(i => i.index === idea.ideaIndex);
                const metrics = extractComparisonMetrics(run, idea.ideaIndex);
                return {
                  ...idea,
                  fullData: matchedIdea,
                  metrics,
                  runInputs: run.inputs,
                  runCreatedAt: run.created_at,
                };
              }
              // Fallback: try to extract metrics from the run even if we don't have matched idea
              const metrics = extractComparisonMetrics(run, idea.ideaIndex);
              return {
                ...idea,
                metrics,
              };
            }),
          };
          setComparisonData(ideasComparison);
          window.scrollTo({ top: 0, behavior: 'smooth' });
 } else {
 alert("Comparison completed but no data was returned. Please try again.");
 }
 } else {
 alert(data.error || "Failed to compare ideas. Please try again.");
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 console.error("Comparison error:", errorData);
 alert(errorData.error || `Failed to compare ideas (${response.status}). Please try again.`);
 }
 } catch (error) {
 console.error("Failed to compare ideas:", error);
 alert("Network error. Please check your connection and try again.");
 } finally {
 setComparing(false);
 }
 };

 const toggleIdea = (ideaId) => {
 setSelectedIdeas((prev) => {
 const next = new Set(prev);
 if (next.has(ideaId)) {
 next.delete(ideaId);
 } else {
 next.add(ideaId);
 }
 return next;
 });
 };

 if (loading) {
 return <LoadingIndicator simple={true} message="Loading sessions..." />;
 }

 return (
 <>
 <Seo
 title="Compare Ideas | Startup Idea Advisor"
 description="Compare multiple startup ideas side-by-side"
 path="/dashboard/compare"
 />

 <div className="mb-6">
  <div className="flex items-center justify-between">
   <div>
    <UIHeading level="h1" className="text-primary">
     Compare Ideas
    </UIHeading>
    <p className={"mt-2 " + WORKSPACE_TYPOGRAPHY.subtitle}>
     Select up to 5 ideas to compare side-by-side. See differences and patterns across your ideas.
    </p>
   </div>
  </div>
 </div>

 {!comparisonData ? (
 <div className="space-y-6">
 {/* Compare Button at Top */}
 <div className="flex justify-center">
 <UIButton
 variant="primary"
 onClick={handleCompare}
 disabled={comparing || selectedIdeas.size === 0}
 >
 {comparing ? "Comparing..." : `Compare ${selectedIdeas.size} Idea(s)`}
 </UIButton>
 </div>

 {/* Ideas List */}
 <section className="rounded-2xl border border-default bg-surface p-6 shadow-lg">
  <UIHeading level="h2" className="text-primary mb-4">Select Ideas to Compare</UIHeading>
  {allIdeas.length === 0 ? (
   <p className={WORKSPACE_TYPOGRAPHY.subtitle}>No ideas found. Create some idea discovery sessions first.</p>
  ) : (
   <div className="space-y-2">
    {allIdeas.map((idea) => (
     <label
      key={idea.id}
      className="flex cursor-pointer items-center gap-3 rounded-lg border border-default bg-surface p-4 transition hover:bg-surface"
     >
      <input
       type="checkbox"
       checked={selectedIdeas.has(idea.id)}
       onChange={() => toggleIdea(idea.id)}
       className="h-4 w-4 rounded border-default text-accent "
      />
      <div className="flex-1">
       <p className={WORKSPACE_TYPOGRAPHY.label}>
        {idea.title}
       </p>
       <p className={WORKSPACE_TYPOGRAPHY.caption + " mt-1"}>
        {idea.summary}
       </p>
       <p className={WORKSPACE_TYPOGRAPHY.caption + " mt-1"}>
        {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleString() : "Unknown date"}
       </p>
      </div>
     </label>
    ))}
   </div>
  )}
 </section>

 {/* Compare Button at Bottom */}
 <div className="flex justify-center">
 <UIButton
 variant="primary"
 onClick={handleCompare}
 disabled={comparing || selectedIdeas.size === 0}
 >
 {comparing ? "Comparing..." : `Compare ${selectedIdeas.size} Idea(s)`}
 </UIButton>
 </div>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <UIHeading level="h2" className="text-primary">Comparison Results</UIHeading>
 <UIButton
 variant="secondary"
 size="sm"
 onClick={() => {
 setComparisonData(null);
 setSelectedIdeas(new Set());
 }}
 >
 Compare Different Ideas
 </UIButton>
 </div>

{/* Ideas Comparison */}
{comparisonData && comparisonData.ideas && comparisonData.ideas.length > 0 && (() => {
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

// Filter rows to only show those where at least one idea has non-N/A data
const visibleRows = comparisonRows.filter(row => {
 return comparisonData.ideas.some(idea => {
  const value = row.getValue(idea);
  return value && value !== "N/A" && value.trim() !== "";
 });
});

return (
<section className="ui-card rounded-[16px] p-6 shadow-card">
<UIHeading level="h3" className="text-primary mb-4">
Ideas Comparison ({comparisonData.ideas.length})
</UIHeading>
<div className="overflow-x-auto">
<table className="w-full border-collapse">
<thead>
<tr className="border-b border-default bg-app">
<th className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.caption} font-semibold text-primary sticky left-0 bg-app z-10`}>Parameter</th>
{comparisonData.ideas.map((idea, idx) => (
<th key={idx} className={`px-4 py-3 text-left ${WORKSPACE_TYPOGRAPHY.caption} font-semibold text-primary min-w-[200px]`}>
<div className="font-bold">{idea.title || `Idea ${idx + 1}`}</div>
<div className={`${WORKSPACE_TYPOGRAPHY.subtitle} mt-1`}>
{idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : ""}
</div>
</th>
))}
</tr>
</thead>
<tbody>
{visibleRows.map((row, rowIdx) => (
<tr key={rowIdx} className={`border-b border-default ${row.bgClass}`}>
<td className={`px-4 py-3 ${WORKSPACE_TYPOGRAPHY.bodySmall} font-medium text-primary sticky left-0 ${row.bgClass || "bg-surface"} z-10`}>
{row.label}
</td>
{comparisonData.ideas.map((idea, idx) => {
 const value = row.getValue(idea);
 return (
 <td key={idx} className={`px-4 py-3 ${WORKSPACE_TYPOGRAPHY.bodySmall} text-primary ${row.label.includes("Revenue") ? "font-semibold text-success" : row.label.includes("Startup Cost") ? "font-semibold" : ""} ${row.label.includes("Summary") ? "max-w-md" : ""}`}>
{row.isBadge ? (
(() => {
let badgeVariant = "info";
if (value === "Low" || value === "Excellent" || value === "Good") badgeVariant = "success";
else if (value === "Medium" || value === "Moderate") badgeVariant = "warning";
else if (value === "High" || value === "Intense") badgeVariant = "info";
return (
<UIBadge variant={badgeVariant} className={`px-2 py-1 ${WORKSPACE_TYPOGRAPHY.caption} font-semibold`}>
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
</section>
);
})()}

 {/* Show message if no ideas found */}
 {comparisonData && (!comparisonData.ideas || comparisonData.ideas.length === 0) && (
  <div className={"rounded-lg border border-default bg-surface p-4 " + WORKSPACE_TYPOGRAPHY.bodySmall.replace("text-primary", "text-accent")}>
   No ideas found for comparison. The selected ideas may have been deleted or you may not have access to them.
  </div>
 )}
 </div>
 )}
 </>
 );
}

