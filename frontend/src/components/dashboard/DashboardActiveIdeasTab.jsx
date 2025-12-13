import { Link } from "react-router-dom";
import { memo, useMemo } from "react";

function DashboardActiveIdeasTab({
  actions,
  notes,
  loadingActions,
  loadingNotes,
  allRuns,
  allValidations,
  searchQuery = "",
  allIdeas = [],
}) {
  // Get ideas with non-completed actions
  const ideaActions = actions.filter((a) => {
    if (a.status === "completed") return false;
    if (!a.idea_id) return false;
    return a.idea_id.match(/run_([^_]+)_idea_(\d+)/) || 
           a.idea_id.match(/idea_(\d+)/) ||
           (a.idea_id.match(/run_([^_]+)/) && !a.idea_id.match(/val_/));
  });
  
  // Get ideas with notes
  const ideaNotes = notes.filter((n) => {
    if (!n.idea_id) return false;
    return n.idea_id.match(/run_([^_]+)_idea_(\d+)/) || 
           n.idea_id.match(/idea_(\d+)/) ||
           (n.idea_id.match(/run_([^_]+)/) && !n.idea_id.match(/val_/));
  });
  
  // Combine and deduplicate by idea_id
  const ideaIdsWithActions = new Set(ideaActions.map(a => a.idea_id));
  const ideaIdsWithNotes = new Set(ideaNotes.map(n => n.idea_id));
  const allActiveIdeaIds = new Set([...ideaIdsWithActions, ...ideaIdsWithNotes]);
  
  // Create a map of idea_id to display info
  const activeIdeasMap = new Map();
  
  // Process actions
  ideaActions.forEach(action => {
    if (!activeIdeasMap.has(action.idea_id)) {
      activeIdeasMap.set(action.idea_id, {
        idea_id: action.idea_id,
        hasAction: true,
        hasNote: false,
        action: action,
        note: null,
      });
    } else {
      const existing = activeIdeasMap.get(action.idea_id);
      existing.hasAction = true;
      existing.action = action;
    }
  });
  
  // Process notes
  ideaNotes.forEach(note => {
    if (!activeIdeasMap.has(note.idea_id)) {
      activeIdeasMap.set(note.idea_id, {
        idea_id: note.idea_id,
        hasAction: false,
        hasNote: true,
        action: null,
        note: note,
      });
    } else {
      const existing = activeIdeasMap.get(note.idea_id);
      existing.hasNote = true;
      existing.note = note;
    }
  });
  
  const allActiveIdeas = Array.from(activeIdeasMap.values());
  
  // Filter active ideas based on search query
  const activeIdeas = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 1) {
      return allActiveIdeas;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const normalizeString = (val) => {
      if (val === null || val === undefined) return "";
      return String(val).trim();
    };
    
    return allActiveIdeas.filter(item => {
      const ideaId = item.idea_id;
      let matches = false;
      
      // Match against action text
      if (item.hasAction && item.action?.action_text) {
        const actionText = normalizeString(item.action.action_text).toLowerCase();
        if (actionText.includes(query)) {
          matches = true;
        }
      }
      
      // Match against note content
      if (item.hasNote && item.note?.content) {
        const noteContent = normalizeString(item.note.content).toLowerCase();
        if (noteContent.includes(query)) {
          matches = true;
        }
      }
      
      // Match against idea title and summary from allIdeas
      if (ideaId && allIdeas.length > 0) {
        // Extract runId and ideaIndex from idea_id
        const runMatch = ideaId.match(/run_([^_]+)_idea_(\d+)/);
        if (runMatch) {
          const [, runId, ideaIndex] = runMatch;
          // Find matching idea in allIdeas
          const matchingIdea = allIdeas.find(idea => {
            const ideaRunId = String(idea.runId || '').replace(/^run_/, '');
            const ideaIdx = String(idea.ideaIndex || '');
            return ideaRunId === runId && ideaIdx === ideaIndex;
          });
          
          if (matchingIdea) {
            const title = normalizeString(matchingIdea.title).toLowerCase();
            const summary = normalizeString(matchingIdea.summary).toLowerCase();
            if (title.includes(query) || summary.includes(query)) {
              matches = true;
            }
          }
        } else {
          // Try matching with just idea index
          const ideaMatch = ideaId.match(/idea_(\d+)/);
          if (ideaMatch) {
            const ideaIndex = ideaMatch[1];
            const matchingIdea = allIdeas.find(idea => {
              const ideaIdx = String(idea.ideaIndex || '');
              return ideaIdx === ideaIndex;
            });
            
            if (matchingIdea) {
              const title = normalizeString(matchingIdea.title).toLowerCase();
              const summary = normalizeString(matchingIdea.summary).toLowerCase();
              if (title.includes(query) || summary.includes(query)) {
                matches = true;
              }
            }
          }
        }
      }
      
      // Match against run inputs (founder_ambition, industry, etc.)
      if (ideaId) {
        const runMatch = ideaId.match(/run_([^_]+)/);
        if (runMatch) {
          const runId = runMatch[1];
          const run = allRuns.find(r => {
            const rRunId = String(r.run_id || r.id || '').replace(/^run_/, '');
            return rRunId === runId;
          });
          
          if (run?.inputs) {
            const founderAmbition = normalizeString(run.inputs.founder_ambition).toLowerCase();
            const industryInterest = normalizeString(run.inputs.industry_interest).toLowerCase();
            const subInterest = normalizeString(run.inputs.sub_interest_area).toLowerCase();
            const goalType = normalizeString(run.inputs.goal_type).toLowerCase();
            
            if (founderAmbition.includes(query) || 
                industryInterest.includes(query) || 
                subInterest.includes(query) ||
                goalType.includes(query)) {
              matches = true;
            }
          }
        }
      }
      
      return matches;
    });
  }, [allActiveIdeas, searchQuery, allIdeas, allRuns]);
  
  // Get validations with non-completed actions
  const validationActions = actions.filter((a) => {
    if (a.status === "completed") return false;
    if (!a.idea_id) return false;
    return a.idea_id.match(/val_(.+)/);
  });
  
  // Get validations with notes
  const validationNotes = notes.filter((n) => {
    if (!n.idea_id) return false;
    return n.idea_id.match(/val_(.+)/);
  });
  
  // Combine and deduplicate by idea_id
  const validationIdsWithActions = new Set(validationActions.map(a => a.idea_id));
  const validationIdsWithNotes = new Set(validationNotes.map(n => n.idea_id));
  const allActiveValidationIds = new Set([...validationIdsWithActions, ...validationIdsWithNotes]);
  
  // Create a map of idea_id to display info
  const activeValidationsMap = new Map();
  
  // Process actions
  validationActions.forEach(action => {
    if (!activeValidationsMap.has(action.idea_id)) {
      activeValidationsMap.set(action.idea_id, {
        idea_id: action.idea_id,
        hasAction: true,
        hasNote: false,
        action: action,
        note: null,
      });
    } else {
      const existing = activeValidationsMap.get(action.idea_id);
      existing.hasAction = true;
      existing.action = action;
    }
  });
  
  // Process notes
  validationNotes.forEach(note => {
    if (!activeValidationsMap.has(note.idea_id)) {
      activeValidationsMap.set(note.idea_id, {
        idea_id: note.idea_id,
        hasAction: false,
        hasNote: true,
        action: null,
        note: note,
      });
    } else {
      const existing = activeValidationsMap.get(note.idea_id);
      existing.hasNote = true;
      existing.note = note;
    }
  });
  
  const activeValidations = Array.from(activeValidationsMap.values());

  // Check if user has explored ideas (has any runs)
  const hasExploredIdeas = allRuns && allRuns.length > 0;

  return (
    <div className="space-y-6">
      {/* Ideas Active Projects */}
      {!hasExploredIdeas ? (
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
          <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto text-2xl">
            💡
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No active ideas yet
          </h3>
          <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
            Ideas with actions or notes appear here as you explore or validate ideas.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/advisor"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              Discover ideas
            </Link>
            <span className="text-slate-400">•</span>
            <Link
              to="/validate-idea"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
            >
              Validate an idea
            </Link>
          </div>
        </div>
      ) : activeIdeas.length > 0 ? (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Active Ideas ({activeIdeas.length})
              {searchQuery && searchQuery.trim().length > 0 && (
                <span className="text-sm font-normal text-gray-500 dark:text-slate-400 ml-2">
                  (filtered by "{searchQuery}")
                </span>
              )}
            </h3>
          </div>
          {loadingActions || loadingNotes ? (
            <p className="text-sm text-gray-600 dark:text-slate-300">Loading...</p>
          ) : activeIdeas.length === 0 ? (
            <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
              <p className="text-[15px] text-gray-700 leading-relaxed">
                No active ideas match your search "{searchQuery}".
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeIdeas.slice(0, 10).map((item) => {
                let projectName = "Unknown Project";
                let ideaLink = null;
                let run = null;
                let ideaIndex = null;
                const ideaId = item.idea_id;
                
                if (ideaId) {
                  const runMatch = ideaId.match(/run_([^_]+)_idea_(\d+)/);
                  if (runMatch) {
                    const [, runId, idx] = runMatch;
                    ideaIndex = idx;
                    run = allRuns.find(r => r.run_id === runId || r.id === runId || r.id === `run_${runId}`);
                    if (run?.inputs?.goal_type) {
                      projectName = `${run.inputs.goal_type} - Idea #${ideaIndex}`;
                    } else {
                      projectName = `Idea #${ideaIndex}`;
                    }
                    const actualRunId = run?.run_id || run?.id || runId;
                    ideaLink = `/results/recommendations/${ideaIndex}?id=${actualRunId}`;
                  } else {
                    const ideaMatch = ideaId.match(/idea_(\d+)/);
                    if (ideaMatch) {
                      ideaIndex = ideaMatch[1];
                      projectName = `Idea #${ideaIndex}`;
                      run = allRuns.find(r => {
                        const runIdStr = r.run_id || r.id;
                        return ideaId.includes(`run_${runIdStr}_idea_`);
                      });
                      if (run) {
                        const actualRunId = run.run_id || run.id;
                        ideaLink = `/results/recommendations/${ideaIndex}?id=${actualRunId}`;
                      } else {
                        ideaLink = `/results/recommendations/${ideaIndex}`;
                      }
                    }
                  }
                }
                
                const cardContent = (
                  <>
                    <div className="mb-2 flex items-center gap-2">
                      {item.hasAction && item.action && (
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            item.action.status === "completed"
                              ? "bg-green-500"
                              : item.action.status === "in_progress"
                              ? "bg-yellow-500"
                              : item.action.status === "blocked"
                              ? "bg-red-500"
                              : "bg-slate-400"
                          }`}
                        />
                      )}
                      {!item.hasAction && item.hasNote && (
                        <div className="h-2 w-2 rounded-full flex-shrink-0 bg-purple-500" />
                      )}
                      <h4 className="text-lg font-semibold text-gray-900 truncate flex-1">
                        {projectName}
                      </h4>
                      {item.hasAction && item.action && (
                        <span className="text-sm text-gray-600 capitalize flex-shrink-0">
                          {item.action.status.replace("_", " ")}
                        </span>
                      )}
                      {item.hasNote && (
                        <span className="text-sm text-purple-600 flex-shrink-0">
                          📝 Note
                        </span>
                      )}
                    </div>
                    {run?.inputs && Object.keys(run.inputs).length > 0 && (
                      <p className="mb-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                        Time: {run.inputs.time_commitment || "Not set"} • Budget: {run.inputs.budget_range || "Not set"} • Focus:{" "}
                        {run.inputs.sub_interest_area || run.inputs.interest_area || "Not captured"} • Skill:{" "}
                        {run.inputs.skill_strength || "Not captured"}
                      </p>
                    )}
                    {item.hasAction && item.action && (
                      <p className="text-[15px] text-gray-700 dark:text-slate-300">
                        {item.action.action_text}
                      </p>
                    )}
                    {item.hasNote && item.note && (
                      <p className="text-[15px] text-gray-700 dark:text-slate-300 italic">
                        {item.note.content.length > 100 
                          ? item.note.content.substring(0, 100) + "..." 
                          : item.note.content}
                      </p>
                    )}
                  </>
                );
                
                return ideaLink ? (
                  <Link
                    key={item.idea_id}
                    to={ideaLink}
                    className="block rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 transition-all duration-200 hover:border-indigo-400 hover:shadow-md cursor-pointer"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div key={item.idea_id} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm">
                    {cardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : hasExploredIdeas ? (
        // User has explored ideas but none have actions/notes yet
        <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Active Ideas
          </h3>
          <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
            Ideas you explore will appear here.
          </p>
        </div>
      ) : null}

      {/* Validations Active Projects */}
      {activeValidations.length > 0 && (
        <div className="mt-16">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Active Validations ({activeValidations.length})
            </h3>
          </div>
          {loadingActions || loadingNotes ? (
            <p className="text-sm text-gray-600 dark:text-slate-300">Loading...</p>
          ) : (
            <div className="space-y-4">
              {activeValidations.slice(0, 10).map((item) => {
                let projectName = "Unknown Validation";
                let validationLink = null;
                if (item.idea_id) {
                  const valMatch = item.idea_id.match(/val_(.+)/);
                  if (valMatch) {
                    const validationId = valMatch[1];
                    const validation = allValidations.find(v => v.validation_id === validationId);
                    if (validation?.idea_explanation) {
                      projectName = validation.idea_explanation.length > 40 
                        ? validation.idea_explanation.substring(0, 40) + "..." 
                        : validation.idea_explanation;
                    } else {
                      projectName = "Validation";
                    }
                    validationLink = `/validate-result?id=${validationId}`;
                  }
                }
                
                const validationCardContent = (
                  <>
                    <div className="mb-1.5 flex items-center gap-2">
                      {item.hasAction && item.action && (
                        <div
                          className={`h-2 w-2 rounded-full flex-shrink-0 ${
                            item.action.status === "completed"
                              ? "bg-green-500"
                              : item.action.status === "in_progress"
                              ? "bg-yellow-500"
                              : item.action.status === "blocked"
                              ? "bg-red-500"
                              : "bg-slate-400"
                          }`}
                        />
                      )}
                      {!item.hasAction && item.hasNote && (
                        <div className="h-2 w-2 rounded-full flex-shrink-0 bg-purple-500" />
                      )}
                      <span className="text-lg font-semibold text-gray-900 truncate flex-1">
                        {projectName}
                      </span>
                      {item.hasAction && item.action && (
                        <span className="ml-auto text-sm text-gray-600 capitalize flex-shrink-0">
                          {item.action.status.replace("_", " ")}
                        </span>
                      )}
                      {item.hasNote && (
                        <span className="ml-auto text-sm text-purple-600 flex-shrink-0">
                          📝 Note
                        </span>
                      )}
                    </div>
                    {item.hasAction && item.action && (
                      <p className="text-[15px] text-gray-700 dark:text-slate-300">
                        {item.action.action_text}
                      </p>
                    )}
                    {item.hasNote && item.note && (
                      <p className="text-[15px] text-gray-700 dark:text-slate-300 italic">
                        {item.note.content.length > 100 
                          ? item.note.content.substring(0, 100) + "..." 
                          : item.note.content}
                      </p>
                    )}
                  </>
                );
                
                return validationLink ? (
                  <Link
                    key={item.idea_id}
                    to={validationLink}
                    className="block rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 transition-all duration-200 hover:border-indigo-400 hover:shadow-md cursor-pointer"
                  >
                    {validationCardContent}
                  </Link>
                ) : (
                  <div key={item.idea_id} className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-7 shadow-sm">
                    {validationCardContent}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(DashboardActiveIdeasTab);

