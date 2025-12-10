import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { runDiscovery } from "../utils/discovery.js";
import { splitProfileAndRecommendations } from "../utils/streamingParser.js";

const ReportsContext = createContext(null);
const STORAGE_KEY = "sia_saved_runs";

function loadSavedRuns() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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

/**
 * Map old intake fields to new universal intake schema
 */
function mapOldToNewSchema(oldInputs) {
  if (!oldInputs || typeof oldInputs !== "object") {
    return {};
  }

  // Check if this is already new schema (has new fields)
  const hasNewFields = oldInputs.risk_tolerance !== undefined || 
                       oldInputs.preferred_work_style !== undefined ||
                       oldInputs.industry_interest !== undefined;
  
  if (hasNewFields) {
    return oldInputs; // Already new schema
  }

  // Map old fields to new schema
  const mapped = { ...defaultInputs };

  // Direct mappings
  if (oldInputs.time_commitment) {
    mapped.time_commitment = oldInputs.time_commitment;
  }
  if (oldInputs.budget_range) {
    mapped.budget_range = oldInputs.budget_range;
  }
  if (oldInputs.experience_summary) {
    mapped.experience_summary = oldInputs.experience_summary;
  }

  // Map interest_area to industry_interest
  if (oldInputs.interest_area) {
    // Try to map old interest areas to new industry_interest
    const interestMapping = {
      "AI / Automation": "AI & Automation",
      "Consulting & Professional Services": "Freelancing / Consulting",
      "Education / EdTech": "Education",
      "Healthcare / Wellness": "Beauty & Wellness",
      "Finance / Investment": "Finance / Accounting",
      "E-commerce / Retail": "Retail & E-commerce",
      "Content / Media / Creator Economy": "Other",
      "Sustainability / Green Tech": "Social Impact",
      "Lifestyle / Travel / Food": "Travel & Tourism",
      "Other (Custom)": "Other"
    };
    mapped.industry_interest = interestMapping[oldInputs.interest_area] || oldInputs.interest_area;
  }
  if (oldInputs.sub_interest_area) {
    mapped.sub_interest_area = oldInputs.sub_interest_area;
  }

  // Map work_style to preferred_work_style
  if (oldInputs.work_style) {
    const workStyleMapping = {
      "Solo": "Solo",
      "Small Team": "Small team",
      "Community-Based": "Community-based",
      "Remote Only": "Remote only",
      "Requires Physical Presence": "On-site OK"
    };
    mapped.preferred_work_style = workStyleMapping[oldInputs.work_style] || oldInputs.work_style;
  }

  // Map skill_strength to skills
  if (oldInputs.skill_strength) {
    const skillMapping = {
      "Technical / Automation": { technical: ["Coding", "Automation"] },
      "Analytical / Strategic": { business: ["Strategy"] },
      "Creative / Design": { creative: ["Design"] },
      "Operational / Process": { business: ["Management"] },
      "Communication / Community": { soft: ["Communication"] },
      "Financial / Analytical": { business: ["Finance"] },
      "Research / Insight-Driven": { business: ["Strategy"] },
      "Other / Mixed": {}
    };
    const mappedSkills = skillMapping[oldInputs.skill_strength] || {};
    mapped.skills = { ...mapped.skills, ...mappedSkills };
  }

  // Map goal_type to founder_ambition
  if (oldInputs.goal_type) {
    const goalMapping = {
      "Extra Income": "Side income",
      "Replace Full-Time Job": "Full-time business",
      "Passive Income": "Scalable venture",
      "Passion Project": "Turn hobby into business",
      "Social Impact / Non-Profit": "Social Impact",
      "Tech-Driven Venture": "Scalable venture",
      "Consulting / Knowledge Business": "Part-time business",
      "Experimental / Learning Project": "Side income"
    };
    mapped.founder_ambition = goalMapping[oldInputs.goal_type] || "Side income";
  }

  // Set defaults for missing required fields
  if (!mapped.risk_tolerance) mapped.risk_tolerance = "Moderate";
  if (!mapped.preferred_work_style) mapped.preferred_work_style = "No preference";
  if (!mapped.startup_style) mapped.startup_style = "Online only";
  if (!mapped.customer_interaction) mapped.customer_interaction = "Somewhat comfortable";
  if (!mapped.location_context) mapped.location_context = "Urban";
  if (!mapped.business_type) mapped.business_type = "No preference";
  if (!mapped.earnings_timeline) mapped.earnings_timeline = "90 days";

  return mapped;
}

function normalizeInputs(overrides = {}) {
  // Map old schema to new if needed
  const mappedOverrides = mapOldToNewSchema(overrides);
  
  // Merge with defaults
  const merged = { ...defaultInputs, ...mappedOverrides };

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
  const { getAuthHeaders } = useAuth();

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
  }, [getAuthHeaders]);

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
      const headers = getAuthHeaders();
      // Remove 'run_' prefix if present, API will handle normalization
      const apiRunId = runId.startsWith('run_') ? runId.substring(4) : runId;
      const response = await fetch(`/api/user/run/${encodeURIComponent(apiRunId)}`, {
        headers: headers,
      });
      if (response.ok) {
        const data = await response.json();
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to load run from API:", errorData.error || "Unknown error");
      }
    } catch (error) {
      console.error("Failed to load run from API:", error);
    } finally {
      setLoading(false);
    }
    
    return null;
  }, [getAuthHeaders]);

  const deleteRun = useCallback((runId) => {
    const runs = loadSavedRuns();
    const filtered = runs.filter((run) => run.id !== runId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If deleting the current run, clear state
    if (currentRunId === runId) {
      setCurrentRunId(null);
      setReports(null);
      setInputsState(defaultInputs);
    }
    
    return filtered;
  }, [currentRunId]);

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
      streamingOutput,
      isCached
    }),
    [inputs, reports, loading, error, runCrew, loadRunById, currentRunId, deleteRun, setInputs, streamingOutput, isCached]
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
