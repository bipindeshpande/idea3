import { Link, useNavigate } from "react-router-dom";
import React from "react";
import UIButton from "../ui/ui-button.jsx";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

function SessionCard({ 
 session, 
 hasOpenActions, 
 hasNotes, 
 onDelete, 
 onEdit,
 isValidation = false,
 selectedIdeas,
 setSelectedIdeas
}) {
 const navigate = useNavigate();
 if (!session) return null;

 // Handle normalized backend format (has idea_title, summary, run_type, created_at)
 // or frontend format (has timestamp, inputs, run_id)
 // Also check sections array for structured recommendations
 const hasNormalizedFormat = session.idea_title !== undefined || session.run_type !== undefined;
 
 // Extract title from multiple possible sources
 const idea_title = hasNormalizedFormat 
 ? (session.idea_title || session.sections?.[0]?.title || "")
 : (session.inputs?.goal_type || session.sections?.[0]?.title || "Idea Discovery Session");
 
 // Extract summary from multiple possible sources
 const summary = hasNormalizedFormat 
 ? (session.summary || session.sections?.[0]?.summary || "")
 : (session.sections?.[0]?.summary || "");
 
 const created_at = hasNormalizedFormat 
 ? session.created_at 
 : (session.timestamp ? new Date(session.timestamp).toISOString() : null);
 const run_type = hasNormalizedFormat ? session.run_type : (isValidation ? "validation" : "discovery");
 const timestamp = session.timestamp || (created_at ? new Date(created_at).getTime() : Date.now());

 const isSelected = selectedIdeas && session.id && selectedIdeas.has(session.id);
 
 return (
 <article className="ui-card group relative rounded-xl transition-all duration-300 hover:shadow-md" style={{ padding: '13.6px 17px', overflow: 'visible' }}>
 <div className="flex items-start justify-between gap-4">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 <p className={WORKSPACE_TYPOGRAPHY.caption}>
 {new Date(timestamp).toLocaleString()}
 {session.from_api && (
 <span className={`ml-2 ${WORKSPACE_TYPOGRAPHY.caption} text-accent font-medium`}>
 (Synced)
 </span>
 )}
 </p>
 {(hasOpenActions || hasNotes) && (
 <div className="flex items-center gap-1">
 {hasOpenActions && (
 <span 
 className={`inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 ${WORKSPACE_TYPOGRAPHY.caption} font-semibold text-accent`}
 title="Has open action items"
 >
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 Tasks
 </span>
 )}
 {hasNotes && (
 <span 
 className={`badge-info inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${WORKSPACE_TYPOGRAPHY.caption} font-semibold`}
 title="Has notes"
 >
 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 Notes
 </span>
 )}
 </div>
 )}
 </div>
 
 {isValidation ? (
 <>
 <h4 className={`${WORKSPACE_TYPOGRAPHY.h4} mt-1 mb-3`}>
  {(() => {
   // Priority 1: Use solution text from category_answers (this is what's displayed in the card body)
   // This should be the full descriptive text, not a dropdown value
   const solutionText = session.category_answers?.solution;
   if (solutionText) {
    const solution = String(solutionText).trim();
    // Use it if it's meaningful (longer than 3 chars and not just numbers/spaces)
    if (solution.length >= 3 && !/^[\d\s\-]+$/.test(solution)) {
     // Extract first sentence or truncate
     const firstSentence = solution.split(/[.!?]/)[0].trim();
     if (firstSentence && firstSentence.length >= 3 && firstSentence.length <= 120) {
      return firstSentence;
     }
     return solution.length > 100 ? solution.substring(0, 100) + "..." : solution;
    }
   }
   
   // Priority 2: Use problem text from category_answers
   const problemText = session.category_answers?.problem;
   if (problemText) {
    const problem = String(problemText).trim();
    if (problem.length >= 3 && !/^[\d\s\-]+$/.test(problem)) {
     const firstSentence = problem.split(/[.!?]/)[0].trim();
     if (firstSentence && firstSentence.length >= 3 && firstSentence.length <= 120) {
      return firstSentence;
     }
     return problem.length > 100 ? problem.substring(0, 100) + "..." : problem;
    }
   }
   
   // Priority 3: Use idea_explanation (the full text description)
   if (session.idea_explanation) {
    const explanation = String(session.idea_explanation).trim();
    if (explanation.length >= 3 && !/^[\d\s\-]+$/.test(explanation)) {
     const firstSentence = explanation.split(/[.!?]/)[0].trim();
     if (firstSentence && firstSentence.length >= 3 && firstSentence.length <= 120) {
      return firstSentence;
     }
     return explanation.length > 100 ? explanation.substring(0, 100) + "..." : explanation;
    }
   }
   
   // Priority 4: Build descriptive title from dropdowns (solution_type + industry)
   if (session.category_answers) {
    const parts = [];
    const solutionType = session.category_answers.solution_type;
    const industry = session.category_answers.industry;
    
    // Use solution_type if it's meaningful text (not just "1")
    if (solutionType) {
     const st = String(solutionType).trim();
     if (st.length >= 3 && !/^[\d]+$/.test(st)) {
      parts.push(st);
     }
    }
    // Use industry if available
    if (industry) {
     const ind = String(industry).trim();
     if (ind.length >= 2 && !/^[\d]+$/.test(ind)) {
      parts.push(ind);
     }
    }
    if (parts.length > 0) {
     return parts.join(" - ");
    }
   }
   
   // Priority 5: Try to get any meaningful text from validation_result.details
   if (session.validation_result?.details && typeof session.validation_result.details === 'object') {
    const details = session.validation_result.details;
    // Look for any detail with substantial text content
    for (const [key, value] of Object.entries(details)) {
     if (typeof value === 'string') {
      const text = value.trim();
      if (text.length >= 20 && !/^[\d\s\-]+$/.test(text)) {
       return text.length > 100 ? text.substring(0, 100) + "..." : text;
      }
     }
    }
   }
   
   // Last resort: Show validation ID (this should be unique)
   const id = session.validation_id || session.id;
   return id ? `Validation ${String(id).substring(0, 8)}` : "Idea Validation";
  })()}
 </h4>
 {session.category_answers && Object.keys(session.category_answers).length > 0 && (
 <div className="space-y-3 mt-3">
 {session.category_answers.problem && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>1. Problem:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.problem}</p>
 </div>
 )}
 {session.category_answers.solution && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>2. Solution:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.solution}</p>
 </div>
 )}
 {session.category_answers.target_user && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>3. User:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.target_user}</p>
 </div>
 )}
 {session.category_answers.differentiation && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>4. Differentiation:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.differentiation}</p>
 </div>
 )}
 {session.category_answers.monetization && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>5. Monetization:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.monetization}</p>
 </div>
 )}
 {session.category_answers.scope && (
 <div>
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} font-semibold mb-1`}>6. Scope/Region:</p>
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.category_answers.scope}</p>
 </div>
 )}
 </div>
 )}
 {(!session.category_answers || Object.keys(session.category_answers).length === 0) && session.idea_explanation && (
 <div className="mt-2">
 <p className={WORKSPACE_TYPOGRAPHY.bodySmall}>{session.idea_explanation}</p>
 </div>
 )}
 </>
 ) : (
 <>
 <h3 className={`${WORKSPACE_TYPOGRAPHY.h3} mt-1`}>
 {idea_title || (session.inputs?.goal_type 
 ? `${session.inputs.goal_type}${session.inputs.interest_area || session.inputs.sub_interest_area ? ` - ${session.inputs.interest_area || session.inputs.sub_interest_area}` : ""}`
 : "Idea Discovery Session")}
 </h3>
 {summary && (
 <p className={`${WORKSPACE_TYPOGRAPHY.subtitle} mt-2 line-clamp-3`}>{summary}</p>
 )}
 {session.inputs && Object.keys(session.inputs).length > 0 && !hasNormalizedFormat ? (
 <div className="mt-2">
 <p className={WORKSPACE_TYPOGRAPHY.subtitle}>
 <span className="font-medium">Time:</span> {session.inputs.time_commitment || "Not set"} • 
 <span className="font-medium"> Budget:</span> {session.inputs.budget_range || "Not set"} • 
 <span className="font-medium"> Focus:</span>{" "}
 {session.inputs.sub_interest_area || session.inputs.interest_area || "Not captured"} • 
 <span className="font-medium"> Skill:</span>{" "}
 {session.inputs.skill_strength || "Not captured"}
 </p>
 </div>
 ) : hasNormalizedFormat ? (
 <div className="mt-2">
 <p className={WORKSPACE_TYPOGRAPHY.caption}>
 Type: {run_type} • {session.run_id ? `Run ID: ${session.run_id}` : ""}
 </p>
 </div>
 ) : session.run_id ? (
 <div className="mt-2">
 <p className={`${WORKSPACE_TYPOGRAPHY.caption} italic`}>
 Run ID: {session.run_id}
 </p>
 </div>
 ) : null}
 </>
 )}
 </div>
 
 <div className="flex flex-col items-end gap-2 flex-shrink-0">
 <div className="flex items-center gap-2">
 {selectedIdeas && setSelectedIdeas && (
 <div className="relative group" style={{ zIndex: 50 }}>
 <input
 type="checkbox"
 checked={isSelected || false}
 onChange={(e) => {
 e.stopPropagation();
 const newSet = new Set(selectedIdeas);
 if (newSet.has(session.id)) {
 newSet.delete(session.id);
 } else {
 if (newSet.size >= 5) {
 alert("Maximum 5 items can be compared at once");
 return;
 }
 newSet.add(session.id);
 }
 setSelectedIdeas(newSet);
 }}
 className="h-4 w-4 rounded border-default text-accent cursor-pointer"
 title="Select for comparison"
 />
 <span className={`absolute -top-10 right-0 bg-surface border border-default rounded px-2 py-1 ${WORKSPACE_TYPOGRAPHY.caption} whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg`} style={{ zIndex: 100 }}>
 Select for comparison
 </span>
 </div>
 )}
 {isValidation && session.overall_score !== undefined && (
 <div className="px-2 py-1 rounded border border-default bg-surface">
 <p className={`${WORKSPACE_TYPOGRAPHY.bodySmall} font-semibold whitespace-nowrap`}>
 Score: {session.overall_score.toFixed(1)}/10
 </p>
 </div>
 )}
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 {onEdit && (
 <UIButton
 variant="action"
 size="sm"
 onClick={() => onEdit(session)}
 className="whitespace-nowrap"
 >
 Edit
 </UIButton>
 )}
 
 {isValidation ? (
 <UIButton
 as={Link}
 to={`/validate-result?id=${session.validation_id || session.id}`}
 variant="action"
 size="sm"
 className="whitespace-nowrap"
 >
 View
 </UIButton>
 ) : (
 <>
              <UIButton
                as={Link}
                to={`/dashboard/profile?id=${session.run_id || session.id}`}
                variant="action"
                size="sm"
                className="whitespace-nowrap"
              >
                View profile
 </UIButton>
 <UIButton
 variant="action"
 size="sm"
 onClick={() => {
 // Pass full run data through navigation state to prevent re-computation
                navigate("/dashboard/recommendations", {
 state: { 
 run: session,
 runId: session.run_id || session.id
 } 
 });
 }}
 className="whitespace-nowrap"
 >
 View recommendations
 </UIButton>
 </>
 )}
 
 {onDelete && (
 <UIButton
 variant="action"
 size="sm"
 onClick={() => onDelete(session)}
 className="whitespace-nowrap"
 >
 Delete
 </UIButton>
 )}
 </div>
 </div>
 </div>
 </article>
 );
}

export default React.memo(SessionCard);

