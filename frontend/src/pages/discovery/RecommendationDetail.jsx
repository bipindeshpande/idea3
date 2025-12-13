import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Seo from "../../components/common/Seo.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import OpenForCollaboratorsButton from "../../components/founder/OpenForCollaboratorsButton.jsx";
import CollapsibleSection from "../../components/ui/CollapsibleSection.jsx";
import { parseTopIdeas, trimFromHeading } from "../../utils/markdown/markdown.js";
import { parseStructuredIdeas } from "../../utils/streamingParser.js";
import {
  splitIdeaSections,
  extractWhyFit,
  buildExecutionSteps,
  buildFinancialSnapshots,
  parseRiskRows,
  buildValidationQuestions,
  extractValidationQuestions,
  extractOtherSection,
  personalizeCopy,
  formatSectionHeading,
  cleanNarrativeMarkdown,
  extractTimelineSlice,
  dedupeStrings,
} from "../../utils/formatters/recommendationFormatters.js";
import { logToFile, logSectionToFile, downloadLogFile, getLogBufferSize } from "../../utils/fileLogger.js";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// Section order - single source of truth for section rendering (UX-optimized order)
export const SECTION_ORDER = [
  "why_fits",
  "financial_snapshot",
  "execution_path",
  "immediate_experiments",
  "timeline_effort",
  "customer_persona",
  "market_opportunity",
  "key_risks",
  "validation_questions",
  "immediate_next_steps",
  "decision_checklist",
  "additional_insights",
];

// Section labels mapping
const SECTION_LABELS = {
  why_fits: "Why this Idea Fits You",
  financial_snapshot: "Financial snapshot",
  execution_path: "Execution Path",
  immediate_experiments: "Immediate Experiments",
  timeline_effort: "Timeline & Effort",
  customer_persona: "Customer Persona",
  market_opportunity: "Market Opportunity",
  key_risks: "Key Risks & Mitigations",
  validation_questions: "Validation Questions",
  immediate_next_steps: "Immediate Next Steps",
  decision_checklist: "Decision Checklist",
  additional_insights: "Additional Insights",
};

// Default sections - all sections must always be present
const DEFAULT_SECTIONS = {
  intro: "",
  why_fits: "",
  financial_snapshot: "",
  execution_path: "",
  customer_persona: "",
  market_opportunity: "",
  key_risks: "",
  validation_questions: "",
  immediate_experiments: "",
  immediate_next_steps: "",
  timeline_effort: "",
  decision_checklist: "",
  additional_insights: "",
};

// Get theme for different sections (works with normalized headings)
function getSectionTheme(sectionTitle) {
  const lowerTitle = sectionTitle.toLowerCase();
  
  if (lowerTitle.includes("financial") || lowerTitle.includes("snapshot")) {
    return {
      icon: "💰",
      border: "border-amber-300",
      bg: "bg-amber-50",
      headerBg: "bg-amber-100",
      text: "text-amber-800",
      borderColor: "#FCD34D",
      bgColor: "#FEF3C7",
      headerBgColor: "#FDE68A",
      textColor: "#92400E",
    };
  }
  
  if (lowerTitle.includes("execution") || lowerTitle.includes("roadmap")) {
    return {
      icon: "🗺️",
      border: "border-brand-300",
      bg: "bg-brand-50",
      headerBg: "bg-brand-100",
      text: "text-brand-800",
      borderColor: "#A5B6E0",
      bgColor: "#E8ECF7",
      headerBgColor: "#D0D9F0",
      textColor: "#1B4091",
    };
  }
  
  if (lowerTitle.includes("risk") || lowerTitle.includes("radar")) {
    return {
      icon: "⚠️",
      border: "border-rose-300",
      bg: "bg-rose-50",
      headerBg: "bg-rose-100",
      text: "text-rose-800",
      borderColor: "#FDA4AF",
      bgColor: "#FFF1F2",
      headerBgColor: "#FFE4E6",
      textColor: "#BE123C",
    };
  }
  
  if (lowerTitle.includes("market") || lowerTitle.includes("signal")) {
    return {
      icon: "📈",
      border: "border-teal-300",
      bg: "bg-teal-50",
      headerBg: "bg-teal-100",
      text: "text-teal-800",
      borderColor: "#5EEAD4",
      bgColor: "#F0FDFA",
      headerBgColor: "#CCFBF1",
      textColor: "#134E4A",
    };
  }
  
  if (lowerTitle.includes("customer") || lowerTitle.includes("persona")) {
    return {
      icon: "👤",
      border: "border-violet-300",
      bg: "bg-violet-50",
      headerBg: "bg-violet-100",
      text: "text-violet-800",
      borderColor: "#C4B5FD",
      bgColor: "#F5F3FF",
      headerBgColor: "#EDE9FE",
      textColor: "#6D28D9",
    };
  }
  
  if (lowerTitle.includes("validation") || lowerTitle.includes("question")) {
    return {
      icon: "❓",
      border: "border-brand-300",
      bg: "bg-brand-50",
      headerBg: "bg-brand-100",
      text: "text-brand-800",
      borderColor: "#A5B6E0",
      bgColor: "#E8ECF7",
      headerBgColor: "#D0D9F0",
      textColor: "#1B4091",
    };
  }
  
  if (lowerTitle.includes("experiment") || lowerTitle.includes("next")) {
    return {
      icon: "🧪",
      border: "border-amber-300",
      bg: "bg-amber-50",
      headerBg: "bg-amber-100",
      text: "text-amber-800",
      borderColor: "#FCD34D",
      bgColor: "#FEF3C7",
      headerBgColor: "#FDE68A",
      textColor: "#92400E",
    };
  }
  
  if (lowerTitle.includes("decision") || lowerTitle.includes("checkpoint")) {
    return {
      icon: "✅",
      border: "border-emerald-300",
      bg: "bg-emerald-50",
      headerBg: "bg-emerald-100",
      text: "text-emerald-800",
      borderColor: "#86EFAC",
      bgColor: "#ECFDF5",
      headerBgColor: "#D1FAE5",
      textColor: "#047857",
    };
  }
  
  if (lowerTitle.includes("30") || lowerTitle.includes("60") || lowerTitle.includes("90") || lowerTitle.includes("outlook")) {
    return {
      icon: "📅",
      border: "border-brand-300",
      bg: "bg-brand-50",
      headerBg: "bg-brand-100",
      text: "text-brand-800",
      borderColor: "#A5B6E0",
      bgColor: "#E8ECF7",
      headerBgColor: "#D0D9F0",
      textColor: "#1B4091",
    };
  }
  
  return {
    icon: "📋",
    border: "border-slate-300",
    bg: "bg-slate-50",
    headerBg: "bg-slate-100",
    text: "text-slate-800",
    borderColor: "#CAD2DA",
    bgColor: "#F8FAFC",
    headerBgColor: "#EEF2F6",
    textColor: "#47505B",
  };
}


export default function RecommendationDetail() {
  const { ideaIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { reports: contextReports, loadRunById, currentRunId, inputs: contextInputs, loading, getEnrichment, setEnrichment } = useReports();
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { validateRecommendationIdea, loading: validating } = useValidation();
  const query = useQuery();
  const runId = query.get("id");
  
  // Initialize file logger on mount
  useEffect(() => {
    logToFile("RecommendationDetail component mounted", "INFO", "RecommendationDetail");
  }, []);
  
  // Get data from navigation state (cached) or context
  const stateData = location.state;
  const reports = stateData?.recommendations || contextReports;
  const inputs = stateData?.inputs || contextInputs;
  const cachedAllIdeas = stateData?.allIdeas;
  
  // FIX #1: Industry extraction must be consistent
  const industry = inputs?.industry_interest || "";
  
  // FIX #8: Freeze reports to prevent reloading discovery - freeze on first render only
  const stableReports = useMemo(() => reports, []);
  const [openSections, setOpenSections] = useState(new Set());
  const [actions, setActions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [newActionText, setNewActionText] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [enrichedBody, setEnrichedBody] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  
  // Ref to track if enrichment has been called for the current idea
  // This prevents multiple calls even if component mounts multiple times (React.StrictMode)
  const enrichmentCalledRef = useRef(false);
  const lastEnrichmentIdeaRef = useRef(null);

  useEffect(() => {
    // FIX #8: If we have cached data from navigation state, don't load from API
    if (stateData?.recommendations) {
      return; // Use cached data, no API call needed
    }
    
    // Only load if we don't already have the reports data and we're not currently loading
    // Use stableReports to prevent triggering reloads
    if (runId && !loading && (!stableReports || Object.keys(stableReports).length === 0)) {
      loadRunById(runId);
    } else if (currentRunId && !runId && !loading && (!stableReports || Object.keys(stableReports).length === 0)) {
      // If no runId in URL but we have a currentRunId, load it
      loadRunById(currentRunId);
    }
  }, [runId, currentRunId, loading, stableReports, loadRunById, stateData]); // Use stableReports to prevent reloads

  // Keep original markdown for ideas parsing (Stage 2 body)
  // FIX #8: Use stableReports to prevent re-parsing
  const stage2Markdown = useMemo(
    () => trimFromHeading(stableReports?.personalized_recommendations ?? "", "### Comprehensive Recommendation Report"),
    [stableReports]
  );

  const ideas = useMemo(() => {
    // Priority 1: Use cached ideas from navigation state
    if (cachedAllIdeas && Array.isArray(cachedAllIdeas) && cachedAllIdeas.length > 0) {
      return cachedAllIdeas;
    }
    
    // Priority 2: Try structured parser from reports
    // FIX #8: Use stableReports to prevent re-parsing
    const raw = stableReports?.personalized_recommendations || "";
    const structuredParsed = parseStructuredIdeas(raw);
    if (structuredParsed && structuredParsed.length > 0) {
      return structuredParsed;
    }
    // Fallback: markdown parser
    return parseTopIdeas(stage2Markdown, 10);
  }, [stage2Markdown, stableReports, cachedAllIdeas]);
  
  const numericIndex = Number.parseInt(ideaIndex ?? "", 10);
  const activeIdea = ideas.find((idea) => idea.index === numericIndex);
  
  // STEP 1: Log activeIdea creation
  console.log("=== STEP 1: activeIdea created ===");
  console.log("activeIdea:", activeIdea ? {
    index: activeIdea.index,
    title: activeIdea.title,
    hasBody: !!activeIdea.body,
    bodyLength: activeIdea.body?.length || 0,
    bodyPreview: activeIdea.body?.substring(0, 50) || "NO BODY"
  } : "null");
  console.log("ideas count:", ideas.length);
  console.log("numericIndex:", numericIndex);
  
  // Create state for activeIdea to enable proper React updates
  const [activeIdeaState, setActiveIdeaState] = useState(null);
  
  // Update activeIdeaState when activeIdea changes
  // BUT preserve body if it already exists (from enrichment)
  useEffect(() => {
    if (activeIdea) {
      console.log("=== STEP 2: Setting activeIdeaState from activeIdea ===");
      console.log("activeIdea.body length:", activeIdea.body?.length || 0);
      console.log("current activeIdeaState.body length:", activeIdeaState?.body?.length || 0);
      
      // CRITICAL FIX: Only update if we don't already have an enriched body
      // This prevents overwriting enrichment when activeIdea changes
      setActiveIdeaState(prev => {
        // If we already have a body from enrichment (either in prev or enrichedBody), preserve it
        const existingBody = prev?.body && prev.body.trim().length > 0 
          ? prev.body 
          : (enrichedBody && enrichedBody.trim().length > 0 ? enrichedBody : null);
        
        if (existingBody) {
          console.log("✅ PRESERVING enriched body, not overwriting");
          return {
            ...activeIdea,
            body: existingBody  // Keep the enriched body
          };
        }
        // Otherwise, use the new activeIdea (which has body: "")
        console.log("⚠️ Setting new activeIdeaState (no enriched body to preserve)");
        return activeIdea;
      });
    }
  }, [activeIdea]);
  
  // Use the state version for rendering, fallback to computed if state not set
  const currentActiveIdea = activeIdeaState || activeIdea;
  
  // Compute ideaId early so it can be used in useEffect hooks
  const ideaId = useMemo(() => {
    if (runId && activeIdea?.index !== undefined) return `run_${runId}_idea_${activeIdea.index}`;
    if (currentRunId && activeIdea?.index !== undefined) return `run_${currentRunId}_idea_${activeIdea.index}`;
    if (activeIdea?.index !== undefined) return `idea_${activeIdea.index}`;
    if (runId) return `run_${runId}`;
    if (currentRunId) return `run_${currentRunId}`;
    return null;
  }, [runId, currentRunId, activeIdea?.index]);
  
  // Log currentActiveIdea on every render
  console.log("=== STEP 3: currentActiveIdea computed ===");
  console.log("activeIdeaState:", activeIdeaState ? {
    title: activeIdeaState.title,
    hasBody: !!activeIdeaState.body,
    bodyLength: activeIdeaState.body?.length || 0
  } : "null");
  console.log("currentActiveIdea:", currentActiveIdea ? {
    title: currentActiveIdea.title,
    hasBody: !!currentActiveIdea.body,
    bodyLength: currentActiveIdea.body?.length || 0
  } : "null");

  // Check cache on mount/idea change and set enrichedBody if found
  useEffect(() => {
    if (ideaId && !enrichedBody && !activeIdeaState?.body && !currentActiveIdea?.body) {
      const cachedEnrichment = getEnrichment(ideaId);
      if (cachedEnrichment) {
        console.log("✅ CACHE LOAD: Found cached enrichment on mount for", ideaId);
        setEnrichedBody(cachedEnrichment);
        setActiveIdeaState(prev => ({
          ...(prev || currentActiveIdea),
          body: cachedEnrichment
        }));
      }
    }
  }, [ideaId, getEnrichment, enrichedBody, activeIdeaState?.body, currentActiveIdea?.body, currentActiveIdea]);

  // Use enrichedBody || activeIdeaState?.body || activeIdea?.body for detail page
  // FIX #1: Always use enrichedBody first, then activeIdeaState, then activeIdea
  const markdown = useMemo(() => {
    const result = enrichedBody || activeIdeaState?.body || activeIdea?.body || "";
    console.log("=== STEP 8: markdown computed ===");
    console.log("enrichedBody length:", enrichedBody?.length || 0);
    console.log("activeIdeaState?.body length:", activeIdeaState?.body?.length || 0);
    console.log("activeIdea?.body length:", activeIdea?.body?.length || 0);
    console.log("markdown length:", result?.length || 0);
    console.log("markdown preview:", result?.substring(0, 200) || "EMPTY");
    return result;
  }, [enrichedBody, activeIdeaState, activeIdea]);

  // Fetch enrichment when user clicks "View details"
  useEffect(() => {
    async function loadEnrichment() {
      console.log("=== STEP 4: Enrichment useEffect triggered ===");
      console.log("currentActiveIdea:", !!currentActiveIdea);
      console.log("currentActiveIdea?.title:", currentActiveIdea?.title);
      console.log("industry:", industry);
      console.log("currentActiveIdea.body:", currentActiveIdea?.body);
      console.log("currentActiveIdea.body length:", currentActiveIdea?.body?.length || 0);
      console.log("stableReports?.profile_analysis:", !!stableReports?.profile_analysis);
      console.log("enrichmentCalledRef.current:", enrichmentCalledRef.current);
      console.log("lastEnrichmentIdeaRef.current:", lastEnrichmentIdeaRef.current);
      
      // Reset ref if idea changed (different idea index)
      const currentIdeaKey = currentActiveIdea?.index !== undefined 
        ? `idea_${currentActiveIdea.index}` 
        : currentActiveIdea?.title;
      
      if (lastEnrichmentIdeaRef.current !== currentIdeaKey) {
        console.log("🔄 Idea changed, resetting enrichment ref");
        enrichmentCalledRef.current = false;
        lastEnrichmentIdeaRef.current = currentIdeaKey;
      }
      
      // Check cache first - if found, skip API call
      const cachedEnrichment = ideaId ? getEnrichment(ideaId) : null;
      if (cachedEnrichment) {
        console.log("✅ CACHE HIT (useEffect): Using cached enrichment for", ideaId);
        setEnrichedBody(cachedEnrichment);
        setActiveIdeaState(prev => ({
          ...(prev || currentActiveIdea),
          body: cachedEnrichment
        }));
        enrichmentCalledRef.current = true;
        return; // Use cached enrichment, skip API call
      }
      
      // Ref-based guard: prevent multiple calls even if component mounts multiple times (React.StrictMode)
      if (enrichmentCalledRef.current) {
        console.log("✅ SKIP: Enrichment already called for this idea (ref guard)");
        return;
      }
      
      // FIX #2: Do NOT run enrichment until profile_analysis is ready
      if (!currentActiveIdea) {
        console.log("❌ BLOCKED: No currentActiveIdea");
        return;
      }
      if (!currentActiveIdea?.title) {
        console.log("❌ BLOCKED: No title");
        return;
      }
      if (!industry) {
        console.log("❌ BLOCKED: No industry");
        return;
      }
      if (currentActiveIdea.body && currentActiveIdea.body.trim().length > 0) {
        console.log("✅ SKIP: Already enriched, body length:", currentActiveIdea.body.length);
        enrichmentCalledRef.current = true; // Mark as called since we already have body
        return; // already enriched
      }
      if (!stableReports?.profile_analysis) {
        console.log("❌ BLOCKED: No profile_analysis");
        return; // wait for profile_analysis to load
      }
      
      console.log("❌ CACHE MISS: No cached enrichment for", ideaId, "- will fetch from API");
      
      // Mark as called BEFORE making the API call to prevent duplicate calls
      enrichmentCalledRef.current = true;
      console.log("✅ Setting enrichmentCalledRef.current = true (before API call)");

      setIsEnriching(true);
      try {
        console.log("=== STEP 5: Making enrichment API call ===");
        console.log("Request payload:", {
          idea: {
            title: currentActiveIdea.title,
            summary: currentActiveIdea.summary,
            target_market: currentActiveIdea.target_market,
            revenue_model: currentActiveIdea.revenue_model
          },
          industry,
          hasProfileAnalysis: !!stableReports?.profile_analysis
        });
        
        const response = await fetch("/api/discovery/enrich_idea?format=json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idea: {
              title: currentActiveIdea.title,
              summary: currentActiveIdea.summary,
              target_market: currentActiveIdea.target_market,
              revenue_model: currentActiveIdea.revenue_model
            },
            industry,
            profile_analysis: stableReports?.profile_analysis
          })
        });

        console.log("=== STEP 6: Enrichment API response received ===");
        console.log("Response status:", response.status);
        const result = await response.json();
        console.log("Response result:", {
          success: result?.success,
          hasEnrichment: !!result?.enrichment,
          hasBody: !!result?.enrichment?.body,
          bodyLength: result?.enrichment?.body?.length || 0
        });
        
        if (result?.success) {
          const enrichmentBody = result.enrichment.body;
          console.log("=== STEP 7: Updating state with enrichment ===");
          console.log("enrichmentBody length:", enrichmentBody?.length);
          console.log("enrichmentBody preview:", enrichmentBody?.substring(0, 100));
          
          // FIX #3: NEVER mutate activeIdea directly - use state update
          console.log("BEFORE setActiveIdeaState - activeIdeaState:", activeIdeaState ? {
            title: activeIdeaState.title,
            bodyLength: activeIdeaState.body?.length || 0
          } : "null");
          console.log("BEFORE setActiveIdeaState - currentActiveIdea:", currentActiveIdea ? {
            title: currentActiveIdea.title,
            bodyLength: currentActiveIdea.body?.length || 0
          } : "null");
          
          // Store enrichment in cache
          if (ideaId && enrichmentBody) {
            setEnrichment(ideaId, enrichmentBody);
            console.log("✅ CACHE STORED: Enrichment saved to cache for", ideaId);
          }
          
          // FIX #5: Update activeIdeaState with enrichment body
          setActiveIdeaState(prev => {
            const newState = {
              ...(prev || currentActiveIdea),
              body: enrichmentBody
            };
            console.log("INSIDE setActiveIdeaState - newState:", {
              title: newState.title,
              bodyLength: newState.body?.length || 0,
              bodyPreview: newState.body?.substring(0, 200)
            });
            return newState;
          });
          
          console.log("BEFORE setEnrichedBody - enrichedBody:", enrichedBody?.length || 0);
          setEnrichedBody(enrichmentBody);
          console.log("AFTER setEnrichedBody - should be:", enrichmentBody?.length);
          console.log("✅ State updates queued - component should re-render with new body");
          
          // FIX #6: Add debugging logs
          console.log("✅ ENRICHMENT COMPLETE");
          console.log("ENRICHMENT: body length:", enrichmentBody?.length);
          console.log("ACTIVE IDEA (computed):", currentActiveIdea?.title);
          console.log("ACTIVE IDEA body length:", currentActiveIdea?.body?.length);
        } else {
          console.error("❌ Enrichment API returned success=false:", result);
        }
      } catch (err) {
        console.error("❌ Enrichment failed", err);
      } finally {
        setIsEnriching(false);
      }
    }

    loadEnrichment();
  }, [currentActiveIdea?.title, currentActiveIdea?.index, industry, stableReports?.profile_analysis]);

  // Load actions and notes for this idea
  useEffect(() => {
    if (!isAuthenticated || !ideaId) return;
    
    const loadActions = async () => {
      setLoadingActions(true);
      try {
        const response = await fetch(`/api/user/actions?idea_id=${encodeURIComponent(ideaId)}`, {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActions(data.actions || []);
          }
        }
      } catch (error) {
        console.error("Failed to load actions:", error);
      } finally {
        setLoadingActions(false);
      }
    };

    const loadNotes = async () => {
      setLoadingNotes(true);
      try {
        const response = await fetch(`/api/user/notes?idea_id=${encodeURIComponent(ideaId)}`, {
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setNotes(data.notes || []);
          }
        }
      } catch (error) {
        console.error("Failed to load notes:", error);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadActions();
    loadNotes();
  }, [ideaId, isAuthenticated, getAuthHeaders]);

  const handleCreateAction = useCallback(async () => {
    if (!newActionText.trim() || !ideaId) return;
    
    try {
      const response = await fetch("/api/user/actions", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: ideaId,
          action_text: newActionText.trim(),
          status: "pending",
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActions((prev) => [data.action, ...prev]);
          setNewActionText("");
        } else {
          alert(data.error || "Failed to create action. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(errorData.error || "Failed to create action. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create action:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }, [newActionText, ideaId, getAuthHeaders]);

  const handleUpdateAction = useCallback(async (actionId, status) => {
    try {
      const response = await fetch(`/api/user/actions/${actionId}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActions((prev) => prev.map((a) => (a.id === actionId ? data.action : a)));
        } else {
          console.error("Failed to update action:", data.error);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Failed to update action:", errorData.error);
      }
    } catch (error) {
      console.error("Failed to update action:", error);
    }
  }, [getAuthHeaders]);

  const handleCreateNote = useCallback(async () => {
    if (!newNoteContent.trim() || !ideaId) return;
    
    try {
      const response = await fetch("/api/user/notes", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_id: ideaId,
          content: newNoteContent.trim(),
          tags: [],
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotes((prev) => [data.note, ...prev]);
          setNewNoteContent("");
        } else {
          alert(data.error || "Failed to create note. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(errorData.error || "Failed to create note. Please try again.");
      }
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Network error. Please check your connection and try again.");
    }
  }, [newNoteContent, ideaId, getAuthHeaders]);
  

  // All sections start closed by default - user can expand as needed

  const runQuery = runId || currentRunId;
  const backPath = runQuery ? `/results/recommendations?id=${runQuery}` : "/results/recommendations";
  
  // Prepare state for back navigation - preserve cached data
  const backState = stateData ? {
    recommendations: stateData.recommendations || reports,
    allIdeas: stateData.allIdeas || ideas,
    runId: stateData.runId || runQuery,
    inputs: stateData.inputs || inputs
  } : undefined;

  // Parse sections and merge with defaults to ensure all sections exist
  // FIX #5: Update useMemo dependencies for sections
  const sections = useMemo(() => {
    console.log("=== STEP 9: Parsing sections ===");
    console.log("render with enrichedBody length:", enrichedBody?.length || 0);
    console.log("render with currentActiveIdea.body length:", currentActiveIdea?.body?.length || 0);
    
    // FIX #1: enrichedBody must ALWAYS override activeIdeaState?.body || activeIdea?.body
    const bodyToParse = enrichedBody || activeIdeaState?.body || activeIdea?.body || "";
    
    // FIX #6: Add debugging logs
    console.log("ENRICHMENT: body length:", enrichedBody?.length || 0);
    console.log("activeIdeaState?.body length:", activeIdeaState?.body?.length || 0);
    console.log("activeIdea?.body length:", activeIdea?.body?.length || 0);
    console.log("ACTIVE IDEA (computed):", currentActiveIdea?.title);
    console.log("Body to parse length:", bodyToParse?.length || 0);
    console.log("Body to parse preview:", bodyToParse?.substring(0, 300) || "EMPTY");
    
    // Return default sections if no activeIdea or no body content
    if (!currentActiveIdea || !bodyToParse || bodyToParse.trim().length === 0) {
      console.log("❌ STEP 9: Returning DEFAULT_SECTIONS - no body to parse");
      const noBodyMsg = `No activeIdea or body - hasActiveIdea: ${!!currentActiveIdea}, hasBody: ${!!bodyToParse}, bodyLength: ${bodyToParse?.length || 0}`;
      console.log("RecommendationDetail: No activeIdea or body", {
        hasActiveIdea: !!currentActiveIdea,
        hasBody: !!bodyToParse,
        bodyLength: bodyToParse?.length
      });
      logToFile(noBodyMsg, "WARN", "RecommendationDetail");
      return {
        merged: DEFAULT_SECTIONS,
        orderedSections: SECTION_ORDER.map(key => ({
          key,
          title: SECTION_LABELS[key],
          content: ""
        }))
      };
    }
    
    const parseStartMsg = `Parsing sections from body - bodyLength: ${bodyToParse.length}, bodyPreview: ${bodyToParse.substring(0, 200)}`;
    console.log("RecommendationDetail: Parsing sections from body", {
      bodyLength: bodyToParse.length,
      bodyPreview: bodyToParse.substring(0, 200)
    });
    logToFile(parseStartMsg, "INFO", "RecommendationDetail");
    
    // Log full body to file
    logSectionToFile("RecommendationDetail - FULL BODY CONTENT", bodyToParse, "DEBUG", "RecommendationDetail");
    
    console.log("=== STEP 10: Calling splitIdeaSections ===");
    console.log("bodyToParse.length:", bodyToParse.length);
    console.log("bodyToParse first 1000 chars:", bodyToParse.substring(0, 1000));
    const parsed = splitIdeaSections(bodyToParse);
    console.log("=== STEP 11: splitIdeaSections returned ===");
    console.log("Parsed sections keys:", Object.keys(parsed));
    console.log("Parsed sections with content:", Object.keys(parsed).filter(k => parsed[k] && parsed[k].trim().length > 0));
    console.log("Parsed sections details:", Object.entries(parsed).map(([k, v]) => ({
      key: k,
      hasContent: !!(v && v.trim().length > 0),
      contentLength: v?.length || 0,
      preview: v?.substring(0, 100) || "EMPTY"
    })));
    
    const parsedMsg = `Parsed sections - parsedKeys: ${Object.keys(parsed).join(", ")}, sectionsWithContent: ${Object.keys(parsed).filter(k => parsed[k]).join(", ")}`;
    console.log("RecommendationDetail: Parsed sections", {
      parsedKeys: Object.keys(parsed),
      sectionsWithContent: Object.keys(parsed).filter(k => parsed[k]),
      parsed
    });
    logToFile(parsedMsg, "INFO", "RecommendationDetail");
    
    // Merge parsed sections with defaults - parsed sections override defaults
    const merged = { ...DEFAULT_SECTIONS, ...parsed };
    
    // Create ordered sections - single source of truth for rendering
    const orderedSections = SECTION_ORDER.map(key => ({
      key,
      title: SECTION_LABELS[key],
      content: merged[key] || ""
    }));
    
    const mergedMsg = `Merged sections - mergedKeys: ${Object.keys(merged).join(", ")}, sectionsWithContent: ${Object.keys(merged).filter(k => merged[k]).join(", ")}`;
    console.log("RecommendationDetail: Merged sections", {
      mergedKeys: Object.keys(merged),
      sectionsWithContent: Object.keys(merged).filter(k => merged[k])
    });
    logToFile(mergedMsg, "INFO", "RecommendationDetail");
    
    console.log("SECTIONS PARSED:", merged);
    logSectionToFile("SECTIONS PARSED (FINAL)", JSON.stringify(merged, null, 2), "INFO", "RecommendationDetail");
    
    // FIX #3: Re-run parsing when enrichment arrives
    console.log("=== STEP 12: Sections useMemo complete ===");
    console.log("Final merged sections keys:", Object.keys(merged));
    console.log("Sections with content:", Object.keys(merged).filter(k => merged[k] && merged[k].trim().length > 0));
    console.log("Ordered sections count:", orderedSections.length);
    
    // Return both merged object (for backward compatibility) and orderedSections
    return { merged, orderedSections };
  }, [enrichedBody, activeIdeaState, activeIdea]);
  
  // Extract merged sections and orderedSections from sections useMemo result
  const parsedSections = useMemo(() => sections.merged || DEFAULT_SECTIONS, [sections]);
  const orderedSections = useMemo(() => 
    SECTION_ORDER.map(key => ({
      key,
      title: SECTION_LABELS[key],
      content: parsedSections[key] || ""
    })),
    [parsedSections]
  );

  // Section toggle IDs mapping
  const getSectionToggleId = (key) => {
    const mapping = {
      why_fits: "why-fits",
      financial_snapshot: "financial",
      execution_path: "execution",
      immediate_experiments: "experiments",
      timeline_effort: "roadmap",
      customer_persona: "persona-validation",
      market_opportunity: "market",
      key_risks: "risk",
      validation_questions: "validation",
      immediate_next_steps: "next-steps",
      decision_checklist: "decision",
      additional_insights: "additional",
    };
    return mapping[key] || key;
  };

  // Section descriptions mapping
  const getSectionDescription = (key) => {
    const descriptions = {
      execution_path: "Move from validation to scale with focused sprints that match your capacity.",
      market_opportunity: "Trends and proof points worth validating as you move forward.",
      customer_persona: "Understand your ideal customer profile and use these validation questions to confirm demand and buying triggers.",
    };
    return descriptions[key] || null;
  };

  const whyFit = useMemo(() => extractWhyFit(parsedSections.intro || ""), [parsedSections]);
  
  const executionSteps = useMemo(
    () =>
      buildExecutionSteps(parsedSections.execution_path || "", activeIdea?.title || "", {
        goalType: inputs?.founder_ambition || "",
        timeCommitment: inputs?.time_commitment || "",
        budgetRange: inputs?.budget_range || "",
        workStyle: inputs?.preferred_work_style || "",
        skillStrength: inputs?.skills ? Object.keys(inputs.skills).filter(k => k !== "other" && inputs.skills[k]?.length > 0).join(", ") : "",
        focus: inputs?.sub_interest_area || inputs?.industry_interest || "",
      }),
    [parsedSections, activeIdea?.title, inputs]
  );
  const financialSnapshot = useMemo(
    () => buildFinancialSnapshots(
      parsedSections.financial_snapshot || "", 
      activeIdea?.title || "",
      inputs?.budget_range || ""
    ),
    [parsedSections, activeIdea?.title, inputs?.budget_range]
  );
  const riskRows = useMemo(() => parseRiskRows(parsedSections.key_risks || ""), [parsedSections]);
  const validationQuestions = useMemo(
    () =>
      buildValidationQuestions(
        parsedSections.validation_questions || "",
        activeIdea?.title || "",
        inputs?.sub_interest_area || inputs?.industry_interest || "",
        inputs?.founder_ambition || ""
      ),
    [parsedSections, activeIdea?.title, inputs]
  );

  const heroStatement = useMemo(() => {
    let statement = "";
    if (whyFit.length > 0) {
      statement = whyFit[0];
    } else if (parsedSections.intro) {
      const introText = personalizeCopy(parsedSections.intro);
      const firstSentence = introText.split(/(?<=[.!?])\s+/)[0];
      if (firstSentence) {
        statement = firstSentence;
      }
    }
    
    // Clean statement - remove "Execution Path:" and other section headers
    if (statement) {
      statement = statement
        .replace(/^execution\s+path[:\s]*/i, "")
        .replace(/^[-*]\s*\*\*execution\s+path\*\*[:\s]*/i, "")
        .replace(/^[-*]\s*execution\s+path[:\s]*/i, "")
        .replace(/\*\*execution\s+path\*\*[:\s]*/gi, "")
        .replace(/^[-*]\s*/g, "")
        .trim();
    }
    
    return statement || "This idea aligns with your goals, strengths, and capacity.";
  }, [whyFit, parsedSections]);

  const fitHighlights = useMemo(() => {
    if (!whyFit.length) return [];
    if (whyFit[0] === heroStatement) {
      return whyFit.slice(1);
    }
    return whyFit;
  }, [whyFit, heroStatement]);

  const heroChips = useMemo(() => {
    if (!inputs) return [];
    const chips = [
      inputs.founder_ambition && { label: "Goal Fit", value: inputs.founder_ambition },
      inputs.time_commitment && { label: "Time Fit", value: inputs.time_commitment },
      inputs.budget_range && { label: "Budget", value: inputs.budget_range },
      (inputs.sub_interest_area || inputs.industry_interest) && {
        label: "Focus",
        value: inputs.sub_interest_area || inputs.industry_interest,
      },
    ].filter(Boolean);
    return chips;
  }, [inputs]);

  const executionPhases = useMemo(() => {
    if (!executionSteps.length) return [];
    const phases = [
      { title: "Validate", steps: executionSteps.slice(0, 3) },
      { title: "Build", steps: executionSteps.slice(3, 6) },
      { title: "Launch", steps: executionSteps.slice(6, 8) },
      { title: "Scale", steps: executionSteps.slice(8, 10) },
    ].filter((phase) => phase.steps.length > 0);
    return phases;
  }, [executionSteps]);

  const executionPhaseCards = useMemo(() => {
    let counter = 0;
    return executionPhases.map((phase) => ({
      title: phase.title,
      items: dedupeStrings(phase.steps).map((step) => {
        counter += 1;
        return { text: step, index: counter };
      }),
    }));
  }, [executionPhases]);

  const marketInsights = useMemo(() => {
    const source = parsedSections.market_opportunity || "";
    return dedupeStrings(extractValidationQuestions(source));
  }, [parsedSections]);

  const personaMarkdown = useMemo(() => parsedSections.customer_persona || "", [parsedSections]);
  const fitNarrativeMarkdown = useMemo(() => {
    const raw = parsedSections.intro || "";
    if (!raw) return "";
    
    // Remove "Why it fits now:" from anywhere in the content (case-insensitive, with optional colon and spaces)
    let cleaned = raw
      .replace(/^why\s+it\s+fits\s+now[:\s]*/gi, "")
      .replace(/\*\*why\s+it\s+fits\s+now\*\*[:\s]*/gi, "")
      .replace(/why\s+it\s+fits\s+now[:\s]*/gi, "")
      .trim();
    
    // Don't use cleanNarrativeMarkdown here as it breaks list structure
    // Just personalize the copy while preserving markdown structure
    return personalizeCopy(cleaned);
  }, [parsedSections]);
  const immediateExperimentsList = useMemo(
    () => dedupeStrings(extractValidationQuestions(parsedSections.immediate_experiments || "")),
    [parsedSections]
  );
  // Use lightweight next_steps from enrichment if available (Discovery-level)
  // Otherwise fall back to markdown sections (from enriched playbook)
  const discoveryNextSteps = activeIdea?.enrichment?.next_steps;
  const immediateNextSteps = useMemo(() => {
    // Prefer enrichment.next_steps from discovery (lightweight)
    if (discoveryNextSteps) {
      // Convert markdown bullets to array
      return discoveryNextSteps.split("\n")
        .filter(line => line.trim().startsWith("-"))
        .map(line => line.trim().replace(/^-\s*/, ""));
    }
    // Fallback to markdown sections
    return dedupeStrings(extractValidationQuestions(parsedSections.immediate_next_steps || ""));
  }, [discoveryNextSteps, parsedSections]);
  const decisionChecklist = useMemo(
    () => dedupeStrings(extractValidationQuestions(parsedSections.decision_checklist || "")),
    [parsedSections]
  );
  const roadmapMarkdown = useMemo(
    () => parsedSections.timeline_effort || "",
    [parsedSections]
  );

  // All sections are now always visible - no filtering needed

  // Function to render section content based on key
  const renderSectionContent = useCallback((sectionKey, content) => {
    // Skip rendering if enrichment is loading and content is empty
    if (isEnriching && !content?.trim()) {
      return <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">Content loading...</p>;
    }

    switch (sectionKey) {
      case "why_fits":
        if (!fitNarrativeMarkdown) {
          return <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No content available yet.</p>;
        }
  return (
                <div className="mt-6 text-slate-700">
                  <style>{`
                    .fit-narrative-content ul {
                      list-style-type: disc;
                      margin-left: 1.5rem;
                      margin-top: 0.75rem;
                      margin-bottom: 0.75rem;
                      padding-left: 0;
                    }
                    .fit-narrative-content ul ul {
                      list-style-type: circle;
                      margin-left: 2rem;
                      margin-top: 0.5rem;
                      margin-bottom: 0.5rem;
                    }
                    .fit-narrative-content ul ul ul {
                      list-style-type: square;
                      margin-left: 2rem;
                    }
                    .fit-narrative-content ol {
                      list-style-type: decimal;
                      margin-left: 1.5rem;
                      margin-top: 0.75rem;
                      margin-bottom: 0.75rem;
                    }
                    .fit-narrative-content ol ol {
                      list-style-type: lower-alpha;
                      margin-left: 2rem;
                    }
                    .fit-narrative-content li {
                      margin-top: 0.5rem;
                      margin-bottom: 0.5rem;
                      line-height: 1.7;
                      padding-left: 0.25rem;
                    }
                    .fit-narrative-content li > p {
                      margin: 0;
                      display: inline;
                    }
                    .fit-narrative-content p {
                      margin-bottom: 1rem;
                      line-height: 1.7;
                    }
                    .fit-narrative-content strong {
                      font-weight: 600;
                      color: #1e293b;
                    }
                  `}</style>
                  <div className="fit-narrative-content">
                    <ReactMarkdown
                      components={{
                        p: ({ node, ...props }) => (
                          <p className="leading-relaxed mb-4" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol {...props} />
                        ),
                        li: ({ node, children, ...props }) => (
                          <li className="leading-relaxed" {...props}>
                            {children}
                          </li>
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-semibold text-slate-900" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-slate-600" {...props} />
                        ),
                      }}
                    >
                      {fitNarrativeMarkdown}
                    </ReactMarkdown>
                  </div>
                </div>
        );

      case "financial_snapshot":
        if (financialSnapshot.length > 0) {
          return (
                <div className="overflow-hidden rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22]">
                  <table className="min-w-full divide-y divide-[#CBD5E1] dark:divide-[#2D3648] text-sm">
                    <thead className="bg-[#F1F5F9] dark:bg-[#1F2937] text-left uppercase tracking-wide text-[#1A1A1A] dark:text-[#EDEDED]">
                      <tr>
                        <th className="px-4 py-3 w-10"></th>
                        <th className="px-4 py-3">Focus</th>
                        <th className="px-4 py-3">Estimate</th>
                        <th className="px-4 py-3 text-right">Benchmark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD5E1] dark:divide-[#2D3648] text-[#3A3A3A] dark:text-[#C4C4C4]">
                      {financialSnapshot.map(({ focus, estimate, metric }, index) => (
                        <tr key={`${focus}-${index}`}>
                          <td className="px-4 py-3 text-[#16A34A] dark:text-[#22C55E]">✓</td>
                          <td className="px-4 py-3 font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">{focus}</td>
                          <td className="px-4 py-3">{estimate}</td>
                          <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">{metric}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          );
        }
        return content?.trim() ? (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
                </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No financial snapshot available yet.</p>
        );

      case "execution_path":
        if (executionPhaseCards.length > 0) {
          return (
                <div className="grid gap-4 md:grid-cols-2">
                  {executionPhaseCards.map((phase) => (
                    <div key={phase.title} className="rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7A7A7A] dark:text-[#8B949E]">{phase.title}</h3>
                      <ol className="mt-3 space-y-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
                        {phase.items.map((item) => (
                          <li key={item.index} className="flex gap-3">
                            <span className="min-w-[2.25rem] rounded-full bg-[#EEF2FF] dark:bg-[rgba(99,102,241,0.15)] px-2 py-1 text-center font-semibold text-[#3730A3] dark:text-[#A5B4FC]">
                              {item.index}
                            </span>
                            <span>{item.text}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
          );
        }
        return content?.trim() ? (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
                </div>
              ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No execution path available yet.</p>
        );

      case "immediate_experiments":
        if (immediateExperimentsList.length > 0) {
          return (
            <ul className="space-y-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
              {immediateExperimentsList.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="mt-1 text-[#2563EB] dark:text-[#3B82F6]">•</span>
                  <span>{item}</span>
                    </li>
                  ))}
                </ul>
          );
        }
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No experiments available yet.</p>
        );

      case "timeline_effort":
        if (roadmapMarkdown) {
          const hasBullets = /^[-*]\s+/m.test(roadmapMarkdown);
          if (hasBullets) {
            return (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
                <ReactMarkdown>{roadmapMarkdown}</ReactMarkdown>
                </div>
            );
          }
          return (
            <div className="grid gap-4 md:grid-cols-3">
              {["0-30 Days", "30-60 Days", "60-90 Days"].map((window, index) => {
                const segmentContent = extractTimelineSlice(roadmapMarkdown, index);
                return (
                  <div key={window} className="rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                    <p className="text-xs uppercase tracking-wide text-[#2563EB] dark:text-[#3B82F6]">{window}</p>
                    <div className="mt-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
                      <ReactMarkdown>{segmentContent}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No timeline information available yet.</p>
        );

      case "customer_persona":
        return (
              <div className="space-y-6">
                {personaMarkdown && (
                  <div className="mt-6 pb-6 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#EDEDED] mb-2 border-l-4 border-[#2563EB] dark:border-[#3B82F6] pl-3">Customer Persona</h3>
                    <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] mb-3">
                      A detailed profile of your ideal customer—their demographics, pain points, goals, and buying behavior.
                    </p>
                    <div className="rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => (
                            <p className="text-[#3A3A3A] dark:text-[#C4C4C4] leading-relaxed mb-3" {...props} />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong className="font-semibold text-[#1A1A1A] dark:text-[#EDEDED]" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="list-disc list-outside space-y-2 text-[#3A3A3A] dark:text-[#C4C4C4] mb-3 ml-5" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                        }}
                      >
                        {cleanNarrativeMarkdown(personaMarkdown)}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                {validationQuestions.length > 0 && (
                  <div className="mt-0">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#EDEDED] mb-2 border-l-4 border-[#2563EB] dark:border-[#3B82F6] pl-3">Validation Questions</h3>
                    <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] mb-3">
                      Ask these during discovery interviews, quick surveys, or pilot onboarding to confirm demand, willingness to pay, and whether the idea solves the right pain.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      {validationQuestions.map(({ question, listenFor, actOn }, index) => (
                        <div
                          key={index}
                          className="rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                        >
                          <p className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">Question {index + 1}</p>
                          <p className="mt-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">{question}</p>
                          <p className="mt-3 text-xs text-[#7A7A7A] dark:text-[#8B949E]">
                            <strong>What to listen for:</strong> {listenFor}
                          </p>
                          <p className="mt-2 text-xs text-[#7A7A7A] dark:text-[#8B949E]">
                            <strong>Act on it:</strong> {actOn}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            {!personaMarkdown && validationQuestions.length === 0 && (
              <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No customer persona information available yet.</p>
                )}
              </div>
        );

      case "market_opportunity":
        if (marketInsights.length > 0) {
          return (
            <ul className="space-y-3 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
              {marketInsights.map((insight, index) => (
                <li
                  key={index}
                  className="flex gap-3 rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-3 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                >
                  <span className="mt-1 text-[#2563EB] dark:text-[#3B82F6]">📈</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          );
        }
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No market opportunity information available yet.</p>
        );

      case "key_risks":
        if (riskRows.length > 0) {
          return (
            <div className="overflow-hidden rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22]">
              <table className="min-w-full divide-y divide-[#CBD5E1] dark:divide-[#2D3648] text-sm">
                <thead className="bg-[#F1F5F9] dark:bg-[#1F2937] text-left uppercase tracking-wide text-[#1A1A1A] dark:text-[#EDEDED]">
                  <tr>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3 w-32">Severity</th>
                    <th className="px-4 py-3">Early mitigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CBD5E1] dark:divide-[#2D3648]">
                  {riskRows.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-[#3A3A3A] dark:text-[#C4C4C4]">{row.risk}</td>
                      <td className="px-4 py-3 font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">{row.severity}</td>
                      <td className="px-4 py-3 text-[#3A3A3A] dark:text-[#C4C4C4]">{row.mitigation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No risk information available yet.</p>
        );

      case "validation_questions":
        if (validationQuestions.length > 0) {
          return (
                <div className="grid gap-4 md:grid-cols-2">
                  {validationQuestions.map(({ question, listenFor, actOn }, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                    >
                      <p className="font-semibold text-[#2563EB] dark:text-[#3B82F6]">Question {index + 1}</p>
                      <p className="mt-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">{question}</p>
                      <p className="mt-3 text-xs text-[#7A7A7A] dark:text-[#8B949E]">
                        <strong>What to listen for:</strong> {listenFor}
                      </p>
                      <p className="mt-2 text-xs text-[#7A7A7A] dark:text-[#8B949E]">
                        <strong>Act on it:</strong> {actOn}
                      </p>
                    </div>
                  ))}
                </div>
          );
        }
        return content?.trim() ? (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
                </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No validation questions available yet.</p>
        );

      case "immediate_next_steps":
        if (discoveryNextSteps) {
          return (
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown
                    components={{
                      ul: ({ node, ...props }) => (
                        <ul className="space-y-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4] list-disc list-inside" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="leading-relaxed" {...props} />
                      ),
                    }}
                  >
                    {discoveryNextSteps}
                  </ReactMarkdown>
                </div>
          );
        }
        if (immediateNextSteps.length > 0) {
          return (
                <ul className="space-y-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
                  {immediateNextSteps.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1 text-[#2563EB] dark:text-[#3B82F6]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
          );
        }
        return content?.trim() ? (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
                </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No next steps available yet.</p>
        );

      case "decision_checklist":
        if (decisionChecklist.length > 0) {
          return (
                <ul className="space-y-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
                  {decisionChecklist.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-1 text-[#2563EB] dark:text-[#3B82F6]">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
          );
        }
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No decision checklist available yet.</p>
        );

      case "additional_insights":
        return content?.trim() ? (
                <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
                </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No additional insights available yet.</p>
        );

      default:
        return content?.trim() ? (
          <div className="prose prose-slate max-w-none text-[#3A3A3A] dark:text-[#C4C4C4]">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E] italic">No content available yet.</p>
        );
    }
  }, [
    isEnriching,
    fitNarrativeMarkdown,
    financialSnapshot,
    executionPhaseCards,
    immediateExperimentsList,
    roadmapMarkdown,
    personaMarkdown,
    validationQuestions,
    marketInsights,
    riskRows,
    discoveryNextSteps,
    immediateNextSteps,
    decisionChecklist,
  ]);

  const otherIdeas = useMemo(
    () => ideas.filter((idea) => activeIdea && idea.index !== activeIdea.index),
    [ideas, activeIdea]
  );

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionKey)) {
        next.delete(sectionKey);
      } else {
        next.add(sectionKey);
      }
      return next;
    });
  };

  // Redirect if we have stage2Markdown but the idea index doesn't match
  if (stage2Markdown && !activeIdea && ideas.length > 0) {
    return <Navigate to={backPath} replace state={backState} />;
  }

  // Optional UI polish: Prevent confusing first empty parse
  if (!activeIdeaState?.body && !enrichedBody && !isEnriching && !activeIdea) {
    return null;
  }

  // Loading state: Show spinner when enriching and no body yet
  // Check all possible body sources: enrichedBody, activeIdeaState.body, currentActiveIdea.body
  const hasBody = !!(enrichedBody?.length > 0 || activeIdeaState?.body?.length > 0 || currentActiveIdea?.body?.length > 0);
  
  // Show loading indicator when:
  // 1. Loading from API
  // 2. Enriching and no body yet (but we have an activeIdea)
  // 3. No activeIdea but we have stage2Markdown (data is being parsed)
  const isLoadingPage = loading || (!hasBody && isEnriching && activeIdea) || (!activeIdea && stage2Markdown);
  
  // Loading steps for recommendation detail
  const detailSteps = [
    { step: 1, total: 3, text: "Analyzing your profile", description: "Understanding your goals, skills, and constraints" },
    { step: 2, total: 3, text: "Preparing detailed playbook", description: "Creating personalized action plans and next steps" },
    { step: 3, total: 3, text: "Finalizing recommendations", description: "Reviewing and optimizing your personalized insights" },
  ];
  
  const [detailStepIndex, setDetailStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [detailStartTime] = useState(Date.now());
  
  useEffect(() => {
    if (isLoadingPage) {
      // Progress through steps
      const stepInterval = setInterval(() => {
        setDetailStepIndex((prev) => {
          if (prev < detailSteps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 10000); // Change step every 10 seconds
      
      // Update elapsed time every second
      const timeInterval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - detailStartTime) / 1000));
      }, 1000);
      
      return () => {
        clearInterval(stepInterval);
        clearInterval(timeInterval);
      };
    } else {
      // Reset when not loading
      setDetailStepIndex(0);
      setElapsedSeconds(0);
    }
  }, [isLoadingPage, detailStartTime]);
  
  const currentDetailStep = detailSteps[detailStepIndex];
  const progressPercent = Math.min(95, (elapsedSeconds / 20) * 100); // Cap at 95% until complete
  
  if (isLoadingPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-md rounded-3xl border-2 border-brand-300 bg-white p-8 shadow-2xl">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
              </div>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              {isEnriching ? "Generating Detailed Playbook" : "Generating Recommendations"}
            </h3>
            <p className="mb-2 text-sm text-slate-600">
              Step {currentDetailStep.step} of {currentDetailStep.total}
            </p>
            
            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-brand-100">
              <div 
                className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            <p className="mb-1 text-base font-semibold text-brand-700">
              {currentDetailStep.text}...
            </p>
            <p className="text-xs text-slate-500">
              {currentDetailStep.description}
            </p>
            
            <div className="mt-4 space-y-1">
              <p className="text-xs text-slate-500">
                Time elapsed: {elapsedSeconds}s
              </p>
              <p className="text-xs font-medium text-brand-600">
                Generating recommendations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#FAFAFA] dark:bg-[#0D1117] grid gap-6 py-6">
      <Seo
        title={
          activeIdea
            ? `${activeIdea.title} | Recommendation Detail`
            : "Recommendation Detail | Startup Idea Advisor"
        }
        description="Dive deeper into the selected startup recommendation, including financial outlook, risk radar, and validation plan."
        path={`/results/recommendations/${ideaIndex}`}
      />

          <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm font-medium"
            >
              ← Back to Dashboard
            </Link>
          )}
          <button
            onClick={() => navigate(backPath, { state: backState })}
            className="inline-flex items-center gap-2 text-[#2563EB] dark:text-[#3B82F6] hover:text-[#1D4ED8] dark:hover:text-[#1E40AF] transition-colors"
          >
            <span aria-hidden="true">←</span> Back to recommendations
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                const size = getLogBufferSize();
                if (size > 0) {
                  downloadLogFile();
                } else {
                  alert("No logs collected yet. Logs will be collected as you interact with the page.");
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-semibold transition-colors shadow-sm"
              title={`Download all collected logs as mylog.log (${getLogBufferSize()} entries)`}
            >
              📥 Download Logs ({getLogBufferSize()})
            </button>
          )}
        </div>
        {activeIdea && runQuery && (
          <OpenForCollaboratorsButton
            runId={runQuery}
            sourceType="advisor"
            sourceId={runQuery}
            ideaTitle={activeIdea.title}
            ideaIndex={activeIdea.index}
            categoryAnswers={inputs}
          />
        )}
      </div>


      {!loading && !stage2Markdown && (
        <div className="rounded-3xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">No report available</h2>
          <p className="mt-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
            We couldn't find a saved recommendation report. Return to the home page to run a new session.
          </p>
        </div>
      )}

      {stage2Markdown && ideas.length > 0 && !activeIdea && (
        <div className="rounded-3xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
          <h2 className="text-lg font-semibold text-[#1A1A1A] dark:text-[#EDEDED]">Idea not found</h2>
          <p className="mt-2 text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">
            Idea #{ideaIndex} not found in the recommendations. Available ideas: {ideas.map(i => i.index).join(", ")}
          </p>
          <button
            onClick={() => navigate(backPath, { state: backState })}
            className="mt-4 inline-block text-sm font-semibold text-[#2563EB] dark:text-[#3B82F6] hover:underline"
          >
            Back to recommendations
          </button>
                      </div>
      )}

      {/* Only show sections when body exists - check all possible body sources */}
      {activeIdea && (enrichedBody?.length > 0 || activeIdeaState?.body?.length > 0 || currentActiveIdea?.body?.length > 0) && (
        <>
          <article className="rounded-3xl bg-white dark:bg-[#161B22] px-8 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-wide text-[#7A7A7A] dark:text-[#8B949E]">Idea #{activeIdea.index}</p>
              {(actions.length > 0 || notes.length > 0) && (
                <div className="flex items-center gap-2">
                  {actions.length > 0 && (
                    <span 
                      className="inline-flex items-center gap-1 rounded-2xl bg-[#EEF2FF] dark:bg-[rgba(99,102,241,0.15)] border dark:border-[rgba(99,102,241,0.35)] px-[10px] py-1 text-[13px] font-medium text-[#3730A3] dark:text-[#A5B4FC]"
                      title={`${actions.length} action item${actions.length !== 1 ? 's' : ''}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {actions.length} Task{actions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {notes.length > 0 && (
                    <span 
                      className="inline-flex items-center gap-1 rounded-2xl bg-[#EEF2FF] dark:bg-[rgba(99,102,241,0.15)] border dark:border-[rgba(99,102,241,0.35)] px-[10px] py-1 text-[13px] font-medium text-[#3730A3] dark:text-[#A5B4FC]"
                      title={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {notes.length} Note{notes.length !== 1 ? 's' : ''}
                    </span>
                  )}
                    </div>
              )}
            </div>
            <h1 className="text-[22px] font-semibold mb-2 text-[#1A1A1A] dark:text-[#EDEDED]">{activeIdea.title}</h1>
            <p className="mt-4 max-w-3xl text-sm md:text-base text-[#3A3A3A] dark:text-[#C4C4C4]">{heroStatement}</p>
            
            {/* Idea Attributes */}
            {activeIdea.timeline && (
              <div className="mt-0">
                <span className="text-xs font-medium text-[#7A7A7A] dark:text-[#8B949E] mb-2 block">Timeline</span>
                <span className="inline-block rounded-full bg-[#FEE2E2] dark:bg-[rgba(239,68,68,0.20)] px-4 py-2 text-sm font-medium text-[#991B1B] dark:text-[#FCA5A5]">
                  {activeIdea.timeline}
                </span>
              </div>
            )}
            
            {activeIdea.validation_score && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[#7A7A7A] dark:text-[#8B949E]">Validation Score</span>
                  <span className="text-sm font-semibold text-[#16A34A] dark:text-[#22C55E]">{activeIdea.validation_score}/10</span>
                </div>
                <div className="h-[6px] rounded-[4px] bg-[rgba(22,163,74,0.15)] dark:bg-[rgba(34,197,94,0.15)] overflow-hidden">
                  <div 
                    className="h-full bg-[#16A34A] dark:bg-[#22C55E] rounded-[4px] transition-all"
                    style={{ width: `${(parseInt(activeIdea.validation_score) / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {heroChips.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {heroChips.map(({ label, value }) => (
                  <span
                    key={`${label}-${value}`}
                    className="rounded-2xl bg-[#EEF2FF] dark:bg-[rgba(99,102,241,0.15)] border dark:border-[rgba(99,102,241,0.35)] px-[10px] py-1 text-[13px] font-medium text-[#3730A3] dark:text-[#A5B4FC]"
                  >
                    {label}: {value}
                  </span>
                  ))}
                </div>
            )}
            
            {activeIdea.target_market && (
              <div className="mt-4">
                <span className="text-xs font-medium text-[#7A7A7A] dark:text-[#8B949E] mb-2 block">Target Market</span>
                <p className="text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">{activeIdea.target_market}</p>
                </div>
              )}
            
            {activeIdea.revenue_model && (
              <div className="mt-4">
                <span className="text-xs font-medium text-[#7A7A7A] dark:text-[#8B949E] mb-2 block">Revenue Model</span>
                <p className="text-sm text-[#3A3A3A] dark:text-[#C4C4C4]">{activeIdea.revenue_model}</p>
              </div>
            )}
          </article>

          <div className="flex flex-col gap-6">
            {/* Render all sections from orderedSections - single source of truth */}
            {orderedSections.map((section) => {
              // Skip why_fits if fitNarrativeMarkdown is not available (special case)
              if (section.key === "why_fits" && !fitNarrativeMarkdown) {
                return null;
              }
              
              const toggleId = getSectionToggleId(section.key);
              const description = getSectionDescription(section.key);
              const title = section.key === "immediate_next_steps" && discoveryNextSteps 
                ? "Early-stage Next Steps" 
                : section.title;
              
              return (
            <CollapsibleSection
                  key={section.key}
                  title={title}
                  description={description}
                  theme={getSectionTheme(title)}
                  isOpen={openSections.has(toggleId)}
                  onToggle={() => toggleSection(toggleId)}
                >
                  {renderSectionContent(section.key, section.content)}
            </CollapsibleSection>
              );
            })}

          {/* Action Items Section */}
          {isAuthenticated && (
            <CollapsibleSection
              title="Action Items"
              description="Track your progress on this idea. Mark items as completed as you work through them."
              theme={getSectionTheme("Action Items")}
              isOpen={openSections.has("actions")}
              onToggle={() => toggleSection("actions")}
            >
              <div className="space-y-4">
                {/* Add new action */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateAction()}
                    placeholder="Add a new action item..."
                    className="flex-1 rounded-lg border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] px-3 py-2 text-sm text-[#1A1A1A] dark:text-[#EDEDED] focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/20"
                  />
                  <button
                    onClick={handleCreateAction}
                    disabled={!newActionText.trim()}
                    className="rounded-lg bg-[#2563EB] dark:bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {/* Actions list */}
                {loadingActions ? (
                  <p className="text-sm text-slate-500">Loading actions...</p>
                ) : actions.length === 0 ? (
                  <p className="text-sm text-slate-500">No action items yet. Add one above to get started!</p>
                ) : (
                  <div className="space-y-2">
                    {actions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <select
                          value={action.status}
                          onChange={(e) => handleUpdateAction(action.id, e.target.value)}
                          className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 focus:border-brand-400 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <span
                          className={`flex-1 text-sm ${
                            action.status === "completed" ? "line-through text-slate-500" : "text-slate-900"
                          }`}
                        >
                          {action.action_text}
                        </span>
                        {action.due_date && (() => {
                          try {
                            const dueDate = new Date(action.due_date);
                            if (!isNaN(dueDate.getTime())) {
                              return (
                                <span className="text-xs text-slate-500">
                                  Due: {dueDate.toLocaleDateString()}
                                </span>
                              );
                            }
                          } catch (e) {
                            // Invalid date, don't show
                          }
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}

          {/* Notes Section */}
          {isAuthenticated && (
            <CollapsibleSection
              title="Notes & Journal"
              description="Capture your thoughts, insights, customer feedback, and research findings for this idea."
              theme={getSectionTheme("Notes")}
              isOpen={openSections.has("notes")}
              onToggle={() => toggleSection("notes")}
            >
              <div className="space-y-4">
                {/* Add new note */}
                <div className="space-y-2">
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Add a note... (e.g., customer interview insights, pivot ideas, market research)"
                    rows={4}
                    className="w-full rounded-lg border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] px-3 py-2 text-sm text-[#1A1A1A] dark:text-[#EDEDED] focus:border-[#2563EB] dark:focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 dark:focus:ring-[#3B82F6]/20"
                  />
                  <button
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim()}
                    className="rounded-lg bg-[#2563EB] dark:bg-[#2563EB] hover:bg-[#1D4ED8] dark:hover:bg-[#1E40AF] px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>

                {/* Notes list */}
                {loadingNotes ? (
                  <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E]">Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p className="text-sm text-[#7A7A7A] dark:text-[#8B949E]">No notes yet. Add one above to start tracking your insights!</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-lg border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-[#7A7A7A] dark:text-[#8B949E]">
                            {note.created_at ? (() => {
                              try {
                                const date = new Date(note.created_at);
                                return isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString();
                              } catch (e) {
                                return "Unknown date";
                              }
                            })() : "Unknown date"}
                          </span>
                          {note.updated_at && note.created_at && note.updated_at !== note.created_at && (
                            <span className="text-xs text-[#7A7A7A] dark:text-[#8B949E]">(edited)</span>
                          )}
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-[#1A1A1A] dark:text-[#EDEDED]">{note.content}</p>
                        {note.tags && note.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {note.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="rounded-2xl bg-[#EEF2FF] dark:bg-[rgba(99,102,241,0.15)] border dark:border-[rgba(99,102,241,0.35)] px-[10px] py-1 text-[13px] font-medium text-[#3730A3] dark:text-[#A5B4FC]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                if (!activeIdea) return;
                const result = await validateRecommendationIdea(activeIdea, inputs, reports?.profile_analysis);
                if (result.success && result.validation?.id) {
                  navigate(`/validate-result?id=${result.validation.id}`);
                }
              }}
              disabled={validating || !activeIdea}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed px-4 py-[10px] text-sm font-semibold text-white transition-colors"
            >
              {validating ? "Validating..." : "Validate Idea"}
            </button>
            <button
              onClick={() => navigate(backPath, { state: backState })}
              className="inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] px-4 py-[10px] text-sm font-semibold text-[#3A3A3A] dark:text-[#D1D5DB] transition-colors"
            >
              Back to top ideas
            </button>
          </div>

          {/* Explore other ideas section removed based on feedback */}
        </>
      )}
    </section>
  );
}


