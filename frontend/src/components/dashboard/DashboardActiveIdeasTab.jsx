// ---------------------------------------------------------------------------
// DashboardActiveIdeasTab.jsx (Rewritten UI Layer Only)
// ---------------------------------------------------------------------------

import { Link, useNavigate } from "react-router-dom";
import { memo, useMemo, useState } from "react";
import Card from "../ui/Card.jsx";
import UIHeading from "../ui/ui-heading.jsx";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

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

 // Filter actions for display (exclude completed for UI purposes)
 const ideaActions = actions.filter(a => {
 if (a.status === "completed") return false;
 if (!a.idea_id) return false;
 return (
 a.idea_id.match(/run_([^_]+)_idea_(\d+)/) ||
 a.idea_id.match(/idea_(\d+)/) ||
 (a.idea_id.match(/run_([^_]+)/) && !a.idea_id.match(/val_/))
 );
 });

 // Include ALL actions (any status) for determining active status
 const allActionsForActiveCheck = actions.filter(a => {
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
 // Backend uses canonical format: run_id::idea_index (e.g., "abc123::idea_1")
 // Frontend also uses formats: "run_xxx_idea_y" and "xxx-y"
 const actionsByIdeaId = new Map();
 ideaActions.forEach(action => {
 actionsByIdeaId.set(action.idea_id, action);
 
 // Handle canonical format: run_id::idea_index
 const canonicalMatch = action.idea_id.match(/^([^:]+)::idea_(\d+)$/);
 if (canonicalMatch) {
  const [, runId, idx] = canonicalMatch;
  // Map to frontend formats
  actionsByIdeaId.set(`${runId}-${idx}`, action);
  actionsByIdeaId.set(`run_${runId}_idea_${idx}`, action);
 }
 
 // Handle legacy format: run_xxx_idea_y
 const legacyMatch = action.idea_id.match(/run_([^_]+)_idea_(\d+)/);
 if (legacyMatch) {
  const [, runId, idx] = legacyMatch;
  actionsByIdeaId.set(`${runId}-${idx}`, action);
 }
 });

 // Create map for ALL actions (any status) to determine active status
 const allActionsByIdeaId = new Map();
 allActionsForActiveCheck.forEach(action => {
 allActionsByIdeaId.set(action.idea_id, action);
 
 // Handle canonical format: run_id::idea_index
 const canonicalMatch = action.idea_id.match(/^([^:]+)::idea_(\d+)$/);
 if (canonicalMatch) {
  const [, runId, idx] = canonicalMatch;
  // Map to frontend formats
  allActionsByIdeaId.set(`${runId}-${idx}`, action);
  allActionsByIdeaId.set(`run_${runId}_idea_${idx}`, action);
 }
 
 // Handle legacy format: run_xxx_idea_y
 const legacyMatch = action.idea_id.match(/run_([^_]+)_idea_(\d+)/);
 if (legacyMatch) {
  const [, runId, idx] = legacyMatch;
  allActionsByIdeaId.set(`${runId}-${idx}`, action);
 }
 });

 const notesByIdeaId = new Map();
 ideaNotes.forEach(note => {
 notesByIdeaId.set(note.idea_id, note);
 
 // Handle canonical format: run_id::idea_index
 const canonicalMatch = note.idea_id.match(/^([^:]+)::idea_(\d+)$/);
 if (canonicalMatch) {
  const [, runId, idx] = canonicalMatch;
  // Map to frontend formats
  notesByIdeaId.set(`${runId}-${idx}`, note);
  notesByIdeaId.set(`run_${runId}_idea_${idx}`, note);
 }
 
 // Handle legacy format: run_xxx_idea_y
 const legacyMatch = note.idea_id.match(/run_([^_]+)_idea_(\d+)/);
 if (legacyMatch) {
  const [, runId, idx] = legacyMatch;
  notesByIdeaId.set(`${runId}-${idx}`, note);
 }
 });

 // Build list of ALL ideas (not just active ones)
 // Convert allIdeas to the format expected by the component
 const allIdeasList = allIdeas.map(idea => {
 // Idea ID can be in format "runId-ideaIndex" or we construct it
 const ideaId = idea.id || `${idea.runId}-${idea.ideaIndex}`;
 // Normalize runId - remove "run_" prefix if present, but keep original for matching
 const runIdRaw = String(idea.runId || "");
 const runIdNormalized = runIdRaw.replace(/^run_/, "");
 const ideaIdFormatted = `run_${runIdNormalized}_idea_${idea.ideaIndex}`;
 // Also create canonical format: run_id::idea_index
 const canonicalId = `${runIdNormalized}::idea_${idea.ideaIndex}`;
 
 // Try all formats when looking up actions/notes (canonical, formatted, and original)
 // Also try with the raw runId in case it has "run_" prefix
 // For display: use actionsByIdeaId (excludes completed)
 const action = actionsByIdeaId.get(canonicalId) || 
                actionsByIdeaId.get(ideaIdFormatted) || 
                actionsByIdeaId.get(ideaId) ||
                (runIdRaw !== runIdNormalized ? actionsByIdeaId.get(`run_${runIdRaw}_idea_${idea.ideaIndex}`) : null);
 const note = notesByIdeaId.get(canonicalId) || 
              notesByIdeaId.get(ideaIdFormatted) || 
              notesByIdeaId.get(ideaId) ||
              (runIdRaw !== runIdNormalized ? notesByIdeaId.get(`run_${runIdRaw}_idea_${idea.ideaIndex}`) : null);
 
 // For active status check: use allActionsByIdeaId (includes all statuses)
 const hasActionForActive = !!(allActionsByIdeaId.get(canonicalId) || 
                                allActionsByIdeaId.get(ideaIdFormatted) || 
                                allActionsByIdeaId.get(ideaId) ||
                                (runIdRaw !== runIdNormalized ? allActionsByIdeaId.get(`run_${runIdRaw}_idea_${idea.ideaIndex}`) : null));
 
 return {
 idea_id: ideaIdFormatted, // Use standard format for compatibility
 hasAction: !!action, // For display purposes (excludes completed)
 hasNote: !!note,
 action: action || null,
 note: note || null,
 // Active status: has ANY action (any status) OR note
 isActive: hasActionForActive || !!note,
 // Store original idea data for reference
 _ideaData: idea,
 };
 });

 const allActiveIdeas = allIdeasList;

 // ---------------------------------------------------------------------------
 // FILTER STATE
 // ---------------------------------------------------------------------------

 const [showActiveOnly, setShowActiveOnly] = useState(false);

 // ---------------------------------------------------------------------------
 // STATISTICS CALCULATION
 // ---------------------------------------------------------------------------

 const stats = useMemo(() => {
  const total = allActiveIdeas.length;
  const withNotes = allActiveIdeas.filter(item => item.hasNote).length;
  const withActions = allActiveIdeas.filter(item => item.hasAction).length;
  const withBoth = allActiveIdeas.filter(item => item.hasNote && item.hasAction).length;
  const activeCount = allActiveIdeas.filter(item => item.isActive).length;
  
  return { total, withNotes, withActions, withBoth, activeCount };
 }, [allActiveIdeas]);

 // ---------------------------------------------------------------------------
 // SEARCH FILTER + ACTIVE FILTER + SORTING
 // ---------------------------------------------------------------------------

 const activeIdeas = useMemo(() => {
  let filtered = allActiveIdeas;

  // Apply active filter first (if enabled)
  // An idea is active if it has an action OR a note (in any status)
  if (showActiveOnly) {
   filtered = filtered.filter(item => item.isActive);
  }

  // Apply search filter
  if (searchQuery.trim()) {
   const query = searchQuery.toLowerCase().trim();
   const normalize = v => (v ? String(v).trim().toLowerCase() : "");

   filtered = filtered.filter(item => {
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
  }

  // Sort: active ideas (with notes/actions) first, then by recency
  filtered.sort((a, b) => {
   const aIsActive = a.isActive;
   const bIsActive = b.isActive;
   
   // Active ideas come first
   if (aIsActive && !bIsActive) return -1;
   if (!aIsActive && bIsActive) return 1;
   
   // Within same category, maintain original order (already sorted by run date)
   return 0;
  });

  return filtered;
 }, [allActiveIdeas, searchQuery, allIdeas, showActiveOnly]);

 const hasExploredIdeas = allRuns && allRuns.length > 0;

 // ---------------------------------------------------------------------------
 // CLEAN CARD COMPONENT (Local)
 // ---------------------------------------------------------------------------

 const IdeaCard = ({ item, ideaLink, projectName, run, ideaData }) => {
 const isSelected = selectedIdeas?.has(item.idea_id);
 const navigate = useNavigate();
 const isActive = item.isActive;

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
 <div 
  className={`subtle-card hover:shadow-md transition-all ${isSelected ? "border-default bg-surface" : ""} ${isActive ? "shadow-sm" : ""}`} 
  style={{ 
   padding: "8px 12px",
   borderLeft: isActive ? "4px solid var(--accent)" : undefined
  }}
 >
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
 <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
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
title="Has action item"
/>
)}

{!item.hasAction && item.hasNote && (
<div className="h-2 w-2 rounded-full" style={{ background: "var(--badge-info-bg)" }} title="Has note" />
)}

 <h4 className={WORKSPACE_TYPOGRAPHY.h4}>
 {projectName}
 </h4>

 {isActive && (
 <div className="flex items-center gap-1 ml-auto">
  {item.hasNote && (
   <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${WORKSPACE_TYPOGRAPHY.caption} font-medium`} style={{ background: "var(--badge-info-bg)", color: "var(--badge-info-text)" }}>
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
    Note
   </span>
  )}
  {item.hasAction && (
   <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${WORKSPACE_TYPOGRAPHY.caption} font-medium bg-surface border border-default text-secondary`}>
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    Task
   </span>
  )}
 </div>
 )}
 </div>

 {/* run metadata */}
 {run?.inputs && (
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} mb-1 leading-tight`}>
 Time: {run.inputs.time_commitment || "Not set"} • Budget:{" "}
 {run.inputs.budget_range || "Not set"} • Focus:{" "}
 {run.inputs.sub_interest_area ||
 run.inputs.interest_area ||
 "Unknown"}
 </p>
 )}
 
 {item.hasAction && (
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} leading-tight`}>{item.action.action_text}</p>
 )}
 
 {item.hasNote && (
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} italic leading-tight`}>
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

 <p className={`${WORKSPACE_TYPOGRAPHY.body} text-secondary max-w-sm mx-auto mb-6`}>
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
 <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
 <div className="flex items-center gap-4 flex-wrap">
  <h3 className={`${WORKSPACE_TYPOGRAPHY.h3} text-primary`}>
   {showActiveOnly ? `Active Ideas (${activeIdeas.length})` : `All Ideas (${activeIdeas.length})`}
  </h3>
  
  {/* Summary Statistics */}
  {!showActiveOnly && (
   <div className={`flex items-center gap-2 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
    {stats.activeCount > 0 && (
     <>
      <span className="text-accent font-medium">{stats.activeCount} active</span>
      {stats.withNotes > 0 && (
       <>
        <span>•</span>
        <span>{stats.withNotes} with notes</span>
       </>
      )}
      {stats.withActions > 0 && (
       <>
        <span>•</span>
        <span>{stats.withActions} with actions</span>
       </>
      )}
     </>
    )}
   </div>
  )}
 </div>

 <div className="flex items-center gap-2 flex-wrap">
  {/* Show Active Only Toggle Button */}
  <UIButton
   variant={showActiveOnly ? "primary" : "secondary"}
   size="sm"
   onClick={() => setShowActiveOnly(prev => !prev)}
   className="whitespace-nowrap"
  >
   {showActiveOnly ? "Show All" : "Show Active Only"}
  </UIButton>

  {selectedIdeas?.size >= 2 && (
   <UIButton
    variant="primary"
    onClick={() => performComparison(selectedIdeas)}
    disabled={comparing}
    size="sm"
   >
    {comparing ? "Comparing..." : `Compare (${selectedIdeas.size})`}
   </UIButton>
  )}
 </div>
 </div>

 {activeIdeas.length === 0 ? (
 <div className={`text-center ${WORKSPACE_TYPOGRAPHY.body} text-secondary py-8`}>
  {showActiveOnly 
   ? "No active ideas. Ideas with notes or actions will appear here."
   : "No ideas match your search."}
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
 ideaLink = `/dashboard/recommendations/${ideaIndex}?id=${runIdNormalized}`;
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
  ideaLink = `/dashboard/recommendations/${idx}?id=${runIdNormalized}`;
  
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
