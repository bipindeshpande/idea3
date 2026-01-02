import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, Navigate, useLocation, useParams, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
import DiscoveryCard from "../../components/discovery/DiscoveryCard.jsx";
import DiscoveryHeader from "../../components/discovery/DiscoveryHeader.jsx";
import DiscoveryBadge from "../../components/discovery/DiscoveryBadge.jsx";
import DiscoveryNavigation from "../../components/discovery/DiscoveryNavigation.jsx";
import DiscoveryEmptyState from "../../components/discovery/DiscoveryEmptyState.jsx";
import DiscoveryLoadingState from "../../components/discovery/DiscoveryLoadingState.jsx";
import IdeaAttributes from "../../components/discovery/IdeaAttributes.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "../../components/discovery/DiscoveryTheme.js";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import OpenForCollaboratorsButton from "../../components/founder/OpenForCollaboratorsButton.jsx";
import CollapsibleSection from "../../components/ui/CollapsibleSection.jsx";
import { parseStructuredIdeas, trimFromHeading } from "../../utils/streamingParser.js";
import {
  splitIdeaSections,
  extractWhyFit,
  buildExecutionSteps,
  buildFinancialSnapshots,
  parseRiskRows,
  buildValidationQuestions,
  extractValidationQuestions,
  personalizeCopy,
  dedupeStrings,
} from "../../utils/formatters/recommendationFormatters.js";
import { logToFile, logSectionToFile, downloadLogFile, getLogBufferSize } from "../../utils/fileLogger.js";
// Import extracted modules
import { SECTION_ORDER, SECTION_LABELS, DEFAULT_SECTIONS, getSectionToggleId, getSectionDescription } from "../../components/recommendations/utils/sectionConstants.js";
import { getSectionTheme } from "../../components/recommendations/utils/sectionThemes.js";
import { useSectionToggle } from "../../components/recommendations/hooks/useSectionToggle.js";
import RecommendationSections from "../../components/recommendations/RecommendationSections.jsx";

function useQuery() {
  return new URLSearchParams(useLocation().search);
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
 const cachedIdea = stateData?.idea; // Idea passed directly from parent
 const cachedRun = stateData?.run; // Full run object from Past Sessions
 const reports = cachedRun?.reports || cachedRun?.outputs || stateData?.recommendations || contextReports;
 const inputs = cachedRun?.inputs || stateData?.inputs || contextInputs;
 const cachedAllIdeas = cachedRun?.reports?.recommendations_structured || cachedRun?.outputs?.recommendations_structured || stateData?.allIdeas;
 
 // FIX #1: Industry extraction must be consistent
 const industry = inputs?.industry_interest || "";
 
  // FIX #8: Freeze reports to prevent reloading discovery - freeze on first render only
  const stableReports = useMemo(() => reports, []);
  const { openSections, toggleSection } = useSectionToggle();
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
 // PRIORITY 0: If we have cached idea or cached run from navigation state, use it immediately
 // This prevents ALL API calls and LLM computations
 if (cachedIdea || cachedRun) {
 if (process.env.NODE_ENV === 'development') {
 console.log("[RecommendationDetail] Using cached data from navigation state, skipping ALL API/LLM calls", {
 hasCachedIdea: !!cachedIdea,
 hasCachedRun: !!cachedRun
 });
 }
 return; // Use cached data, no API call needed
 }
 
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
 }, [runId, currentRunId, loading, stableReports, loadRunById, stateData, cachedIdea, cachedRun]); // Use stableReports to prevent reloads

 // Keep original markdown for ideas parsing (Stage 2 body)
 // FIX #8: Use stableReports to prevent re-parsing
 const stage2Markdown = useMemo(
 () => trimFromHeading(stableReports?.personalized_recommendations ?? "", "### Comprehensive Recommendation Report"),
 [stableReports]
 );

 const ideas = useMemo(() => {
 // Priority 1: If we have cached idea directly, wrap it in array
 if (cachedIdea) {
 return [cachedIdea];
 }
 
 // Priority 2: Use cached ideas from navigation state
 if (cachedAllIdeas && Array.isArray(cachedAllIdeas) && cachedAllIdeas.length > 0) {
 return cachedAllIdeas;
 }
 
 // Priority 3: Try structured parser from reports
 // FIX #8: Use stableReports to prevent re-parsing
 const raw = stableReports?.personalized_recommendations || "";
 const structuredParsed = parseStructuredIdeas(raw);
 if (structuredParsed && structuredParsed.length > 0) {
 return structuredParsed;
 }
 // Fallback: markdown parser
 return parseStructuredIdeas(stage2Markdown, 10);
 }, [stage2Markdown, stableReports, cachedAllIdeas, cachedIdea]);
 
 const numericIndex = Number.parseInt(ideaIndex ?? "", 10);
 // If we have cached idea, use it directly (ignore index matching)
 const activeIdea = cachedIdea || ideas.find((idea) => idea.index === numericIndex);
 
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
 body: existingBody // Keep the enriched body
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
 // Canonical idea_id format: {run_id}::idea_{index}
 // Example: "abc123::idea_1"
 // This format must not change.
 const ideaId = useMemo(() => {
 // Use currentActiveIdea instead of activeIdea to get the most up-to-date value
 const idea = currentActiveIdea || activeIdea;
 
 // Canonical format: run_id + "::idea_" + idea_index
 let computedId = null;
 const effectiveRunId = runId || currentRunId;
 
 if (effectiveRunId && idea?.index !== undefined) {
 // Canonical format: {runId}::idea_{index}
 computedId = `${effectiveRunId}::idea_${idea.index}`;
 } else if (effectiveRunId) {
 // Fallback: just run_id (should not happen in practice, but handle gracefully)
 computedId = `${effectiveRunId}::idea_0`;
 console.warn("[RecommendationDetail] Computed ideaId without idea index, using 0 as fallback:", computedId);
 } else if (idea?.index !== undefined) {
 // Cannot create canonical format without run_id - this is an error case
 console.error("[RecommendationDetail] Cannot compute canonical ideaId: missing runId", {
 ideaIndex: idea.index,
 runId,
 currentRunId
 });
 return null;
 }
 
 if (computedId) {
 console.log("[RecommendationDetail] Computed canonical ideaId:", computedId, {
 runId: effectiveRunId,
 ideaIndex: idea?.index,
 hasActiveIdea: !!idea
 });
 } else {
 console.warn("[RecommendationDetail] Could not compute ideaId:", {
 runId,
 currentRunId,
 activeIdeaIndex: activeIdea?.index,
 currentActiveIdeaIndex: currentActiveIdea?.index,
 hasActiveIdea: !!activeIdea,
 hasCurrentActiveIdea: !!currentActiveIdea
 });
 }
 
 return computedId;
 }, [runId, currentRunId, activeIdea?.index, currentActiveIdea?.index]);
 
 // Validate ideaId format - defensive guard
 const isValidIdeaId = ideaId && typeof ideaId === 'string' && ideaId.includes('::idea_');
 
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
 // CRITICAL: Disable enrichment if viewing cached idea or cached run (from Past Sessions)
 if (cachedIdea || cachedRun) {
 if (process.env.NODE_ENV === 'development') {
 console.log("[RecommendationDetail] Enrichment disabled - viewing cached data", {
 hasCachedIdea: !!cachedIdea,
 hasCachedRun: !!cachedRun
 });
 }
 // If cached idea has body, use it
 if (cachedIdea?.body) {
 setEnrichedBody(cachedIdea.body);
 setActiveIdeaState(cachedIdea);
 }
 enrichmentCalledRef.current = true; // Mark as "called" to prevent future calls
 return; // No API call, no LLM computation
 }
 
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
 }, [currentActiveIdea?.title, currentActiveIdea?.index, industry, stableReports?.profile_analysis, cachedIdea, cachedRun, ideaId, getEnrichment, setEnrichment, getAuthHeaders]);

 // Load actions and notes for this idea
 useEffect(() => {
 if (!isAuthenticated || !ideaId) {
 // Clear actions/notes if no ideaId
 if (!ideaId) {
 setActions([]);
 setNotes([]);
 }
 return;
 }
 
 console.log("[RecommendationDetail] Loading actions and notes for ideaId:", ideaId);
 
 const loadActions = async () => {
 setLoadingActions(true);
 try {
 const url = `/api/user/actions?idea_id=${encodeURIComponent(ideaId)}`;
 console.log("[RecommendationDetail] Fetching actions from:", url);
 
 const response = await fetch(url, {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 
 console.log("[RecommendationDetail] Actions response status:", response.status, response.statusText);
 
 if (response.ok) {
 const text = await response.text();
 console.log("[RecommendationDetail] Actions response raw text:", text.substring(0, 500));
 
 let data;
 try {
 data = JSON.parse(text);
 } catch (e) {
 console.error("[RecommendationDetail] Failed to parse JSON:", e, "Text:", text);
 return;
 }
 
 console.log("[RecommendationDetail] Actions API response:", {
 success: data.success,
 actionsCount: data.actions?.length || 0,
 actions: data.actions,
 fullResponse: data,
 hasActions: !!data.actions,
 isArray: Array.isArray(data.actions)
 });
 
 if (data.success) {
 const actionsArray = Array.isArray(data.actions) ? data.actions : (data.actions ? [data.actions] : []);
 console.log("[RecommendationDetail] Setting actions state with:", actionsArray.length, "items");
 console.log("[RecommendationDetail] Actions data:", JSON.stringify(actionsArray, null, 2));
 
 setActions(actionsArray);
 
 // Verify state was set after a brief delay
 setTimeout(() => {
 console.log("[RecommendationDetail] Actions state after setState (check):", actionsArray.length);
 }, 100);
 } else {
 console.error("[RecommendationDetail] Failed to load actions - success=false:", data.error);
 setActions([]);
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 console.error("[RecommendationDetail] Failed to load actions:", response.status, errorData);
 setActions([]);
 }
 } catch (error) {
 console.error("[RecommendationDetail] Exception loading actions:", error);
 setActions([]);
 } finally {
 setLoadingActions(false);
 }
 };

 const loadNotes = async () => {
 setLoadingNotes(true);
 try {
 const url = `/api/user/notes?idea_id=${encodeURIComponent(ideaId)}`;
 console.log("[RecommendationDetail] Fetching notes from:", url);
 
 const response = await fetch(url, {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 
 console.log("[RecommendationDetail] Notes response status:", response.status, response.statusText);
 
 if (response.ok) {
 const text = await response.text();
 console.log("[RecommendationDetail] Notes response raw text:", text.substring(0, 500));
 
 let data;
 try {
 data = JSON.parse(text);
 } catch (e) {
 console.error("[RecommendationDetail] Failed to parse JSON:", e, "Text:", text);
 return;
 }
 
 console.log("[RecommendationDetail] Notes API response:", {
 success: data.success,
 notesCount: data.notes?.length || 0,
 notes: data.notes,
 fullResponse: data,
 hasNotes: !!data.notes,
 isArray: Array.isArray(data.notes)
 });
 
 if (data.success) {
 const notesArray = Array.isArray(data.notes) ? data.notes : (data.notes ? [data.notes] : []);
 console.log("[RecommendationDetail] Setting notes state with:", notesArray.length, "items");
 console.log("[RecommendationDetail] Notes data:", JSON.stringify(notesArray, null, 2));
 
 setNotes(notesArray);
 
 // Verify state was set after a brief delay
 setTimeout(() => {
 console.log("[RecommendationDetail] Notes state after setState (check):", notesArray.length);
 }, 100);
 } else {
 console.error("[RecommendationDetail] Failed to load notes - success=false:", data.error);
 setNotes([]);
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 console.error("[RecommendationDetail] Failed to load notes:", response.status, errorData);
 setNotes([]);
 }
 } catch (error) {
 console.error("[RecommendationDetail] Exception loading notes:", error);
 setNotes([]);
 } finally {
 setLoadingNotes(false);
 }
 };

 loadActions();
 loadNotes();
 }, [ideaId, isAuthenticated, getAuthHeaders]);

 // Debug: Log whenever actions or notes state changes
 useEffect(() => {
 console.log("[RecommendationDetail] Actions state changed:", {
 count: actions.length,
 actions: actions,
 ideaId: ideaId
 });
 }, [actions, ideaId]);

 useEffect(() => {
 console.log("[RecommendationDetail] Notes state changed:", {
 count: notes.length,
 notes: notes,
 ideaId: ideaId
 });
 }, [notes, ideaId]);

 const handleCreateAction = useCallback(async () => {
 // Canonical idea_id format: {run_id}::idea_{index}
 // This format must not change.
 if (!newActionText.trim() || !ideaId || !isValidIdeaId) {
 console.warn("[RecommendationDetail] Cannot create action: missing text or invalid ideaId", { 
 hasText: !!newActionText.trim(), 
 ideaId,
 isValidIdeaId
 });
 return;
 }
 
 console.log("[RecommendationDetail] Creating action for ideaId:", ideaId);
 
 try {
 const response = await fetch("/api/user/actions", {
 method: "POST",
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 body: JSON.stringify({
 idea_id: ideaId, // Canonical format: {run_id}::idea_{index}
 action_text: newActionText.trim(),
 status: "pending",
 }),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 console.log("[RecommendationDetail] Action created successfully:", data.action?.id);
 setActions((prev) => [data.action, ...prev]);
 setNewActionText("");
 } else {
 console.error("[RecommendationDetail] Failed to create action:", data.error);
 alert(data.error || "Failed to create action. Please try again.");
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 console.error("[RecommendationDetail] Failed to create action:", response.status, errorData);
 alert(errorData.error || "Failed to create action. Please try again.");
 }
 } catch (error) {
 console.error("[RecommendationDetail] Exception creating action:", error);
 alert("Network error. Please check your connection and try again.");
 }
 }, [newActionText, ideaId, isValidIdeaId, getAuthHeaders]);

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
 // Canonical idea_id format: {run_id}::idea_{index}
 // This format must not change.
 if (!newNoteContent.trim() || !ideaId || !isValidIdeaId) {
 console.warn("[RecommendationDetail] Cannot create note: missing content or invalid ideaId", { 
 hasContent: !!newNoteContent.trim(), 
 ideaId,
 isValidIdeaId
 });
 return;
 }
 
 console.log("[RecommendationDetail] Creating note for ideaId:", ideaId);
 
 try {
 const response = await fetch("/api/user/notes", {
 method: "POST",
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 body: JSON.stringify({
 idea_id: ideaId, // Canonical format: {run_id}::idea_{index}
 content: newNoteContent.trim(),
 tags: [],
 }),
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 console.log("[RecommendationDetail] Note created successfully:", data.note?.id);
 setNotes((prev) => [data.note, ...prev]);
 setNewNoteContent("");
 } else {
 console.error("[RecommendationDetail] Failed to create note:", data.error);
 alert(data.error || "Failed to create note. Please try again.");
 }
 } else {
 const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
 console.error("[RecommendationDetail] Failed to create note:", response.status, errorData);
 alert(errorData.error || "Failed to create note. Please try again.");
 }
 } catch (error) {
 console.error("[RecommendationDetail] Exception creating note:", error);
 alert("Network error. Please check your connection and try again.");
 }
 }, [newNoteContent, ideaId, isValidIdeaId, getAuthHeaders]);
 

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
const orderedSections = sections.orderedSections;


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

 const otherIdeas = useMemo(
 () => ideas.filter((idea) => activeIdea && idea.index !== activeIdea.index),
 [ideas, activeIdea]
 );


 // Redirect if we have stage2Markdown but the idea index doesn't match
 if (stage2Markdown && !activeIdea && ideas.length > 0) {
 return <Navigate to={backPath} replace state={backState} />;
 }

 // Loading state: Show spinner when enriching and no body yet
 // Check all possible body sources: enrichedBody, activeIdeaState.body, currentActiveIdea.body
 const hasBody = !!(enrichedBody?.length > 0 || activeIdeaState?.body?.length > 0 || currentActiveIdea?.body?.length > 0);
 
 // Show loading indicator when:
 // 1. Loading from API (and we don't have cached data)
 // 2. Enriching and no body yet (but we have an activeIdea)
 // 3. We have an activeIdea but no body and we're still loading/enriching
 // Don't show loading if we have cached data but no activeIdea - show error instead
 const isLoadingPage = (loading && !cachedIdea && !cachedRun) || (!hasBody && isEnriching && activeIdea) || (activeIdea && !hasBody && loading);
 
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
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm">
 <div className="mx-4 w-full max-w-md rounded-3xl border-2 border-default bg-surface p-8 shadow-2xl">
 <div className="text-center">
 <div className="mb-6 flex justify-center">
 <div className="relative">
 <div className="h-16 w-16 animate-spin rounded-full border-4 border-default border-t-brand-600"></div>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-2xl">🚀</span>
 </div>
 </div>
 </div>
 
 <h3 className="mb-2 text-xl font-bold text-primary">
 {isEnriching ? "Generating Detailed Playbook" : "Generating Recommendations"}
 </h3>
 <p className="mb-2 text-sm text-secondary">
 Step {currentDetailStep.step} of {currentDetailStep.total}
 </p>
 
 <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface">
 <div 
 className="h-full transition-all duration-1000"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 
 <p className="mb-1 text-base font-semibold text-accent">
 {currentDetailStep.text}...
 </p>
 <p className="text-xs text-secondary">
 {currentDetailStep.description}
 </p>
 
 <div className="mt-4 space-y-1">
 <p className="text-xs text-secondary">
 Time elapsed: {elapsedSeconds}s
 </p>
 <p className="text-xs font-medium text-accent">
 Generating recommendations...
 </p>
 </div>
 </div>
 </div>
 </div>
 );
 }

 return (
 <FocusLayout>
 <Seo
 title={
 activeIdea
 ? `${activeIdea.title} | Recommendation Detail`
 : "Recommendation Detail | Startup Idea Advisor"
 }
 description="Dive deeper into the selected startup recommendation, including financial outlook, risk radar, and validation plan."
 path={`/results/recommendations/${ideaIndex}`}
 />

 <DiscoveryNavigation
 backPath={backPath}
 backLabel="Back to recommendations"
 backState={backState}
 showDashboard={isAuthenticated}
 rightContent={
 <>
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
 className="ui-btn ui-btn-secondary focus-visible:outline-accent text-xs mr-2"
 title={`Download all collected logs as mylog.log (${getLogBufferSize()} entries)`}
 >
 📥 Download Logs ({getLogBufferSize()})
 </button>
 )}
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
 </>
 }
 className="mb-6"
 />


 {!loading && !stage2Markdown && (
 <DiscoveryEmptyState
 title="No report available"
 message="We couldn't find a saved recommendation report. Return to the home page to run a new session."
 primaryAction={{ to: "/advisor", label: "Generate New Report" }}
 />
 )}

 {!loading && !isEnriching && !activeIdea && !stage2Markdown && (
 <DiscoveryEmptyState
 title="Idea not found"
 message="Could not find the requested recommendation. The idea may have been removed or the link may be invalid."
 secondaryAction={{ onClick: () => navigate(backPath, { state: backState }), label: "Back to recommendations" }}
 />
 )}

 {/* Show idea information if we have an activeIdea, even if body is still loading */}
 {activeIdea && (
 <>
 <DiscoveryCard padding="lg">
 <div className="flex items-center justify-between mb-3 pb-3 border-b border-default">
 <DiscoveryBadge variant="muted" size="sm">
 Idea #{activeIdea.index}
 </DiscoveryBadge>
 {(actions.length > 0 || notes.length > 0) && (
 <div className={`flex items-center ${DISCOVERY_SPACING.elementGapSmall}`}>
 {actions.length > 0 && (
 <DiscoveryBadge
 variant="default"
 size="sm"
 icon={
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
 </svg>
 }
 title={`${actions.length} action item${actions.length !== 1 ? 's' : ''}`}
 >
 {actions.length} Task{actions.length !== 1 ? 's' : ''}
 </DiscoveryBadge>
 )}
 {notes.length > 0 && (
 <DiscoveryBadge
 variant="default"
 size="sm"
 icon={
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
 </svg>
 }
 title={`${notes.length} note${notes.length !== 1 ? 's' : ''}`}
 >
 {notes.length} Note{notes.length !== 1 ? 's' : ''}
 </DiscoveryBadge>
 )}
 </div>
 )}
 </div>
 <h1 className={`${DISCOVERY_TYPOGRAPHY.h1} mb-3`}>{activeIdea.title}</h1>
 <p className={`max-w-3xl ${DISCOVERY_TYPOGRAPHY.body}`}>{heroStatement}</p>
 
 {/* Idea Attributes */}
 <div className="mt-4">
 <IdeaAttributes idea={activeIdea} heroChips={heroChips} />
 </div>
 </DiscoveryCard>

 <div className={`flex flex-col ${DISCOVERY_SPACING.sectionGap} mt-8`}>
 {/* Show loading message if we have idea but no body content yet */}
 {activeIdea && !hasBody && isEnriching && (
 <DiscoveryLoadingState
 title="Loading detailed content..."
 message="Loading detailed content for this recommendation..."
 size="sm"
 />
 )}
 
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
 className="mb-2"
 >
          <RecommendationSections
            sectionKey={section.key}
            content={section.content}
            isEnriching={isEnriching}
            fitNarrativeMarkdown={fitNarrativeMarkdown}
            financialSnapshot={financialSnapshot}
            executionPhaseCards={executionPhaseCards}
            riskRows={riskRows}
            validationQuestions={validationQuestions}
            roadmapMarkdown={roadmapMarkdown}
            personaMarkdown={personaMarkdown}
            marketInsights={marketInsights}
            immediateExperimentsList={immediateExperimentsList}
            discoveryNextSteps={discoveryNextSteps}
            immediateNextSteps={immediateNextSteps}
            decisionChecklist={decisionChecklist}
          />
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
 {!isValidIdeaId ? (
 <div className="rounded-lg border border-default bg-surface bg-surface p-3">
 <p className="text-sm text-accent text-accent">Idea reference not ready</p>
 </div>
 ) : (
 <div className="flex gap-2">
 <input
 type="text"
 value={newActionText}
 onChange={(e) => setNewActionText(e.target.value)}
 onKeyPress={(e) => e.key === "Enter" && handleCreateAction()}
 placeholder="Add a new action item..."
 className="ui-input flex-1 focus-visible:outline-accent"
 />
 <button
 onClick={handleCreateAction}
 disabled={!newActionText.trim() || !isValidIdeaId}
 className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50"
 >
 Add
 </button>
 </div>
 )}

 {/* Actions list */}
 {loadingActions ? (
 <p className="text-sm text-secondary">Loading actions...</p>
 ) : actions.length === 0 ? (
 <div>
 <p className="text-sm text-secondary">No action items yet. Add one above to get started!</p>
 {process.env.NODE_ENV === 'development' && (
 <p className="text-xs text-secondary mt-1">
 Debug: actions.length = {actions.length}, loadingActions = {String(loadingActions)}
 </p>
 )}
 </div>
 ) : (
 <div className="space-y-2">
 {process.env.NODE_ENV === 'development' && (
 <p className="text-xs text-secondary mb-2">
 Debug: Rendering {actions.length} actions
 </p>
 )}
 {actions.map((action) => (
 <div
 key={action.id}
 className="flex items-center gap-3 rounded-xl border border-default bg-surface p-3"
 >
 <select
 value={action.status}
 onChange={(e) => handleUpdateAction(action.id, e.target.value)}
 className="rounded-lg border border-default bg-surface px-2 py-1 text-xs font-semibold text-primary focus:border-default focus:outline-none"
 >
 <option value="pending">Pending</option>
 <option value="in_progress">In Progress</option>
 <option value="completed">Completed</option>
 <option value="blocked">Blocked</option>
 </select>
 <span
 className={`flex-1 text-sm ${
 action.status === "completed" ? "line-through text-secondary" : "text-primary"
 }`}
 >
 {action.action_text}
 </span>
 {action.due_date && (() => {
 try {
 const dueDate = new Date(action.due_date);
 if (!isNaN(dueDate.getTime())) {
 return (
 <span className="text-xs text-secondary">
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
 {!isValidIdeaId ? (
 <div className="rounded-xl border border-default bg-surface bg-surface p-3">
 <p className="text-sm text-accent text-accent">Idea reference not ready</p>
 </div>
 ) : (
 <div className="space-y-2">
 <textarea
 value={newNoteContent}
 onChange={(e) => setNewNoteContent(e.target.value)}
 placeholder="Add a note... (e.g., customer interview insights, pivot ideas, market research)"
 rows={4}
 className="ui-textarea w-full focus-visible:outline-accent"
 />
 <button
 onClick={handleCreateNote}
 disabled={!newNoteContent.trim() || !isValidIdeaId}
 className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50"
 >
 Save Note
 </button>
 </div>
 )}

 {/* Notes list */}
 {loadingNotes ? (
 <p className="text-sm text-primary text-primary">Loading notes...</p>
 ) : notes.length === 0 ? (
 <div>
 <p className="text-sm text-primary text-primary">No notes yet. Add one above to start tracking your insights!</p>
 {process.env.NODE_ENV === 'development' && (
 <p className="text-xs text-secondary mt-1">
 Debug: notes.length = {notes.length}, loadingNotes = {String(loadingNotes)}
 </p>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 {process.env.NODE_ENV === 'development' && (
 <p className="text-xs text-secondary mb-2">
 Debug: Rendering {notes.length} notes
 </p>
 )}
 {notes.map((note) => (
 <div
 key={note.id}
 className="ui-card2 ui-pad-md rounded-xl shadow-card"
 >
 <div className="mb-2 flex items-center justify-between">
 <span className="text-xs text-primary text-primary">
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
 <span className="text-xs text-primary text-primary">(edited)</span>
 )}
 </div>
 <p className="whitespace-pre-wrap text-sm text-primary text-primary">{note.content}</p>
 {note.tags && note.tags.length > 0 && (
 <div className="mt-2 flex flex-wrap gap-1">
 {note.tags.map((tag, idx) => (
 <span
 key={idx}
 className="rounded-2xl bg-surface bg-surface border border-default px-[10px] py-1 text-primary font-medium text-primary text-primary"
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
 className="ui-btn ui-btn-primary focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {validating ? "Validating..." : "Validate Idea"}
 </button>
 <button
 onClick={() => navigate(backPath, { state: backState })}
 className="ui-btn ui-btn-secondary focus-visible:outline-accent"
 >
 Back to top ideas
 </button>
 </div>

 {/* Explore other ideas section removed based on feedback */}
 </>
 )}
 </FocusLayout>
 );
}


