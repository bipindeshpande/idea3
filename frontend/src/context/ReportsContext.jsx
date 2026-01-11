import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext.jsx";
import { runDiscovery } from "../utils/discovery.js";
import { splitProfileAndRecommendations } from "../utils/parsers/index.js";
import { parseJSONLinesStream } from "../utils/parsers/streamParsers/parseJSONLines.js";
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
 // Abort controller ref for cancelling requests
 const abortControllerRef = useRef(null);

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

 // Create abort controller for request cancellation
 const controller = new AbortController();
 abortControllerRef.current = controller;

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
 async (result) => {
 // Calculate duration when request completes
 const endTime = performance.now();
 const duration = endTime - startTime;
 setRequestDuration(duration);
 
 // result contains: { runId, cached, fullData, status }
 isCached = result.cached || false;
 actualRunId = result.runId || null;
 setIsCached(isCached); // Update cache state
 
 // Parse the streamed text into structured outputs
 // Try structured JSON lines format first, fallback to old delimiter format
 let fullData = result.fullData || "";
 let profileAnalysis = "";
 let recommendations = "";
 
        // Parse the streamed text into structured outputs
        // Priority order: 1) Accumulator from discovery, 2) Parse JSON lines from fullData, 3) Fallback to old format
        
        // Ensure result exists before accessing properties
        let accumulator = result && result.accumulator ? result.accumulator : null;
        
        // Priority 1: Use accumulator from discovery if available (already parsed during streaming)
        if (accumulator && typeof accumulator.getProfile === 'function' && typeof accumulator.getRecommendations === 'function') {
          profileAnalysis = accumulator.getProfile() || "";
          recommendations = accumulator.getRecommendations() || "";
          
          if (typeof accumulator.hasErrors === 'function' && accumulator.hasErrors()) {
            console.warn("WARNING: JSON lines parsing had errors:", accumulator.errors);
          }
          
          // If we have parsed data, use it directly
          if (profileAnalysis || recommendations) {
            const run = {
              id: actualRunId,
              timestamp: Date.now(),
              inputs: payload,
              outputs: {
                profile_analysis: profileAnalysis,
                personalized_recommendations: recommendations,
                streaming_output: fullData,
              },
              cached: isCached,
            };
            
            saveRun(run);
            setCurrentRunId(run.id);
            setReports(run.outputs);
            setLoading(false);
            resolve({ 
              success: true, 
              runId: run.id,
              cached: isCached
            });
            return;
          }
        }
        
        // Priority 2: Try parsing as structured JSON lines format from fullData
        if (fullData) {
          const jsonLinesResult = parseJSONLinesStream(fullData);
          if (jsonLinesResult.profileAnalysis || jsonLinesResult.recommendations) {
            // Successfully parsed as JSON lines format
            profileAnalysis = jsonLinesResult.profileAnalysis || "";
            recommendations = jsonLinesResult.recommendations || "";
            
            // Check if parsing is complete
            if (jsonLinesResult.hasErrors) {
              console.warn("WARNING: JSON lines parsing had errors:", jsonLinesResult.errors);
            }
            
            // If we have parsed data, use it directly
            if (profileAnalysis || recommendations) {
              const run = {
                id: actualRunId,
                timestamp: Date.now(),
                inputs: payload,
                outputs: {
                  profile_analysis: profileAnalysis,
                  personalized_recommendations: recommendations,
                  streaming_output: fullData,
                },
                cached: isCached,
              };
              
              saveRun(run);
              setCurrentRunId(run.id);
              setReports(run.outputs);
              setLoading(false);
              resolve({ 
                success: true, 
                runId: run.id,
                cached: isCached
              });
              return;
            }
          }
        }
 
 // Fallback to old delimiter format parsing
 // Check if we have the separator token (---PROFILE_END---) which indicates profile section
 const PROFILE_SEPARATOR = "---PROFILE_END---";
 
 // If we don't have the separator and JSON lines parsing failed, try loading from API
 if (!fullData.includes(PROFILE_SEPARATOR)) {
 // No separator found - try loading from API
 if (actualRunId) {
 try {
 // Remove 'run_' prefix if present
 const apiRunId = actualRunId.startsWith('run_') ? actualRunId.substring(4) : actualRunId;
 const response = await apiClient.get(`/user/run/${encodeURIComponent(apiRunId)}`);
 
 if (response.success && response.run) {
 // Parse reports if it's a string
 const reports = typeof response.run.reports === 'string' 
 ? JSON.parse(response.run.reports) 
 : (response.run.reports || {});
 
 // Use profile from API
 const profileFromApi = response.run.profile_analysis || reports.profile_analysis || "";
 const recommendationsFromApi = response.run.personalized_recommendations || reports.personalized_recommendations || "";
 
 const run = {
 id: actualRunId,
 timestamp: Date.now(),
 inputs: payload,
 outputs: {
 profile_analysis: profileFromApi,
 personalized_recommendations: recommendationsFromApi,
 streaming_output: fullData,
 },
 cached: isCached,
 };
 
 saveRun(run);
 setCurrentRunId(run.id);
 setReports(run.outputs);
 setLoading(false);
 resolve({ 
 success: true, 
 runId: run.id,
 cached: isCached
 });
 return;
 }
 } catch (apiError) {
 console.error("Failed to load run from API:", apiError);
 // Continue to fallback behavior below
 }
 }
 
 // No separator found in streamed data - try loading from API one more time
 if (actualRunId) {
 try {
 // Remove 'run_' prefix if present
 const apiRunId = actualRunId.startsWith('run_') ? actualRunId.substring(4) : actualRunId;
 const response = await apiClient.get(`/user/run/${encodeURIComponent(apiRunId)}`);
 
 if (response.success && response.run) {
 // Parse reports if it's a string
 const reports = typeof response.run.reports === 'string' 
 ? JSON.parse(response.run.reports) 
 : (response.run.reports || {});
 
 const profileFromApi = response.run.profile_analysis || reports.profile_analysis || "";
 const recommendationsFromApi = response.run.personalized_recommendations || reports.personalized_recommendations || "";
 
 if (profileFromApi || recommendationsFromApi) {
 const run = {
 id: actualRunId,
 timestamp: Date.now(),
 inputs: payload,
 outputs: {
 profile_analysis: profileFromApi,
 personalized_recommendations: recommendationsFromApi,
 streaming_output: fullData,
 },
 cached: isCached,
 };
 
 saveRun(run);
 setCurrentRunId(run.id);
 setReports(run.outputs);
 setLoading(false);
 resolve({ 
 success: true, 
 runId: run.id,
 cached: isCached
 });
 return;
 }
 }
 } catch (apiError) {
 console.error("Failed to load run from API (final attempt):", apiError);
 }
 }
 
 // No separator found and API load failed - can't parse, don't update UI state
 setLoading(false);
 resolve({ 
 success: true, 
 runId: actualRunId || Date.now().toString(),
 cached: isCached
 });
 return;
 }
 
 // Use contract-compliant parser to split profile and recommendations (fallback for old format)
 const splitResult = splitProfileAndRecommendations(fullData);
 profileAnalysis = splitResult.profileAnalysis || profileAnalysis;
 recommendations = splitResult.recommendations || recommendations;

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

 // If profile analysis is empty or too short, try loading from API as fallback
 let finalProfileAnalysis = profileAnalysis;
 let finalRecommendations = recommendations;

 if ((!finalProfileAnalysis || finalProfileAnalysis.trim().length < 50) && actualRunId) {
 try {
 // Remove 'run_' prefix if present
 const apiRunId = actualRunId.startsWith('run_') ? actualRunId.substring(4) : actualRunId;
 const response = await apiClient.get(`/user/run/${encodeURIComponent(apiRunId)}`);
 
 if (response.success && response.run) {
 // Parse reports if it's a string
 const reports = typeof response.run.reports === 'string' 
 ? JSON.parse(response.run.reports) 
 : (response.run.reports || {});
 
 // Use API data if streamed data is incomplete
 if (response.run.profile_analysis && response.run.profile_analysis.trim().length > finalProfileAnalysis.length) {
 finalProfileAnalysis = response.run.profile_analysis;
 }
 if (response.run.personalized_recommendations && response.run.personalized_recommendations.trim().length > finalRecommendations.length) {
 finalRecommendations = response.run.personalized_recommendations;
 }
 
 // Also try reports object
 if (reports.profile_analysis && reports.profile_analysis.trim().length > finalProfileAnalysis.length) {
 finalProfileAnalysis = reports.profile_analysis;
 }
 if (reports.personalized_recommendations && reports.personalized_recommendations.trim().length > finalRecommendations.length) {
 finalRecommendations = reports.personalized_recommendations;
 }
 }
 } catch (apiError) {
 console.error("Failed to load run from API as fallback:", apiError);
 // Continue with streamed data
 }
 }

 const run = {
 id: actualRunId || Date.now().toString(),
 timestamp: Date.now(),
 inputs: payload,
 outputs: {
 profile_analysis: finalProfileAnalysis,
 personalized_recommendations: finalRecommendations,
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
 useSSE: true,
 signal: controller.signal
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
 
 // First try localStorage - if data exists there, use it immediately (don't call API)
 const runs = loadSavedRuns();
 const match = runs.find((run) => run.id === runId);
 if (match && match.outputs && (match.outputs.profile_analysis || match.outputs.personalized_recommendations)) {
 // Found complete data in localStorage - use it without API call
 setCurrentRunId(match.id);
 setInputsState(normalizeInputs(match.inputs || {}));
 setReports(match.outputs || {});
 return match;
 }
 
 // If not found in localStorage or data is incomplete, try API
 // But use skipAuthRedirect to prevent immediate logout on 401/403
 // The API endpoint handles both "run_123" and "123" formats
 try {
 setLoading(true);
 // Remove 'run_' prefix if present, API will handle normalization
 const apiRunId = runId.startsWith('run_') ? runId.substring(4) : runId;
 
 // Use skipAuthRedirect=true to handle auth errors gracefully
 // This prevents immediate redirect to login if token expired or run doesn't belong to user
 const data = await apiClient.get(`/user/run/${encodeURIComponent(apiRunId)}`, {
 skipAuthRedirect: true // Don't redirect to login immediately on 401/403
 });
 
 if (data.success && data.run) {
 setCurrentRunId(data.run.run_id);
 setInputsState(normalizeInputs(data.run.inputs || {}));
 try {
 // Parse reports if it's a string
 const reports = typeof data.run.reports === 'string' 
 ? JSON.parse(data.run.reports) 
 : (data.run.reports || {});
 
 // Log what we received from API
 if (process.env.NODE_ENV === 'development') {
 console.log("[loadRunById] API response data:", {
 run_id: data.run.run_id,
 hasReports: !!data.run.reports,
 reportsKeys: Object.keys(reports),
 hasRecommendationsStructured: !!reports.recommendations_structured,
 recommendationsStructuredCount: Array.isArray(reports.recommendations_structured) ? reports.recommendations_structured.length : "not an array",
 hasPersonalizedRecommendations: !!data.run.personalized_recommendations,
 personalizedRecommendationsLength: data.run.personalized_recommendations ? data.run.personalized_recommendations.length : 0,
 hasProfileAnalysis: !!data.run.profile_analysis,
 profileAnalysisLength: data.run.profile_analysis ? data.run.profile_analysis.length : 0
 });
 if (data.run.personalized_recommendations) {
 const preview = data.run.personalized_recommendations.substring(0, 300);
 console.log("[loadRunById] personalized_recommendations preview:", preview);
 }
 if (reports.recommendations_structured && Array.isArray(reports.recommendations_structured) && reports.recommendations_structured.length > 0) {
 console.log("[loadRunById] First structured recommendation:", reports.recommendations_structured[0]);
 }
 }
 
 // Ensure reports structure includes outputs format expected by frontend
 const formattedReports = {
 profile_analysis: data.run.profile_analysis || reports.profile_analysis || "",
 personalized_recommendations: data.run.personalized_recommendations || reports.personalized_recommendations || "",
 recommendations_structured: reports.recommendations_structured || null, // Include structured recommendations if available
 ...reports // Include any other report fields
 };
 
 // Log formatted reports
 if (process.env.NODE_ENV === 'development') {
 console.log("[loadRunById] Formatted reports:", {
 hasProfileAnalysis: !!formattedReports.profile_analysis,
 profileAnalysisLength: formattedReports.profile_analysis ? formattedReports.profile_analysis.length : 0,
 hasPersonalizedRecommendations: !!formattedReports.personalized_recommendations,
 personalizedRecommendationsLength: formattedReports.personalized_recommendations ? formattedReports.personalized_recommendations.length : 0,
 hasRecommendationsStructured: !!formattedReports.recommendations_structured,
 recommendationsStructuredCount: Array.isArray(formattedReports.recommendations_structured) ? formattedReports.recommendations_structured.length : "not an array"
 });
 }
 
 setReports(formattedReports);
 
 // Also save to localStorage for future use
 const runToSave = {
 id: data.run.run_id,
 timestamp: Date.now(),
 inputs: data.run.inputs || {},
 outputs: formattedReports,
 from_api: true,
 };
 saveRun(runToSave);
 
 return {
 id: data.run.run_id,
 inputs: data.run.inputs || {},
 outputs: formattedReports, // Use formattedReports instead of data.run.reports
 reports: formattedReports, // Also include as reports for consistency
 profile_analysis: data.run.profile_analysis || reports.profile_analysis || "",
 personalized_recommendations: data.run.personalized_recommendations || reports.personalized_recommendations || "",
 from_api: true,
 };
 } catch (e) {
 console.error("Failed to parse reports:", e);
 setReports({});
 }
 }
 } catch (error) {
 // Handle 401/403 errors gracefully - don't throw or redirect
 // If API fails, try to use localStorage data as fallback (even if incomplete)
 if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
 console.warn(`Cannot load run ${runId} from API (status ${error.status}). ${error.status === 401 ? 'Authentication may have expired.' : 'Run may not belong to current user.'} Trying localStorage fallback...`);
 
 // Try localStorage again as fallback (maybe data was added since first check)
 const runs = loadSavedRuns();
 const fallbackMatch = runs.find((run) => run.id === runId);
 if (fallbackMatch && fallbackMatch.outputs) {
 console.log(`Using localStorage data as fallback for run ${runId}`);
 setCurrentRunId(fallbackMatch.id);
 setInputsState(normalizeInputs(fallbackMatch.inputs || {}));
 setReports(fallbackMatch.outputs || {});
 setLoading(false);
 return fallbackMatch;
 }
 
 // If no localStorage fallback and 401 (not 403), user should re-authenticate
 // But don't throw - let the component handle the empty state gracefully
 if (error.status === 401) {
 console.warn("Authentication required. User should be redirected to login by ProtectedRoute.");
 // Don't throw - let the ProtectedRoute component handle the redirect
 // This prevents double-redirects
 } else {
 // For 403 (authorization), just log and return null
 console.warn(`Access denied to run ${runId}. User may not have permission.`);
 }
 setLoading(false);
 return null;
 }
 
 console.error("Failed to load run from API:", error);
 setLoading(false);
 return null;
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

 // Get enrichment from cache (memory + localStorage)
 const getEnrichment = useCallback((ideaId) => {
 if (!ideaId) return null;
 
 // Check memory cache first
 const memoryCache = enrichmentCache.get(ideaId);
 if (memoryCache) {
   console.log(`[EnrichmentCache] Found in memory for ${ideaId}`);
   return memoryCache;
 }
 
 // Check localStorage as fallback
 try {
   const stored = localStorage.getItem(`enrichment_${ideaId}`);
   if (stored) {
     console.log(`[EnrichmentCache] Found in localStorage for ${ideaId}`);
     const parsed = JSON.parse(stored);
     // Also restore to memory cache
     setEnrichmentCache(prev => {
       const next = new Map(prev);
       next.set(ideaId, parsed.body);
       return next;
     });
     return parsed.body;
   }
 } catch (e) {
   console.error('[EnrichmentCache] Error reading from localStorage:', e);
 }
 
 return null;
 }, [enrichmentCache]);

 // Set enrichment in cache (memory + localStorage)
 const setEnrichment = useCallback((ideaId, enrichmentBody) => {
 if (!ideaId || !enrichmentBody) return;
 
 // Store in memory
 setEnrichmentCache(prev => {
   const next = new Map(prev);
   next.set(ideaId, enrichmentBody);
   console.log(`[EnrichmentCache] Stored enrichment for ${ideaId}, cache size: ${next.size}`);
   return next;
 });
 
 // Also persist to localStorage
 try {
   localStorage.setItem(`enrichment_${ideaId}`, JSON.stringify({
     body: enrichmentBody,
     timestamp: Date.now()
   }));
   console.log(`[EnrichmentCache] Persisted to localStorage for ${ideaId}`);
 } catch (e) {
   console.error('[EnrichmentCache] Error writing to localStorage:', e);
 }
 }, []);

 // Cancel the current discovery request
 const cancelRequest = useCallback(() => {
  if (abortControllerRef.current) {
   abortControllerRef.current.abort();
   abortControllerRef.current = null;
   setLoading(false);
   setError("Request cancelled by user");
  }
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
 setEnrichment,
 cancelRequest
 }),
 [inputs, reports, loading, error, runCrew, loadRunById, currentRunId, deleteRun, clearAllSavedRuns, loadFromRecentDiscoveryCache, setInputs, streamingOutput, isCached, requestStartTime, requestDuration, getEnrichment, setEnrichment, cancelRequest]
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
