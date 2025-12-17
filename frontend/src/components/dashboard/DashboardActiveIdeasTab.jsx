// ---------------------------------------------------------------------------
// DashboardActiveIdeasTab.jsx (Rewritten UI Layer Only)
// ---------------------------------------------------------------------------

import { Link } from "react-router-dom";
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
 // Extract "active idea IDs" from actions + notes
 // (YOUR ORIGINAL LOGIC – UNTOUCHED)
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

 const ideaIdsWithActions = new Set(ideaActions.map(a => a.idea_id));
 const ideaIdsWithNotes = new Set(ideaNotes.map(n => n.idea_id));
 const allActiveIdeaIds = new Set([...ideaIdsWithActions, ...ideaIdsWithNotes]);

 // Build map
 const activeIdeasMap = new Map();

 ideaActions.forEach(action => {
 if (!activeIdeasMap.has(action.idea_id)) {
 activeIdeasMap.set(action.idea_id, {
 idea_id: action.idea_id,
 hasAction: true,
 hasNote: false,
 action,
 note: null,
 });
 } else {
 const e = activeIdeasMap.get(action.idea_id);
 e.hasAction = true;
 e.action = action;
 }
 });

 ideaNotes.forEach(note => {
 if (!activeIdeasMap.has(note.idea_id)) {
 activeIdeasMap.set(note.idea_id, {
 idea_id: note.idea_id,
 hasAction: false,
 hasNote: true,
 action: null,
 note,
 });
 } else {
 const e = activeIdeasMap.get(note.idea_id);
 e.hasNote = true;
 e.note = note;
 }
 });

 const allActiveIdeas = Array.from(activeIdeasMap.values());

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

 const IdeaCard = ({ item, ideaLink, projectName, run }) => {
 const isSelected = selectedIdeas?.has(item.idea_id);

 return (
 <div className={`subtle-card hover:shadow-md transition-all ${isSelected ? "border-default bg-surface" : ""}`}>
 <div className="flex gap-3">
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
 <Link to={ideaLink} className="block">
 <div className="flex items-center gap-2 mb-1">
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

 <h4 className="ui-heading ui-heading--h2 text-primary">
 {projectName}
 </h4>
 </div>

 {/* run metadata */}
 {run?.inputs && (
 <p className="text-xs text-secondary mb-2">
 Time: {run.inputs.time_commitment || "Not set"} • Budget:{" "}
 {run.inputs.budget_range || "Not set"} • Focus:{" "}
 {run.inputs.sub_interest_area ||
 run.inputs.interest_area ||
 "Unknown"}
 </p>
 )}

 {item.hasAction && (
 <p className="text-base text-primary">{item.action.action_text}</p>
 )}

 {item.hasNote && (
 <p className="text-base text-primary italic">
 {item.note.content.length > 100
 ? item.note.content.slice(0, 100) + "..."
 : item.note.content}
 </p>
 )}
 </Link>
 </div>
 </div>
 </div>
 );
 };

 // ---------------------------------------------------------------------------
 // RENDER
 // ---------------------------------------------------------------------------

if (!hasExploredIdeas) {
 return (
 <div className="ui-card2 ui-pad-md text-center" style={{ paddingTop: "calc(var(--space-24) * 0.8)" }}>
 <div className="text-5xl mb-4">💡</div>

 <UIHeading level="h3" className="mb-2">
 No active ideas yet
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
 <h3 className="ui-heading ui-heading--h2 text-primary">
 Active Ideas ({activeIdeas.length})
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
 No active ideas match your search.
 </div>
 ) : (
 <div className="space-y-4">
 {activeIdeas.slice(0, 10).map(item => {
 const ideaId = item.idea_id;
 let projectName = "Idea";
 let ideaLink = "#";
 let run = null;
 let ideaIndex = null;

 // Resolve routing (your original logic preserved)
 const m = ideaId.match(/run_([^_]+)_idea_(\d+)/);
 if (m) {
 const [, runId, idx] = m;
 ideaIndex = idx;
 run = allRuns.find(r => r.run_id === runId);
 projectName = `Idea #${idx}`;
 ideaLink = `/results/recommendations/${idx}?id=${runId}`;
 }

 return (
 <IdeaCard
 key={item.idea_id}
 item={item}
 ideaLink={ideaLink}
 projectName={projectName}
 run={run}
 />
 );
 })}
 </div>
 )}
 </div>
 );
}

export default memo(DashboardActiveIdeasTab);
