import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./AuthContext.jsx";
import { runDiscovery } from "../utils/discovery.js";
import { splitProfileAndRecommendations } from "../utils/streamingParser.js";
import { normalizeRunId } from "../utils/runs.js";
import apiClient, { ApiError } from "../utils/apiClient.js";

const ReportsContext = createContext(null);
const STORAGE_KEY = "sia_saved_runs";

function loadSavedRuns() {
 try {
 const stored = localStorage.getItem(STORAGE_KEY);
 if (!stored) return [];
 
 const runs = JSON.parse(stored);
 
 // Filter out old schema runs and clean localStorage
 const oldSchemaFields = ["goal_type", "interest_area", "work_style", "skill_strength"];
 const newRuns = runs.filter(run => {
 const inputs = run.inputs || {};
 // Check if run has old schema fields
 const hasOldFields = oldSchemaFields.some(field => inputs[field] !== undefined);
 return !hasOldFields; // Keep runs that don't have old fields
 });
 
 // If we filtered out any runs, update localStorage
 if (newRuns.length !== runs.length) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(newRuns));
 }
 
 return newRuns;
 } catch (error) {
 console.error("Failed to load saved runs", error);
 return [];
 }
}

function saveRun(run) {
 const runs = loadSavedRuns();
 runs.unshift(run);
 localStorage.setItem(STORAGE_KEY, JSON.stringify(runs.slice(0, 20)));
}

function buildDefaultInputs() {
 // New universal intake schema defaults
 return {
 // Startup Category (FIRST FIELD)
 startup_category: "",
 // Screen 1 - About You
 time_commitment: "",
 budget_range: "",
 risk_tolerance: "",
 preferred_work_style: "",
 startup_style: "",
 skills: {
 technical: [],
 creative: [],
 physical: [],
 business: [],
 soft: [],
 other: ""
 },
 customer_interaction: "",
 location_context: "",
 // Screen 2 - Interests & Goals
 industry_interest: "",
 sub_interest_area: "",
 business_type: "",
 earnings_timeline: "",
 founder_ambition: "",
 experience_summary: ""
 };
}

const defaultInputs = buildDefaultInputs();

function normalizeInputs(overrides = {}) {
 // Merge with defaults
 const merged = { ...defaultInputs, ...overrides };

 // Ensure skills is always an object
 if (!merged.skills || typeof merged.skills !== "object") {
 merged.skills = {
 technical: [],
 creative: [],
 physical: [],
 business: [],
 soft: [],
 other: ""
 };
 }

 // Normalize skills arrays
 Object.keys(merged.skills).forEach(category => {
 if (category !== "other" && !Array.isArray(merged.skills[category])) {
 merged.skills[category] = [];
 }
 if (category === "other" && typeof merged.skills[category] !== "string") {
 merged.skills[category] = "";
 }
 });

 return merged;
}

export function ReportsProvider({ children }) {
 const [inputs, setInputsState] = useState(defaultInputs);
 const [reports, setReports] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);
 const [currentRunId, setCurrentRunId] = useState(null);
 const [streamingOutput, setStreamingOutput] = useState("");
 const [isCached, setIsCached] = useState(false);
 const [requestStartTime, setRequestStartTime] = useState(null);
 const [requestDuration, setRequestDuration] = useState(null);
 // Enrichment cache: Map<ideaId, enrichmentBody>
 const [enrichmentCache, setEnrichmentCache] = useState(new Map());

 const setInputs = useCallback((nextInputs) => {
 setInputsState(normalizeInputs(nextInputs));
 }, []);

 const runCrew = useCallback(async (formInputs) => {
 const normalizedInputs = normalizeInputs(formInputs);
 const payload = Object.fromEntries(
 Object.entries(normalizedInputs).map(([key, value]) => [
 key,
 typeof value === "string" ? value.trim() : value,
 ])
 );

 setInputsState(normalizedInputs);
 setLoading(true);
 setError(null);
 setReports(null);
 setStreamingOutput(""); // Clear previous streaming output
 setIsCached(false); // Reset cache indicator
 setRequestDuration(null); // Reset duration
 
 // Start timer when request begins
 const startTime = performance.now();
 setRequestStartTime(startTime);

 let isCached = false;
 let actualRunId = null;

 // Wrap runDiscovery in a Promise so we can await it and return the runId
 return new Promise((resolve, reject) => {
 runDiscovery(
 payload,
 // onChunk - called for each text chunk
 (chunk) => {
 setStreamingOutput((prev) => prev + chunk);
 },
 // onComplete - called when streaming finishes with metadata
 (result) => {
 // Calculate duration when request completes
 const endTime = performance.now();
 const duration = endTime - startTime;
 setRequestDuration(duration);
 
 // result contains: { runId, cached, fullData, status }
 isCached = result.cached || false;
 actualRunId = result.runId || null;
 setIsCached(isCached); // Update cache state
 
 // Parse the streamed text into structured outputs
 // Follows SSE contract: profile analysis, then separator (---PROFILE_END---), then recommendations
 let fullData = result.fullData || "";
 
 // Guard: Only parse when both profile markers are present
 const PROFILE_START = "---PROFILE_ANALYSIS_START---";
 const PROFILE_END = "---PROFILE_ANALYSIS_END---";
 
 if (!fullData.includes(PROFILE_START) || !fullData.includes(PROFILE_END)) {
 // Profile markers not complete yet - don't parse, don't update UI state
 setLoading(false);
 resolve({ 
 success: true, 
 runId: actualRunId || Date.now().toString(),
 cached: isCached
 });
 return;
 }
 
 // Use contract-compliant parser to split profile and recommendations
 const { profileAnalysis, recommendations } = splitProfileAndRecommendations(fullData);
 
 // Debug logging in development
 if (process.env.NODE_ENV === 'development') {
 const SPLIT_TOKEN = "\n\n---PROFILE_END---\n\n";
 console.log("ReportsContext - Parsed output:", {
 fullDataLength: fullData.length,
 profileAnalysisLength: profileAnalysis.length,
 recommendationsLength: recommendations.length,
 hasSeparator: fullData.includes("---PROFILE_END---"),
 separatorIndex: fullData.indexOf(SPLIT_TOKEN),
 separatorFound: fullData.includes(SPLIT_TOKEN),
 profilePreview: profileAnalysis.substring(0, 200),
 recommendationsPreview: recommendations.substring(0, 200),
 });
 }
 
 const run = {
 id: actualRunId || Date.now().toString(),
 timestamp: Date.now(),
 inputs: payload,
 outputs: {
 profile_analysis: profileAnalysis,
 personalized_recommendations: recommendations,
 streaming_output: fullData, // Keep full output for reference
 },
 cached: isCached,
 };
 
 saveRun(run);
 setCurrentRunId(run.id);
 setReports(run.outputs);
 
 // Save to recentDiscovery cache for quick access without API calls
 try {
 localStorage.setItem("recentDiscovery", JSON.stringify({
 reports: run.outputs,
 inputs: payload,
 runId: run.id,
 timestamp: run.timestamp
 }));
 } catch (e) {
 console.warn("Failed to save to recentDiscovery cache:", e);
 }
 
 // Debug: verify reports were set
 if (process.env.NODE_ENV === 'development') {
 console.log("ReportsContext - Reports set:", {
 hasProfileAnalysis: !!run.outputs.profile_analysis,
 hasRecommendations: !!run.outputs.personalized_recommendations,
 recommendationsLength: run.outputs.personalized_recommendations?.length || 0,
 });
 }
 
 setLoading(false);
 resolve({ 
 success: true, 
 runId: run.id,
 cached: isCached
 });
 },
 // onError
 (err) => {
 // Calculate duration even on error
 const endTime = performance.now();
 const duration = endTime - startTime;
 setRequestDuration(duration);
 
 setError(err.message || "Unexpected error");
 setLoading(false);
 reject(err);
 },
 // options
 {
 timeout: 300000, // 5 minutes
 useSSE: true
 }
 ).catch((err) => {
 setError(err.message || "Unexpected error");
 setLoading(false);
 reject(err);
 });
  }).catch((err) => {
    // Handle rejection and return failure
    return { success: false };
  });
}, []);

 const loadRunById = useCallback(async (runId) => {
 if (!runId) return null;
 
 // First try localStorage
 const runs = loadSavedRuns();
 const match = runs.find((run) => run.id === runId);
 if (match) {
 setCurrentRunId(match.id);
 setInputsState(normalizeInputs(match.inputs || {}));
 setReports(match.outputs || {});
 return match;
 }
 
 // If not found in localStorage, try API
 // The API endpoint handles both "run_123" and "123" formats
 try {
 setLoading(true);
 // Remove 'run_' prefix if present, API will handle normalization
 const apiRunId = runId.startsWith('run_') ? runId.substring(4) : runId;
 const data = await apiClient.get(`/user/run/${encodeURIComponent(apiRunId)}`);
 
 if (data.success && data.run) {
 setCurrentRunId(data.run.run_id);
 setInputsState(normalizeInputs(data.run.inputs || {}));
 try {
 // Parse reports if it's a string
 const reports = typeof data.run.reports === 'string' 
 ? JSON.parse(data.run.reports) 
 : (data.run.reports || {});

 // Ensure reports structure includes outputs format expected by frontend
 const formattedReports = {
 profile_analysis: data.run.profile_analysis || reports.profile_analysis || "",
 personalized_recommendations: data.run.personalized_recommendations || reports.personalized_recommendations || "",
 recommendations_structured: reports.recommendations_structured || null, // Include structured recommendations if available
 ...reports // Include any other report fields
 };

 setReports(formattedReports);
 } catch (e) {
 console.error("Failed to parse reports:", e);
 setReports({});
 }
 return {
 id: data.run.run_id,
 inputs: data.run.inputs || {},
 outputs: data.run.reports || {},
 from_api: true,
 };
 }
 } catch (error) {
 // Re-throw 401 errors so ProtectedRoute can handle them
 if (error instanceof ApiError && error.status === 401) {
 setLoading(false);
 const authError = new Error("Authentication required");
 authError.status = 401;
 throw authError;
 }
 console.error("Failed to load run from API:", error);
 } finally {
 setLoading(false);
 }
 
 return null;
 }, []);

 const deleteRun = useCallback(async (runId, shouldUseAPI = false) => {
  if (!runId) {
   throw new Error("Cannot delete: runId is required");
  }
  
  const normalizedRunId = normalizeRunId(runId);
  if (!normalizedRunId) {
   throw new Error("Cannot delete: invalid runId format");
  }
  
  // If authenticated, delete via API
  if (shouldUseAPI) {
   try {
    await apiClient.delete(`/user/run/${encodeURIComponent(normalizedRunId)}`);
   } catch (error) {
    throw error;
   }
  }
 
  // Also remove from localStorage - be very specific about matching
  const runs = loadSavedRuns();
  
  const filtered = runs.filter((run) => {
   const runIdToCompare = run.id || run.run_id;
   if (!runIdToCompare) {
    // Keep runs without IDs (shouldn't happen, but be safe)
    return true;
   }
   
   const normalizedCompare = normalizeRunId(runIdToCompare);
   
   // Only delete if it matches the target runId in ANY format
   // Keep the run if it doesn't match any of these formats
   const shouldDelete = 
    normalizedCompare === normalizedRunId ||  // Normalized IDs match
    runIdToCompare === runId ||               // Original IDs match
    runIdToCompare === `run_${runId}` ||      // Format: run_<original>
    runIdToCompare === `run_${normalizedRunId}` || // Format: run_<normalized>
    normalizedCompare === runId ||             // Normalized matches original
    runIdToCompare === normalizedRunId;       // Original matches normalized
   
   return !shouldDelete; // Keep if NOT shouldDelete
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
 
  // If deleting the current run, clear state
  const currentNormalized = normalizeRunId(currentRunId);
  if (currentNormalized === normalizedRunId || 
      currentRunId === runId || 
      currentRunId === `run_${runId}` ||
      currentRunId === normalizedRunId) {
   setCurrentRunId(null);
   setReports(null);
   setInputsState(defaultInputs);
  }
 
  return filtered;
 }, [currentRunId]);

 const clearAllSavedRuns = useCallback(() => {
 localStorage.removeItem(STORAGE_KEY);
 // Clear current state if we're viewing a saved run
 if (currentRunId) {
 setCurrentRunId(null);
 setReports(null);
 setInputsState(defaultInputs);
 }
 }, [currentRunId]);

 const loadFromRecentDiscoveryCache = useCallback(() => {
 try {
 const recentDiscovery = localStorage.getItem("recentDiscovery");
 if (recentDiscovery) {
 const parsed = JSON.parse(recentDiscovery);
 if (parsed.reports && parsed.reports.personalized_recommendations) {
 // Load cached data into context
 if (parsed.runId) {
 setCurrentRunId(parsed.runId);
 }
 if (parsed.inputs) {
 setInputsState(normalizeInputs(parsed.inputs));
 }
 setReports(parsed.reports);
 return parsed.reports;
 }
 }
 } catch (e) {
 console.warn("Failed to load from recentDiscovery cache:", e);
 }
 return null;
 }, []);

 // Get enrichment from cache
 const getEnrichment = useCallback((ideaId) => {
 if (!ideaId) return null;
 return enrichmentCache.get(ideaId) || null;
 }, [enrichmentCache]);

 // Set enrichment in cache
 const setEnrichment = useCallback((ideaId, enrichmentBody) => {
 if (!ideaId || !enrichmentBody) return;
 setEnrichmentCache(prev => {
 const next = new Map(prev);
 next.set(ideaId, enrichmentBody);
 console.log(`[EnrichmentCache] Stored enrichment for ${ideaId}, cache size: ${next.size}`);
 return next;
 });
 }, []);

 // Log runs count on mount and when runs change (for debugging)
 useEffect(() => {
 if (process.env.NODE_ENV === 'development') {
 const savedRuns = loadSavedRuns();
 console.log("[ReportsContext] Saved runs count:", savedRuns.length);
 if (savedRuns.length > 0) {
 console.log("[ReportsContext] Sample run:", {
 id: savedRuns[0].id,
 hasOutputs: !!savedRuns[0].outputs,
 hasRecommendations: !!savedRuns[0].outputs?.personalized_recommendations,
 });
 }
 }
 }, []);

 const value = useMemo(
 () => ({ 
 inputs, 
 setInputs, 
 reports, 
 loading, 
 error, 
 runCrew, 
 loadRunById, 
 currentRunId, 
 deleteRun,
 clearAllSavedRuns,
 loadFromRecentDiscoveryCache,
 streamingOutput,
 isCached,
 requestStartTime,
 requestDuration,
 getEnrichment,
 setEnrichment
 }),
 [inputs, reports, loading, error, runCrew, loadRunById, currentRunId, deleteRun, clearAllSavedRuns, loadFromRecentDiscoveryCache, setInputs, streamingOutput, isCached, requestStartTime, requestDuration, getEnrichment, setEnrichment]
 );

 return (
 <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
 );
}

export function useReports() {
 const context = useContext(ReportsContext);
 if (!context) {
 // In development, provide more helpful error message
 if (process.env.NODE_ENV === 'development') {
 console.error("useReports called outside ReportsProvider. This might be a hot-reload issue.");
 }
 throw new Error("useReports must be used within a ReportsProvider");
 }
 return context;
}
