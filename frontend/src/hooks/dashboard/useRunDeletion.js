import { useCallback } from "react";
import { normalizeRunId } from "../../utils/runs.js";

const STORAGE_KEY = "sia_saved_runs";

/**
 * Custom hook to handle run deletion with confirmation
 * 
 * @param {Array} allIdeas - All extracted ideas
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} deleteRunFromContext - Function to delete run from context
 * @param {Function} loadDashboardData - Function to reload dashboard data
 * @param {Function} loadRuns - Function to load runs from localStorage
 * @param {Function} setRuns - State setter for runs
 * @param {Function} setAllIdeas - State setter for ideas
 * @param {Function} setApiRuns - State setter for API runs
 * @returns {Function} handleDeleteRun - Function to delete a run
 */
export function useRunDeletion({
  allIdeas,
  isAuthenticated,
  deleteRunFromContext,
  loadDashboardData,
  loadRuns,
  setRuns,
  setAllIdeas,
  setApiRuns
}) {
  const handleDeleteRun = useCallback(async (session) => {
    // Extract runId - try multiple possible fields
    const runId = session.run_id || session.id || session.runId;
    if (!runId) {
      alert("Error: Cannot identify session to delete.");
      return;
    }
    
    const normalizedRunId = normalizeRunId(runId);
    
    // Count ideas associated with this run
    const associatedIdeas = allIdeas.filter(idea => {
      const ideaRunId = normalizeRunId(idea.runId || "");
      return ideaRunId === normalizedRunId;
    });
    
    const ideaCount = associatedIdeas.length;
    
    // Show warning dialog
    const warningMessage = ideaCount > 0
      ? `This will permanently delete this discovery session and all ${ideaCount} associated idea${ideaCount > 1 ? 's' : ''}. This action cannot be undone.\n\nAre you sure you want to continue?`
      : `This will permanently delete this discovery session. This action cannot be undone.\n\nAre you sure you want to continue?`;
    
    if (!window.confirm(warningMessage)) {
      return; // User cancelled
    }
    
    try {
      // Immediately filter out ideas from this run before deletion
      setAllIdeas(prevIdeas => {
        return prevIdeas.filter(idea => {
          const ideaRunId = normalizeRunId(idea.runId || "");
          return ideaRunId !== normalizedRunId;
        });
      });
      
      // Also immediately remove from apiRuns if it's there
      if (isAuthenticated) {
        setApiRuns(prevRuns => {
          return prevRuns.filter(r => {
            const rId = normalizeRunId(r.run_id || "");
            return rId !== normalizedRunId;
          });
        });
      }
      
      // Delete via API if authenticated, otherwise use localStorage
      await deleteRunFromContext(runId, isAuthenticated);
      
      // Reload dashboard data to refresh the list (this will also re-extract ideas from remaining runs)
      if (isAuthenticated) {
        await loadDashboardData();
      } else {
        // Reload localStorage runs
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const filtered = parsed.filter(r => !r.validation_id && r.overall_score === undefined);
            setRuns(filtered);
          } catch (err) {
            console.error("Failed to parse runs:", err);
          }
        } else {
          setRuns([]);
        }
      }
    } catch (error) {
      const errorMessage = error?.message || error?.detail || "Unknown error";
      const errorStatus = error?.status || "N/A";
      alert(`Failed to delete discovery session.\n\nError: ${errorMessage}\nStatus: ${errorStatus}`);
      
      // On error, reload data to restore correct state
      if (isAuthenticated) {
        await loadDashboardData();
      } else {
        loadRuns();
      }
    }
  }, [allIdeas, isAuthenticated, deleteRunFromContext, loadDashboardData, loadRuns, setRuns, setAllIdeas, setApiRuns]);

  return handleDeleteRun;
}

