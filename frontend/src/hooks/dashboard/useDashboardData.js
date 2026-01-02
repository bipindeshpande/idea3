import { useCallback } from "react";
import { fetchUserActivity, fetchDashboard, fetchStats } from "../../services/dashboard/dashboardService.js";

/**
 * Custom hook for loading dashboard data
 * Handles API calls for runs, validations, actions, notes, and insights
 * 
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {Function} getAuthHeaders - Function to get auth headers
 * @param {Function} setApiRuns - Setter for API runs state
 * @param {Function} setApiValidations - Setter for API validations state
 * @param {Function} setActions - Setter for actions state
 * @param {Function} setNotes - Setter for notes state
 * @param {Function} setInsights - Setter for insights state
 * @param {Function} setLoadingRuns - Setter for loading runs state
 * @param {Function} setLoadingActions - Setter for loading actions state
 * @param {Function} setLoadingNotes - Setter for loading notes state
 * @returns {Function} loadDashboardData function
 */
export function useDashboardData({
  isAuthenticated,
  getAuthHeaders,
  setApiRuns,
  setApiValidations,
  setActions,
  setNotes,
  setInsights,
  setLoadingRuns,
  setLoadingActions,
  setLoadingNotes
}) {
  const loadDashboardData = useCallback(async () => {
    setLoadingRuns(true);
    setLoadingActions(true);
    setLoadingNotes(true);

    try {
      if (isAuthenticated) {
        // Clear old cache data
        localStorage.removeItem("sia_validations");
        localStorage.removeItem("revalidate_data");

        const headers = getAuthHeaders();

        // Fetch activity (runs and validations)
        try {
          const activity = await fetchUserActivity(100, headers);
          setApiRuns(activity.runs);
          setApiValidations(activity.validations);
        } catch (error) {
          console.error("Failed to fetch activity:", error);
        }

        // Fetch dashboard (actions, notes, and fallback activity)
        try {
          const dashboard = await fetchDashboard(headers);
          // Only update if we don't already have runs from activity endpoint
          setApiRuns(prev => (prev.length ? prev : dashboard.runs));
          setApiValidations(prev =>
            prev.length ? prev : dashboard.validations
          );
          setActions(dashboard.actions);
          setNotes(dashboard.notes);
        } catch (error) {
          console.error("Failed to fetch dashboard:", error);
        }

        // Fetch stats/insights (optional, don't fail if it errors)
        const insights = await fetchStats(headers);
        if (insights) {
          setInsights(insights);
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoadingRuns(false);
      setLoadingActions(false);
      setLoadingNotes(false);
    }
  }, [
    isAuthenticated,
    getAuthHeaders,
    setApiRuns,
    setApiValidations,
    setActions,
    setNotes,
    setInsights,
    setLoadingRuns,
    setLoadingActions,
    setLoadingNotes
  ]);

  return loadDashboardData;
}


