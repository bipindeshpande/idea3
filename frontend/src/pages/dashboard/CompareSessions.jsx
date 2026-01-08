import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import LoadingIndicator from "../../components/common/LoadingIndicator.jsx";
import { parseStructuredIdeas } from "../../utils/parsers/index.js";
import UIButton from "../../components/ui/ui-button.jsx";
import UIHeading from "../../components/ui/ui-heading.jsx";

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
 return {
 ...idea,
 fullData: matchedIdea,
 runInputs: run.inputs,
 runCreatedAt: run.created_at,
 };
 }
 return idea;
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
 <p className="mt-2 text-sm text-secondary">
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
 <p className="text-sm text-secondary">No ideas found. Create some idea discovery sessions first.</p>
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
 <p className="text-sm font-semibold text-primary">
 {idea.title}
 </p>
 <p className="text-xs text-secondary mt-1">
 {idea.summary}
 </p>
 <p className="text-xs text-secondary mt-1">
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
 {comparisonData && comparisonData.ideas && comparisonData.ideas.length > 0 && (
 <section className="ui-card rounded-[16px] p-6 shadow-card">
 <UIHeading level="h3" className="text-primary mb-4">
 Ideas Comparison ({comparisonData.ideas.length})
 </UIHeading>
 <div className="overflow-x-auto">
 <table className="min-w-full divide-y divide-[color-mix(in srgb, var(--border) 70%, transparent)]">
 <thead className="bg-surface-muted">
 <tr>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
 Idea Title
 </th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
 Summary
 </th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
 Session Date
 </th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
 Goal Type
 </th>
  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-secondary">
 Interest Area
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-[color-mix(in srgb, var(--border) 70%, transparent)] bg-surface">
 {comparisonData.ideas.map((idea, idx) => {
 const inputs = idea.runInputs || {};
 return (
   <tr key={idea.id || idx} className="hover:bg-surface-hover">
    <td className="px-4 py-3 text-sm font-medium text-primary">
 {idea.title}
 {idea.runId && (
     <span className="ml-2 text-xs text-secondary">
 (Run ID: {String(idea.runId).slice(-8)})
 </span>
 )}
 </td>
    <td className="px-4 py-3 text-sm text-secondary max-w-md">
 {idea.summary || idea.fullData?.summary || "N/A"}
 </td>
    <td className="whitespace-nowrap px-4 py-3 text-sm text-secondary">
 {idea.runCreatedAt ? new Date(idea.runCreatedAt).toLocaleDateString() : "N/A"}
 </td>
    <td className="px-4 py-3 text-sm text-secondary">
 {inputs.goal_type || "N/A"}
 </td>
    <td className="px-4 py-3 text-sm text-secondary">
 {inputs.sub_interest_area || inputs.interest_area || "N/A"}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </section>
 )}

 {/* Show message if no ideas found */}
 {comparisonData && (!comparisonData.ideas || comparisonData.ideas.length === 0) && (
 <div className="rounded-lg border border-default bg-surface p-4 text-sm text-accent">
 No ideas found for comparison. The selected ideas may have been deleted or you may not have access to them.
 </div>
 )}
 </div>
 )}
 </>
 );
}

