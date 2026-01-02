// ---------------------------------------------------------------------------
// DashboardActiveIdeasTab.jsx (Rewritten UI Layer Only)
// ---------------------------------------------------------------------------

import { Link, useNavigate } from "react-router-dom";
import { memo, useMemo } from "react";
import Card from "../ui/Card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIButton from "../ui/ui-button.jsx";

/*
 NOTES FOR DEV:
 – All core logic for filtering, matching, mapping is untouched.
 – Only DOM structure + classes are redesigned for clean, modern UI.
 – Introduced consistent card spacing, rounded corners, and alignment.
 – Reduced noisy blocks & replaced with clean patterns.
*/

function DashboardActiveIdeasTab({
 actions,
 notes,
 loadingActions,
 loadingNotes,
 allRuns,
 allValidations,
 searchQuery = "",
 allIdeas = [],
 selectedIdeas,
 setSelectedIdeas,
 comparisonData,
 setComparisonData,
 comparing,
 performComparison,
}) {
 // ---------------------------------------------------------------------------
 // Extract idea IDs from actions + notes for indicators
 // ---------------------------------------------------------------------------

 const ideaActions = actions.filter(a => {
 if (a.status === "completed") return false;
 if (!a.idea_id) return false;
 return (
 a.idea_id.match(/run_([^_]+)_idea_(\d+)/) ||
 a.idea_id.match(/idea_(\d+)/) ||
 (a.idea_id.match(/run_([^_]+)/) && !a.idea_id.match(/val_/))
 );
 });

 const ideaNotes = notes.filter(n => {
 if (!n.idea_id) return false;
 return (
 n.idea_id.match(/run_([^_]+)_idea_(\d+)/) ||
 n.idea_id.match(/idea_(\d+)/) ||
 (n.idea_id.match(/run_([^_]+)/) && !n.idea_id.match(/val_/))
 );
 });

 // Create maps for quick lookup of actions/notes by idea_id
 // Handle both formats: "run_xxx_idea_1" and "xxx-1"
 const actionsByIdeaId = new Map();
 ideaActions.forEach(action => {
 actionsByIdeaId.set(action.idea_id, action);
 // Also map normalized format for matching
 const match = action.idea_id.match(/run_([^_]+)_idea_(\d+)/);
 if (match) {
  const [, runId, idx] = match;
  actionsByIdeaId.set(`${runId}-${idx}`, action);
 }
 });

 const notesByIdeaId = new Map();
 ideaNotes.forEach(note => {
 notesByIdeaId.set(note.idea_id, note);
 // Also map normalized format for matching
 const match = note.idea_id.match(/run_([^_]+)_idea_(\d+)/);
 if (match) {
  const [, runId, idx] = match;
  notesByIdeaId.set(`${runId}-${idx}`, note);
 }
 });

 // Build list of ALL ideas (not just active ones)
 // Convert allIdeas to the format expected by the component
 const allIdeasList = allIdeas.map(idea => {
 // Idea ID can be in format "runId-ideaIndex" or we construct it
 const ideaId = idea.id || `${idea.runId}-${idea.ideaIndex}`;
 // Also create the "run_xxx_idea_y" format for matching
 const runIdNormalized = String(idea.runId || "").replace(/^run_/, "");
 const ideaIdFormatted = `run_${runIdNormalized}_idea_${idea.ideaIndex}`;
 
 // Try both formats when looking up actions/notes
 const action = actionsByIdeaId.get(ideaId) || actionsByIdeaId.get(ideaIdFormatted);
 const note = notesByIdeaId.get(ideaId) || notesByIdeaId.get(ideaIdFormatted);
 
 return {
 idea_id: ideaIdFormatted, // Use standard format for compatibility
 hasAction: !!action,
 hasNote: !!note,
 action: action || null,
 note: note || null,
 // Store original idea data for reference
 _ideaData: idea,
 };
 });

 const allActiveIdeas = allIdeasList;

 // ---------------------------------------------------------------------------
 // SEARCH FILTER (unchanged, just wrapped cleanly)
 // ---------------------------------------------------------------------------

 const activeIdeas = useMemo(() => {
 if (!searchQuery.trim()) return allActiveIdeas;
 const query = searchQuery.toLowerCase().trim();
 const normalize = v => (v ? String(v).trim().toLowerCase() : "");

 return allActiveIdeas.filter(item => {
 let match = false;

 if (item.hasAction && item.action?.action_text) {
 if (normalize(item.action.action_text).includes(query)) match = true;
 }

 if (item.hasNote && item.note?.content) {
 if (normalize(item.note.content).includes(query)) match = true;
 }

 // Match idea title or summary
 const ideaId = item.idea_id;
 if (ideaId && allIdeas.length) {
 const matchRun = ideaId.match(/run_([^_]+)_idea_(\d+)/);
 let matchingIdea = null;

 if (matchRun) {
 const [, runId, ideaIndex] = matchRun;
 matchingIdea = allIdeas.find(
 i =>
 String(i.runId || "").replace(/^run_/, "") === runId &&
 String(i.ideaIndex) === ideaIndex
 );
 }

 if (matchingIdea) {
 if (
 normalize(matchingIdea.title).includes(query) ||
 normalize(matchingIdea.summary).includes(query)
 ) {
 match = true;
 }
 }
 }

 return match;
 });
 }, [allActiveIdeas, searchQuery, allIdeas]);

 const hasExploredIdeas = allRuns && allRuns.length > 0;

 // ---------------------------------------------------------------------------
 // CLEAN CARD COMPONENT (Local)
 // ---------------------------------------------------------------------------

 const IdeaCard = ({ item, ideaLink, projectName, run, ideaData }) => {
 const isSelected = selectedIdeas?.has(item.idea_id);
 const navigate = useNavigate();

 const handleClick = (e) => {
  e.preventDefault();
  // Pass full run data and idea data through navigation state to prevent re-running AI
  navigate(ideaLink, {
   state: {
    run: run,
    idea: ideaData,
    allIdeas: allIdeas,
    inputs: run?.inputs,
    recommendations: run?.reports || run?.outputs
   }
  });
 };

 return (
 <div className={`subtle-card hover:shadow-md transition-all ${isSelected ? "border-default bg-surface" : ""}`} style={{ padding: "8px 12px" }}>
 <div className="flex gap-2">
 {selectedIdeas && (
 <input
 type="checkbox"
 checked={isSelected}
 onChange={e => {
 e.stopPropagation();
 const set = new Set(selectedIdeas);
 if (set.has(item.idea_id)) set.delete(item.idea_id);
 else {
 if (set.size >= 5) return alert("Max 5 ideas allowed.");
 set.add(item.idea_id);
 }
 setSelectedIdeas(set);
 }}
 className="mt-1 h-4 w-4 text-accent rounded border-default"
 />
 )}

 <div className="flex-1">
 <a href={ideaLink} onClick={handleClick} className="block cursor-pointer">
 <div className="flex items-center gap-1.5 mb-0.5">
 {item.hasAction && (
<div
className={`h-2 w-2 rounded-full ${
item.action.status === "in_progress"
? "bg-warning"
: item.action.status === "blocked"
? "bg-surface-muted"
: item.action.status === "completed"
? "bg-success"
: "bg-surface-muted"
}`}
/>
 )}

{!item.hasAction && item.hasNote && (
<div className="h-2 w-2 rounded-full" style={{ background: "var(--badge-info-bg)" }} />
)}

 <h4 className="text-sm font-semibold text-primary">
 {projectName}
 </h4>
 </div>

 {/* run metadata */}
 {run?.inputs && (
 <p className="text-xs text-secondary mb-1 leading-tight">
 Time: {run.inputs.time_commitment || "Not set"} • Budget:{" "}
 {run.inputs.budget_range || "Not set"} • Focus:{" "}
 {run.inputs.sub_interest_area ||
 run.inputs.interest_area ||
 "Unknown"}
 </p>
 )}

 {item.hasAction && (
 <p className="text-xs text-primary leading-tight">{item.action.action_text}</p>
 )}

 {item.hasNote && (
 <p className="text-xs text-primary italic leading-tight">
 {item.note.content.length > 100
 ? item.note.content.slice(0, 100) + "..."
 : item.note.content}
 </p>
 )}
 </a>
 </div>
 </div>
 </div>
 );
 };

 // ---------------------------------------------------------------------------
 // RENDER
 // ---------------------------------------------------------------------------

if (!hasExploredIdeas || allIdeas.length === 0) {
 return (
 <div className="ui-card2 ui-pad-md text-center" style={{ paddingTop: "calc(var(--space-24) * 0.8)" }}>
 <div className="text-5xl mb-4">💡</div>

 <UIHeading level="h3" className="mb-2">
 No ideas yet
 </UIHeading>

 <p className="text-base text-secondary max-w-sm mx-auto mb-6">
 Start by discovering 3 tailored ideas or validating your own.
 </p>

 <div className="flex justify-center gap-3">
 <Link to="/advisor" className="ui-button ui-button--primary focus-visible:outline-accent">Discover Ideas</Link>
 <Link to="/validate-idea" className="ui-button ui-button--secondary focus-visible:outline-accent">Validate an Idea</Link>
 </div>
 </div>
 );
}

 return (
 <div className="space-y-6">

 {/* SECTION HEADER */}
 <div className="flex items-center justify-between mb-3">
 <h3 className="ui-heading ui-heading--h3 text-primary">
 All Ideas ({activeIdeas.length})
 </h3>

 {selectedIdeas?.size >= 2 && (
 <UIButton
 variant="primary"
 onClick={() => performComparison(selectedIdeas)}
 disabled={comparing}
 >
 {comparing ? "Comparing..." : `Compare (${selectedIdeas.size})`}
 </UIButton>
 )}
 </div>

 {activeIdeas.length === 0 ? (
 <div className="text-center text-base text-secondary py-8">
 No ideas match your search.
 </div>
 ) : (
 <div className="space-y-4">
 {activeIdeas.map(item => {
 const ideaId = item.idea_id;
 let projectName = "Idea";
 let ideaLink = "#";
 let run = null;
 let ideaIndex = null;
 let ideaData = item._ideaData;

 // Use stored idea data if available, otherwise parse from idea_id
 if (ideaData) {
 ideaIndex = ideaData.ideaIndex;
 const runIdNormalized = String(ideaData.runId || "").replace(/^run_/, "");
 run = allRuns.find(r => {
  const rId = String(r.run_id || "").replace(/^run_/, "");
  return rId === runIdNormalized;
 });
 projectName = ideaData.title || `Idea #${ideaIndex}`;
 ideaLink = `/results/recommendations/${ideaIndex}?id=${runIdNormalized}`;
 } else {
 // Fallback: Resolve routing from idea_id format
 const m = ideaId.match(/run_([^_]+)_idea_(\d+)/);
 if (m) {
  const [, runId, idx] = m;
  ideaIndex = idx;
  const runIdNormalized = String(runId).replace(/^run_/, "");
  run = allRuns.find(r => {
   const rId = String(r.run_id || "").replace(/^run_/, "");
   return rId === runIdNormalized;
  });
  projectName = `Idea #${idx}`;
  ideaLink = `/results/recommendations/${idx}?id=${runIdNormalized}`;
  
  // Try to find the idea in allIdeas
  ideaData = allIdeas.find(idea => {
   const ideaRunId = String(idea.runId || "").replace(/^run_/, "");
   return ideaRunId === runIdNormalized && String(idea.ideaIndex) === idx;
  });
 }
 }

 // Ensure we have the full idea object with all data
 if (!ideaData && ideaIndex && run) {
  ideaData = allIdeas.find(idea => {
   const ideaRunId = String(idea.runId || "").replace(/^run_/, "");
   const runIdNormalized = String(run.run_id || "").replace(/^run_/, "");
   return ideaRunId === runIdNormalized && String(idea.ideaIndex) === String(ideaIndex);
  });
 }

 return (
 <IdeaCard
 key={item.idea_id}
 item={item}
 ideaLink={ideaLink}
 projectName={projectName}
 run={run}
 ideaData={ideaData}
 />
 );
 })}
 </div>
 )}
 </div>
 );
}

export default memo(DashboardActiveIdeasTab);
