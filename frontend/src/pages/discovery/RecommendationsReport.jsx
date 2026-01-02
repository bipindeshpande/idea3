import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// Lazy load PDF dependencies - only load when needed
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import Seo from "../../components/common/Seo.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
import DiscoveryCard from "../../components/discovery/DiscoveryCard.jsx";
import DiscoveryHeader from "../../components/discovery/DiscoveryHeader.jsx";
import DiscoveryBadge from "../../components/discovery/DiscoveryBadge.jsx";
import DiscoveryEmptyState from "../../components/discovery/DiscoveryEmptyState.jsx";
import DiscoveryLoadingState from "../../components/discovery/DiscoveryLoadingState.jsx";
import DiscoveryErrorState from "../../components/discovery/DiscoveryErrorState.jsx";
import DiscoveryTabs from "../../components/discovery/DiscoveryTabs.jsx";
import IdeaTableRow from "../../components/discovery/IdeaTableRow.jsx";
import { DISCOVERY_SPACING, DISCOVERY_TYPOGRAPHY } from "../../components/discovery/DiscoveryTheme.js";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { trimFromHeading, parseStructuredIdeas } from "../../utils/streamingParser.js";
import { personalizeCopy, buildFinalConclusion, parseRecommendationMatrix, splitFullReportSections } from "../../utils/formatters/recommendationFormatters.js";
import ReactMarkdown from "react-markdown";
import UIBadge from "../../components/ui/ui-badge.jsx";

function useQuery() {
 return new URLSearchParams(useLocation().search);
}

export default function RecommendationsReport() {
 const { reports, loadRunById, currentRunId, inputs, loadFromRecentDiscoveryCache } = useReports();
 const { subscription, getAuthHeaders, isAuthenticated } = useAuth();
 const navigate = useNavigate();
 const location = useLocation();
 const query = useQuery();
 const runId = query.get("id");
 const reportRef = useRef(null);
 const [error, setError] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [activeTab, setActiveTab] = useState("ideas");
 
 // Check for cached run data from navigation state (from Past Sessions)
 const cachedRun = location.state?.run;
 const cachedRecommendations = location.state?.recommendations || cachedRun?.reports || cachedRun?.outputs;
 const cachedIdeas = location.state?.allIdeas || cachedRun?.reports?.recommendations_structured || cachedRun?.outputs?.recommendations_structured;
 const [smartRecommendations, setSmartRecommendations] = useState(null);
 const [ideasWithActions, setIdeasWithActions] = useState(new Set());
 const [ideasWithNotes, setIdeasWithNotes] = useState(new Set());
 const [enhancements, setEnhancements] = useState(null);
 const [enhancementsLoading, setEnhancementsLoading] = useState(false);
 const [enhancementsStarted, setEnhancementsStarted] = useState(false);
 const abortControllerRef = useRef(null);
 const hasLoadedFromCacheRef = useRef(false); // Track if we've loaded from cache to prevent re-triggers
 const isPro = subscription && (subscription.subscription_type === "pro" || subscription.subscription_type === "weekly");

 // Use cached reports from state if available, otherwise use context reports
 // Must be declared BEFORE useEffect that uses it
 // Also check localStorage recentDiscovery if context reports are missing
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
 
 // Extract reports from cached run
 const runReports = cachedRun.reports || cachedRun.outputs || {};
 
 // Set reports in context if needed (but don't trigger API calls)
 if (runReports && runReports.personalized_recommendations) {
 // Update context silently without triggering API
 if (cachedRun.run_id || cachedRun.id) {
 // Don't call loadRunById - we already have the data
 }
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

 useEffect(() => {
 if (isAuthenticated) {
 const loadSmartRecs = async () => {
 try {
 const response = await fetch("/api/user/smart-recommendations", {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setSmartRecommendations(data.insights);
 }
 } else if (response.status === 401) {
 // Auth failed - don't log error, just skip loading
 console.warn("Authentication failed for smart recommendations");
 }
 } catch (error) {
 // Only log non-network errors
 if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
 console.error("Failed to load smart recommendations:", error);
 }
 }
 };
 
 const loadActionsAndNotes = async () => {
 try {
 // Load all actions
 const actionsResponse = await fetch("/api/user/actions", {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 if (actionsResponse.ok) {
 const actionsData = await actionsResponse.json();
 if (actionsData.success) {
 const ideaIdsWithActions = new Set();
 actionsData.actions?.forEach(action => {
 if (action.idea_id) {
 ideaIdsWithActions.add(action.idea_id);
 }
 });
 setIdeasWithActions(ideaIdsWithActions);
 }
 } else if (actionsResponse.status === 401) {
 // Auth failed - don't log error, just skip loading
 console.warn("Authentication failed for actions");
 }
 
 // Load all notes
 const notesResponse = await fetch("/api/user/notes", {
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 });
 if (notesResponse.ok) {
 const notesData = await notesResponse.json();
 if (notesData.success) {
 const ideaIdsWithNotes = new Set();
 notesData.notes?.forEach(note => {
 if (note.idea_id) {
 ideaIdsWithNotes.add(note.idea_id);
 }
 });
 setIdeasWithNotes(ideaIdsWithNotes);
 }
 } else if (notesResponse.status === 401) {
 // Auth failed - don't log error, just skip loading
 console.warn("Authentication failed for notes");
 }
 } catch (error) {
 // Only log non-network errors
 if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
 console.error("Failed to load actions/notes:", error);
 }
 }
 };
 
 loadSmartRecs();
 loadActionsAndNotes();
 }
 }, [isAuthenticated, getAuthHeaders]);

 // Smart detection for enhancements: Start if user scrolls or stays >30s
 // DISABLED when viewing cached run (from Past Sessions) - no recomputation
 useEffect(() => {
 // CRITICAL: Disable enhancements if viewing cached run
 if (cachedRun) {
 if (process.env.NODE_ENV === 'development') {
 console.log("[RecommendationsReport] Enhancements disabled - viewing cached run");
 }
 return;
 }
 
 if (!isAuthenticated || !runId || enhancementsStarted || !effectiveReports?.personalized_recommendations) {
 return;
 }

 let scrollTimer;
 let stayTimer;
 let hasScrolled = false;

 const handleScroll = () => {
 if (!hasScrolled && window.scrollY > 500) {
 hasScrolled = true;
 clearTimeout(scrollTimer);
 startEnhancements();
 }
 };

 const handleStay = () => {
 if (!enhancementsStarted) {
 startEnhancements();
 }
 };

 // Start enhancements if user stays >30 seconds
 stayTimer = setTimeout(handleStay, 30000);

 // Start enhancements if user scrolls past 500px
 window.addEventListener('scroll', handleScroll, { passive: true });

 return () => {
 clearTimeout(stayTimer);
 clearTimeout(scrollTimer);
 window.removeEventListener('scroll', handleScroll);
 // Cancel enhancements if user leaves
 if (abortControllerRef.current) {
 abortControllerRef.current.abort();
 }
 };
 }, [isAuthenticated, runId, enhancementsStarted, reports]);

 const startEnhancements = async () => {
 if (enhancementsStarted || !runId) return;
 
 setEnhancementsStarted(true);
 setEnhancementsLoading(true);
 
 // Create abort controller for cancellation
 const controller = new AbortController();
 abortControllerRef.current = controller;

 try {
 const response = await fetch("/api/enhance-report", {
 method: "POST",
 headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
 body: JSON.stringify({ run_id: runId }),
 signal: controller.signal,
 });

 if (response.ok) {
 const data = await response.json();
 if (data.success) {
 setEnhancements(data.enhancements);
 }
 } else if (response.status === 401) {
 // Auth failed - don't log error, just skip loading
 console.warn("Authentication failed for enhancements");
 }
 } catch (error) {
 if (error.name !== 'AbortError') {
 // Only log non-network errors
 if (error.name !== 'TypeError' || !error.message.includes('fetch')) {
 console.error("Failed to load enhancements:", error);
 }
 }
 } finally {
 setEnhancementsLoading(false);
 }
 };
 
 const markdown = useMemo(() => {
 try {
 let raw = effectiveReports?.personalized_recommendations ?? "";
 
 // Fix concatenated text (add spaces between words)
 // Pattern: lowercase letter followed by uppercase = word boundary
 raw = raw.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
 // Pattern: number followed by letter
 raw = raw.replace(/(\d)([A-Za-z])/g, '$1 $2');
 raw = raw.replace(/([A-Za-z])(\d)/g, '$1 $2');
 // Pattern: special characters
 raw = raw.replace(/([a-zA-Z0-9])([:;])([a-zA-Z])/g, '$1$2 $3');
 // Pattern: acronyms
 raw = raw.replace(/([A-Z]{2,})([a-z])/g, '$1 $2');
 
 return trimFromHeading(raw, "### Comprehensive Recommendation Report");
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error trimming markdown:", err);
 }
 return effectiveReports?.personalized_recommendations ?? "";
 }
 }, [effectiveReports]);

 // Extract conflict adjustment message if present
 const conflictAdjustment = useMemo(() => {
 try {
 if (effectiveReports && typeof effectiveReports === 'object') {
 // Check direct property
 if (effectiveReports.conflict_adjustment) {
 return effectiveReports.conflict_adjustment;
 }
 // Check nested in reports
 if (effectiveReports.reports && effectiveReports.reports.conflict_adjustment) {
 return effectiveReports.reports.conflict_adjustment;
 }
 }
 return null;
 } catch (err) {
 return null;
 }
 }, [effectiveReports]);

 // Check if structured recommendations are available from backend
 const structuredRecommendations = useMemo(() => {
 try {
 // Check if reports contain structured recommendations
 if (effectiveReports && typeof effectiveReports === 'object') {
 // Check if reports.recommendations_structured exists (from backend)
 if (effectiveReports.recommendations_structured && Array.isArray(effectiveReports.recommendations_structured)) {
 return effectiveReports.recommendations_structured;
 }
 // Also check if reports is the run object with reports field
 if (effectiveReports.reports && effectiveReports.reports.recommendations_structured) {
 return effectiveReports.reports.recommendations_structured;
 }
 }
 return null;
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error checking structured recommendations:", err);
 }
 return null;
 }
 }, [effectiveReports]);

 const allIdeas = useMemo(() => {
 try {
 // Priority 1: Use cached ideas from navigation state
 if (cachedIdeas && Array.isArray(cachedIdeas) && cachedIdeas.length > 0) {
 return cachedIdeas;
 }
 
 // Priority 2: If structured recommendations available, use them directly
 if (structuredRecommendations && Array.isArray(structuredRecommendations) && structuredRecommendations.length > 0) {
 return structuredRecommendations.map((rec) => ({
 index: rec.index || 0,
 title: rec.title || `Idea ${rec.index || 0}`,
 summary: rec.summary || "",
 target_market: rec.target_market || "",
 revenue_model: rec.revenue_model || "",
 validation_score: rec.validation_score || "",
 timeline: rec.timeline || "",
 why_this_fits: rec.why_this_fits || "",
 enrichment: rec.enrichment || {} // Preserve enrichment.next_steps
 }));
 }
 
 // Priority 3: Try parsing structured format from markdown text
 const raw = effectiveReports?.personalized_recommendations || "";
 const structuredParsed = parseStructuredIdeas(raw);
 if (structuredParsed && structuredParsed.length > 0) {
 return structuredParsed;
 }
 
 // Fallback: parse from markdown (for backward compatibility)
 const parsed = parseStructuredIdeas(markdown, 10);
 return parsed;
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error parsing ideas:", err);
 }
 return [];
 }
 }, [markdown, structuredRecommendations, effectiveReports, cachedIdeas]);
 const topIdeas = allIdeas.slice(0, 3);
 const secondaryIdeas = allIdeas.slice(3);
 
 // Collect next_steps from ALL ideas that contain enrichment.next_steps
 const allNextSteps = allIdeas
 .filter(idea => idea?.enrichment?.next_steps)
 .map((idea, index) => ({
 title: idea.title || `Idea ${index + 1}`,
 steps: idea.enrichment.next_steps
 }));

 // Unified action plan text
 let unifiedNextSteps = null;
 if (allNextSteps.length > 0) {
 unifiedNextSteps =
 allNextSteps
 .map((idea, index) => {
 return `## Next Steps for ${idea.title}\n\n${idea.steps}\n`;
 })
 .join("\n\n");
 }

 // Extract matrix data for conclusion
 const sections = useMemo(() => {
 try {
 return splitFullReportSections(markdown);
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error splitting sections:", err);
 }
 return {};
 }
 }, [markdown]);
 
 const matrixRows = useMemo(() => {
 try {
 return parseRecommendationMatrix(sections["recommendation matrix"] || "");
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error parsing matrix:", err);
 }
 return [];
 }
 }, [sections]);
 
 // Extract structured Final Recommendation from backend
 const finalRecommendation = useMemo(() => {
 try {
 // Priority 1: Use structured final_recommendation from backend if available (direct)
 if (effectiveReports?.final_recommendation && typeof effectiveReports.final_recommendation === 'object') {
 return effectiveReports.final_recommendation;
 }
 // Priority 2: Check in reports.final_recommendation (nested)
 if (effectiveReports?.reports?.final_recommendation && typeof effectiveReports.reports.final_recommendation === 'object') {
 return effectiveReports.reports.final_recommendation;
 }
 // Priority 3: Check if reports is the run object with reports field
 if (effectiveReports?.reports && typeof effectiveReports.reports === 'object' && effectiveReports.reports.final_recommendation && typeof effectiveReports.reports.final_recommendation === 'object') {
 return effectiveReports.reports.final_recommendation;
 }
 // Legacy fallback: Return null (will use buildFinalConclusion for markdown)
 return null;
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error extracting final recommendation:", err);
 }
 return null;
 }
 }, [effectiveReports]);

 // Legacy finalConclusion for backward compatibility (markdown string)
 const finalConclusion = useMemo(() => {
 // If we have structured finalRecommendation, don't use legacy
 if (finalRecommendation && typeof finalRecommendation === 'object' && finalRecommendation.decision) {
 return null;
 }
 // Generate legacy conclusion from buildFinalConclusion if no structured version
 try {
 return buildFinalConclusion(topIdeas, matrixRows, effectiveInputs || {});
 } catch (err) {
 if (process.env.NODE_ENV === 'development') {
 console.error("Error building conclusion:", err);
 }
 return null;
 }
 }, [finalRecommendation, topIdeas, matrixRows, effectiveInputs]);

 // Show error state
 if (error) {
 return (
 <FocusLayout>
 <Seo
 title="Error | Startup Idea Advisor"
 description="Error loading recommendation report"
 path="/results/recommendations"
 />
 <DiscoveryErrorState
 error={error}
 primaryAction={{ to: "/advisor", label: "Generate New Report" }}
 />
 </FocusLayout>
 );
 }

 // Show loading state
 if (isLoading) {
 return (
 <FocusLayout>
 <Seo
 title="Loading Recommendations | Startup Idea Advisor"
 description="Loading recommendation report"
 path="/results/recommendations"
 />
 <DiscoveryLoadingState
 title="Loading Report..."
 message="Please wait while we load your recommendations."
 />
 </FocusLayout>
 );
 }

 // Show message if no reports yet
 if (!effectiveReports || !effectiveReports.personalized_recommendations || !effectiveReports.personalized_recommendations.trim()) {
 // Debug info in development
 if (process.env.NODE_ENV === 'development') {
 console.log("RecommendationsReport - Debug Info:", {
 hasEffectiveReports: !!effectiveReports,
 hasReports: !!reports,
 hasCachedRecommendations: !!cachedRecommendations,
 hasLocalStorageReports: !!localStorageReports,
 hasRecommendations: !!effectiveReports?.personalized_recommendations,
 recommendationsLength: effectiveReports?.personalized_recommendations?.length || 0,
 recommendationsPreview: effectiveReports?.personalized_recommendations?.substring(0, 200),
 allKeys: effectiveReports ? Object.keys(effectiveReports) : [],
 runId,
 currentRunId,
 });
 }
 
 const debugInfo = process.env.NODE_ENV === 'development' && effectiveReports ? {
 hasEffectiveReports: !!effectiveReports,
 hasReports: !!reports,
 hasCachedRecommendations: !!cachedRecommendations,
 hasLocalStorageReports: !!localStorageReports,
 hasRecommendations: !!effectiveReports?.personalized_recommendations,
 recommendationsLength: effectiveReports?.personalized_recommendations?.length || 0,
 recommendationsPreview: effectiveReports?.personalized_recommendations?.substring(0, 500),
 allKeys: Object.keys(effectiveReports || {}),
 } : null;

 return (
 <FocusLayout>
 <Seo
 title="No Recommendations | Startup Idea Advisor"
 description="No recommendation report available"
 path="/results/recommendations"
 />
 <DiscoveryEmptyState
 title="No Report Available"
 message={runId ? "Report not found. It may have been deleted or the ID is invalid." : "No report data available. Please generate recommendations first."}
 primaryAction={{ to: "/advisor", label: "Generate Recommendations" }}
 debugInfo={debugInfo}
 />
 </FocusLayout>
 );
 }

 return (
 <FocusLayout>
 <Seo
 title="Personalized Startup Recommendations | Startup Idea Advisor"
 description="Review AI-generated startup ideas, financial outlook, and execution roadmap tailored to your profile."
 path="/results/recommendations"
 />
 <DiscoveryHeader
 title="Recommendation Report"
 description="Review AI-generated startup ideas tailored to your profile"
 />

 <div ref={reportRef} className={DISCOVERY_SPACING.sectionGap.replace('gap-', 'space-y-')}>
 {/* Conflict Adjustment Message */}
 {conflictAdjustment && conflictAdjustment.message && (
 <DiscoveryCard variant="info">
 <div className={`flex items-start ${DISCOVERY_SPACING.elementGap}`}>
 <div className="text-xl shrink-0">💡</div>
 <div className="flex-1">
 <p className={`${DISCOVERY_TYPOGRAPHY.body} text-accent`}>
 {conflictAdjustment.message}
 </p>
 {conflictAdjustment.optional_clarification && (
 <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.bodySmall} text-accent italic`}>
 {conflictAdjustment.optional_clarification}
 </p>
 )}
 </div>
 </div>
 </DiscoveryCard>
 )}

 {topIdeas.length === 0 && markdown && markdown.length > 0 && (
 <DiscoveryCard variant="elevated">
 <h2 className={DISCOVERY_TYPOGRAPHY.h3}>Unable to Parse Recommendations</h2>
 <p className={`mt-2 ${DISCOVERY_TYPOGRAPHY.bodySmall} mb-4`}>
 The recommendations couldn't be parsed into individual ideas. This might happen if the format is unexpected or the report is very brief.
 </p>
 <div className={DISCOVERY_SPACING.elementGap.replace('gap-', 'space-y-')}>
 <Link
 to="/advisor"
 className="ui-btn ui-btn-primary focus-visible:outline-accent"
 >
 Generate New Recommendations
 </Link>
 <div className="mt-4">
 <p className="text-xs font-semibold mb-2">Raw Recommendations Content:</p>
 <div className="prose prose-slate max-w-none bg-surface p-4 rounded-lg border border-default text-xs max-h-96 overflow-y-auto">
 <ReactMarkdown
 components={{
 p: ({ node, ...props }) => (
 <p className="text-primary leading-relaxed mb-2" {...props} />
 ),
 ul: ({ node, ...props }) => (
 <ul className="list-disc list-outside space-y-1 text-primary mb-2 ml-4" {...props} />
 ),
 ol: ({ node, ...props }) => (
 <ol className="list-decimal list-outside space-y-1 text-primary mb-2 ml-4" {...props} />
 ),
 li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
 strong: ({ node, ...props }) => (
 <strong className="font-semibold text-primary" {...props} />
 ),
 h1: ({ node, ...props }) => (
 <h1 className="text-xl font-bold text-primary mb-2 mt-3" {...props} />
 ),
 h2: ({ node, ...props }) => (
 <h2 className="text-lg font-bold text-primary mb-2 mt-3" {...props} />
 ),
 h3: ({ node, ...props }) => (
 <h3 className="text-base font-semibold text-primary mb-1 mt-2" {...props} />
 ),
 h4: ({ node, ...props }) => (
 <h4 className="text-sm font-semibold text-primary mb-1 mt-2" {...props} />
 ),
 }}
 >
 {markdown}
 </ReactMarkdown>
 </div>
 </div>
 </div>
 </DiscoveryCard>
 )}

 {topIdeas.length === 0 && (!markdown || markdown.length === 0) && (
 <DiscoveryCard>
 <div className="text-center">
 <h3 className={`${DISCOVERY_TYPOGRAPHY.h3} mb-1`}>No Recommendations Available</h3>
 <p className={`${DISCOVERY_TYPOGRAPHY.bodySmall} max-w-md mx-auto`}>
 The recommendation report is empty or could not be loaded.
 </p>
 <div className={`mt-4 flex ${DISCOVERY_SPACING.elementGap} justify-center`}>
 <Link
 to="/advisor"
 className="ui-btn ui-btn-primary focus-visible:outline-accent"
 >
 Generate Recommendations
 </Link>
 </div>
 </div>
 </DiscoveryCard>
 )}

 {topIdeas.length > 0 && (
 <>
 {/* Tabbed Interface */}
 <DiscoveryTabs
 tabs={[
 { id: "ideas", label: "Top Startup Ideas" },
 { id: "nextsteps", label: "Next Steps" },
 ...(finalRecommendation || finalConclusion ? [{ id: "conclusion", label: "Final Recommendation" }] : [])
 ]}
 activeTab={activeTab}
 onTabChange={setActiveTab}
 />

 {/* Tab Content: Top Startup Ideas */}
 {activeTab === "ideas" && (
 <div className="rounded-3xl border border-default bg-surface p-6 shadow-soft">
 <h2 className="text-xl font-semibold text-primary">
 Top Startup Ideas
 </h2>
 <p className="mt-1 text-sm text-secondary">
 Review your three tailored ideas. Click any row to open the full playbook with financial outlook, risk radar, validation questions, and more.
 </p>
 <div className="mt-4 overflow-hidden rounded-2xl border border-default shadow-sm">
 <table className="min-w-full divide-y divide-slate-200 text-sm">
 <thead className="bg-surface text-left uppercase tracking-wide text-secondary">
 <tr>
 <th className="px-4 py-3">#</th>
 <th className="px-4 py-3">Idea</th>
 <th className="px-4 py-3">Summary</th>
 <th className="px-4 py-3 text-right">Details</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200">
 {topIdeas.map((idea) => {
 const runQuery = runId || currentRunId;
 const ideaId = runQuery ? `run_${runQuery}_idea_${idea.index}` : `idea_${idea.index}`;
 const hasActions = ideasWithActions.has(ideaId);
 const hasNotes = ideasWithNotes.has(ideaId);
 
 return (
 <IdeaTableRow
 key={idea.index}
 idea={idea}
 runId={runId}
 currentRunId={currentRunId}
 allIdeas={allIdeas}
 effectiveReports={effectiveReports}
 cachedRun={cachedRun}
 effectiveInputs={effectiveInputs}
 hasActions={hasActions}
 hasNotes={hasNotes}
 />
 );
 })}
 {topIdeas.length < 3 && (
 <tr className="bg-app text-secondary">
 <td colSpan={4} className="px-4 py-3 text-center italic">
 Fewer than three ideas generated—rerun with expanded preferences for more options.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Tab Content: Next Steps */}
 {activeTab === "nextsteps" && (
 <div className="mb-4 rounded-3xl border-2 border-default to-white p-6 shadow-soft">
 <div className="mb-4 flex items-center gap-3">
 <h2 className="text-2xl font-bold text-primary">🚀 Your Next Steps</h2>
 <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-accent">Start Here</span>
 </div>
 <p className="mb-6 text-secondary">
 Follow these personalized, actionable steps to move your startup idea forward. Each step is tailored to your profile, constraints, and top recommendation.
 </p>
 
 {unifiedNextSteps ? (
 <div className="prose prose-slate max-w-none">
 <ReactMarkdown
 components={{
 ul: ({ node, ...props }) => (
 <ul className="list-disc list-outside space-y-3 text-primary mb-4 ml-6" {...props} />
 ),
 li: ({ node, ...props }) => (
 <li className="leading-relaxed text-base text-primary" {...props} />
 ),
 p: ({ node, ...props }) => (
 <p className="text-primary leading-relaxed mb-3" {...props} />
 ),
 h2: ({ node, ...props }) => (
 <h2 className="text-xl font-bold text-primary mt-6 mb-3" {...props} />
 ),
 }}
 >
 {unifiedNextSteps}
 </ReactMarkdown>
 </div>
 ) : (
 <p className="text-sm text-secondary">
 No next steps were found for your recommendations. 
 This usually happens when the AI did not generate enrichment data for this run.
 </p>
 )}
 
 {topIdeas.length > 0 && (
 <div className="mt-6 pt-6 border-t border-default">
 <p className="mb-3 text-sm text-secondary">
 Want deeper validation and a comprehensive roadmap? Validate your top idea for detailed analysis across 10 key parameters.
 </p>
 <button
 onClick={() => {
 navigate(`/results/recommendations/${topIdeas[0].index}${runId || currentRunId ? `?id=${runId || currentRunId}` : ''}`, {
 state: {
 idea: topIdeas[0],
 allIdeas: allIdeas,
 recommendations: effectiveReports,
 run: cachedRun, // Pass full run object to prevent recomputation
 runId: runId || currentRunId,
 inputs: effectiveInputs
 }
 });
 }}
 className="inline-flex items-center gap-2 rounded-lg bg-accent hover:bg-accent-hover px-4 py-2 text-sm font-semibold text-on-accent transition-colors"
 >
 Validate "{topIdeas[0].title || 'Your Top Idea'}"
 </button>
 </div>
 )}
 </div>
 )}

 {/* Tab Content: Final Conclusion */}
 {activeTab === "conclusion" && (
 <div className="rounded-3xl border-2 border-default bg-surface p-8 shadow-soft">
 {finalRecommendation && typeof finalRecommendation === 'object' && finalRecommendation.decision ? (
 // Premium structured Final Recommendation
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <h2 className="text-2xl font-bold text-primary text-secondary">Final Recommendation</h2>
 {/* Decision Badge */}
 {(() => {
 const decision = finalRecommendation.decision || 'validate_further';
const badgeConfig = {
pursue: { label: 'Pursue', variant: 'success' },
pursue_with_caution: { label: 'Pursue with Caution', variant: 'warning' },
validate_further: { label: 'Validate Further', variant: 'info' },
consider_pivot: { label: 'Consider Pivot', variant: 'info' },
do_not_pursue: { label: 'Do Not Pursue', variant: 'danger' }
};
const config = badgeConfig[decision] || badgeConfig.validate_further;
return (
<UIBadge variant={config.variant} className="px-4 py-2 text-sm font-semibold">
{config.label}
</UIBadge>
);
 })()}
 </div>
 
 {/* Rationale */}
 {finalRecommendation.rationale && Array.isArray(finalRecommendation.rationale) && finalRecommendation.rationale.length > 0 && (
 <div className="space-y-3">
 <h3 className="text-lg font-semibold text-primary text-secondary">Strategic Rationale</h3>
 <ul className="space-y-3">
 {finalRecommendation.rationale.map((item, index) => (
 <li key={index} className="flex items-start gap-3">
 <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
 {index + 1}
 </span>
 <p className="text-primary text-secondary leading-relaxed flex-1">
 {item}
 </p>
 </li>
 ))}
 </ul>
 </div>
 )}
 
 {/* Recommended Path */}
 {finalRecommendation.recommended_path && (
 <div className="rounded-xl border-2 border-default border-default bg-surface bg-surface p-6">
 <h3 className="text-lg font-semibold text-primary text-secondary mb-2">Recommended Path</h3>
 <p className="text-primary text-secondary leading-relaxed text-lg">
 {finalRecommendation.recommended_path}
 </p>
 </div>
 )}
 </div>
 ) : finalConclusion ? (
 // Legacy markdown format
 <div className="prose prose-slate max-w-none">
 <ReactMarkdown
 components={{
 h2: ({ node, ...props }) => (
 <h2 className="text-2xl font-bold text-primary text-secondary mb-4" {...props} />
 ),
 h3: ({ node, ...props }) => (
 <h3 className="text-xl font-semibold text-primary text-secondary mb-3 mt-4" {...props} />
 ),
 p: ({ node, ...props }) => (
 <p className="text-primary text-secondary leading-relaxed mb-3" {...props} />
 ),
 ul: ({ node, ...props }) => (
 <ul className="list-disc list-outside space-y-2 text-primary text-secondary mb-4 ml-6" {...props} />
 ),
 li: ({ node, ...props }) => (
 <li className="leading-relaxed" {...props} />
 ),
 strong: ({ node, ...props }) => (
 <strong className="font-semibold text-primary text-secondary" {...props} />
 ),
 }}
 >
 {finalConclusion}
 </ReactMarkdown>
 </div>
 ) : (
 <p className="text-secondary text-secondary italic">
 Final recommendation is being generated. Please check back shortly.
 </p>
 )}
 </div>
 )}

 {/* Similar Ideas Section */}
 {smartRecommendations && smartRecommendations.similar_ideas && smartRecommendations.similar_ideas.length > 0 && (
 <div className="mt-6 rounded-3xl border border-default bg-surface p-6 shadow-soft">
 <h2 className="mb-4 text-xl font-bold text-primary text-secondary">
 💡 Similar High-Scoring Ideas from Your History
 </h2>
 <p className="mb-4 text-sm text-secondary text-secondary">
 Based on your validation history, here are similar ideas you've validated highly in the past:
 </p>
 <div className="space-y-3">
 {smartRecommendations.similar_ideas.slice(0, 3).map((idea, idx) => (
 <div
 key={idx}
 className="rounded-lg border border-default border-default bg-surface p-4"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-sm font-semibold text-accent text-accent">
 Score: {idea.score.toFixed(1)}/10
 </span>
 <Link
 to={`/validate-result?id=${idea.validation_id}`}
 className="text-xs font-semibold text-accent text-accent hover:underline"
 >
 View Validation →
 </Link>
 </div>
 {idea.idea_explanation && (
 <p className="text-sm text-primary text-secondary">{idea.idea_explanation}</p>
 )}
 </div>
 ))}
 </div>
 </div>
 )}
 </>
 )}
 </div>
 </FocusLayout>
 );
}
