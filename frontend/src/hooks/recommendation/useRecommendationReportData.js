import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Custom hook for managing recommendation report data loading and caching
 */
export function useRecommendationReportData(reports, inputs, loadRunById, currentRunId, loadFromRecentDiscoveryCache) {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const runId = query.get("id");
  
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedFromCacheRef = useRef(false);

  // Check for cached run data from navigation state (from Past Sessions)
  const cachedRun = location.state?.run;
  const cachedRecommendations = location.state?.recommendations || cachedRun?.reports || cachedRun?.outputs;
  const cachedIdeas = location.state?.allIdeas || cachedRun?.reports?.recommendations_structured || cachedRun?.outputs?.recommendations_structured;

  // Get cached reports from localStorage if needed
  const getCachedReportsFromLocalStorage = () => {
    if (cachedRecommendations || reports) {
      return null; // Already have reports, no need to check localStorage
    }
    try {
      const recentDiscovery = localStorage.getItem("recentDiscovery");
      if (recentDiscovery) {
        const parsed = JSON.parse(recentDiscovery);
        if (parsed.reports && parsed.reports.personalized_recommendations) {
          return parsed.reports;
        }
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  };

  const localStorageReports = getCachedReportsFromLocalStorage();
  const effectiveReports = cachedRecommendations || reports || localStorageReports;
  const effectiveInputs = location.state?.inputs || inputs;

  useEffect(() => {
    // PRIORITY 0: If we have cached run from navigation state (from Past Sessions), use it immediately
    // This prevents ALL API calls and LLM computations
    if (cachedRun) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[RecommendationsReport] Using cached run from navigation state, skipping ALL API/LLM calls", {
          runId: cachedRun.run_id || cachedRun.id,
          hasReports: !!cachedRun.reports,
          hasOutputs: !!cachedRun.outputs
        });
      }
      
      setIsLoading(false);
      hasLoadedFromCacheRef.current = true;
      return; // CRITICAL: Exit early - do NOT trigger any API calls
    }

    // CRITICAL: If we already have effectiveReports (from any source), never call API
    if (effectiveReports && effectiveReports.personalized_recommendations) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[RecommendationsReport] Already have reports, skipping API call", {
          hasCachedRecommendations: !!cachedRecommendations,
          hasReports: !!reports,
          hasLocalStorageReports: !!localStorageReports
        });
      }
      setIsLoading(false);
      hasLoadedFromCacheRef.current = true;
      return;
    }

    // If we've already processed this runId, don't run again
    if (hasLoadedFromCacheRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Priority 1: Use cached recommendations from navigation state
    if (cachedRecommendations && cachedRecommendations.personalized_recommendations) {
      hasLoadedFromCacheRef.current = true;
      setIsLoading(false);
      return;
    }

    // Priority 2: Check localStorage for recent discovery
    if (!runId) {
      const cachedReports = loadFromRecentDiscoveryCache();
      if (cachedReports && cachedReports.personalized_recommendations) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[RecommendationsReport] Loaded from localStorage cache");
        }
        hasLoadedFromCacheRef.current = true;
        setIsLoading(false);
        return;
      }
    }

    // Priority 3: Only call API if we have a runId AND no cached data exists
    if (runId && !reports && !cachedRecommendations && !localStorageReports) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[RecommendationsReport] Loading from API with runId:", runId);
      }
      const loadData = async () => {
        try {
          const result = await loadRunById(runId);
          if (!result) {
            if (process.env.NODE_ENV === 'development') {
              console.warn("Run not found:", runId);
            }
            setError(`Report not found. The report ID "${runId}" may be invalid or may have been deleted.`);
          } else {
            hasLoadedFromCacheRef.current = true;
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Failed to load run:", err);
          }
          setError(err.message || "Failed to load report data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else {
      // No runId and no cached data - show error but don't call API
      if (process.env.NODE_ENV === 'development') {
        console.log("[RecommendationsReport] No runId and no cached data available");
      }
      if (!effectiveReports || !effectiveReports.personalized_recommendations) {
        setError("No report ID provided. Please select a report from your dashboard.");
      }
      hasLoadedFromCacheRef.current = true;
      setIsLoading(false);
    }
  }, [runId, loadRunById, cachedRun, cachedRecommendations, loadFromRecentDiscoveryCache, effectiveReports, reports, localStorageReports]);

  // Reset the ref when runId changes (user views different report)
  useEffect(() => {
    hasLoadedFromCacheRef.current = false;
  }, [runId]);

  return {
    runId,
    error,
    isLoading,
    effectiveReports,
    effectiveInputs,
    cachedRun,
    cachedIdeas,
    hasLoadedFromCacheRef
  };
}

