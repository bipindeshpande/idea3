import { useEffect, useMemo } from "react";
import { Navigate, useParams, useLocation, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import DiscoveryEmptyState from "../../components/discovery/DiscoveryEmptyState.jsx";
import DiscoveryLoadingState from "../../components/discovery/DiscoveryLoadingState.jsx";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import { logToFile } from "../../utils/fileLogger.js";
// Import extracted modules
import { useSectionToggle } from "../../components/recommendations/hooks/useSectionToggle.js";
// Import custom hooks
import { useRecommendationData } from "../../hooks/recommendation/useRecommendationData.js";
import { useEnrichment } from "../../hooks/recommendation/useEnrichment.js";
import { useActionsAndNotes } from "../../hooks/recommendation/useActionsAndNotes.js";
import { useRecommendationDetailState } from "../../hooks/recommendation/useRecommendationDetailState.js";
// Import UI components
import RecommendationLoadingState from "../../components/recommendation/RecommendationLoadingState.jsx";
import RecommendationHeader from "../../components/recommendation/RecommendationHeader.jsx";
import RecommendationSectionsList from "../../components/recommendation/RecommendationSectionsList.jsx";
import RecommendationTabbedSections from "../../components/recommendation/RecommendationTabbedSections.jsx";
import RecommendationActionButtons from "../../components/recommendation/RecommendationActionButtons.jsx";
import RecommendationNavigation from "../../components/recommendation/RecommendationNavigation.jsx";


export default function RecommendationDetail() {
  const { ideaIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { reports: contextReports, loadRunById, currentRunId, inputs: contextInputs, loading, getEnrichment, setEnrichment } = useReports();
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { validateRecommendationIdea, loading: validating } = useValidation();
  
  console.log("🔵 RECOMMENDATION DETAIL PAGE LOADED - ideaIndex:", ideaIndex);
  console.log("🔵 Location state:", location.state);
  
  // Initialize file logger on mount
  useEffect(() => {
    console.log("🔵 RecommendationDetail useEffect - component mounted");
    logToFile("RecommendationDetail component mounted", "INFO", "RecommendationDetail");
  }, []);

  // Use custom hooks for data management
  const {
    activeIdea,
    currentActiveIdea,
    activeIdeaState,
    setActiveIdeaState,
    ideas,
    ideaId,
    isValidIdeaId,
    industry,
    inputs,
    reports,
    parsedSections,
    orderedSections,
    stage2Markdown,
    cachedIdea,
    cachedRun,
    backPath,
    backState,
    runQuery
  } = useRecommendationData(contextReports, contextInputs, loading, loadRunById, currentRunId);

  console.log("🟡 useRecommendationData returned:", {
    hasActiveIdea: !!activeIdea,
    activeIdeaTitle: activeIdea?.title,
    hasCurrentActiveIdea: !!currentActiveIdea,
    ideaId,
    isValidIdeaId,
    industry,
    hasCachedIdea: !!cachedIdea,
    hasCachedRun: !!cachedRun,
    ideasCount: ideas?.length
  });

  // Use enrichment hook
  console.log("🟠 CALLING useEnrichment with:", {
    currentActiveIdea,
    industry,
    hasReports: !!reports,
    ideaId,
    cachedIdea,
    cachedRun,
    hasGetAuthHeaders: !!getAuthHeaders
  });
  const { enrichedBody, isEnriching, enrichmentError, setEnrichedBody } = useEnrichment(
    currentActiveIdea,
    industry,
    reports,
    ideaId,
    getEnrichment,
    setEnrichment,
    cachedIdea,
    cachedRun,
    getAuthHeaders
  );
  console.log("🟠 useEnrichment returned:", { hasEnrichedBody: !!enrichedBody, isEnriching, enrichmentError });

  // Update activeIdeaState with enriched body (only when enrichedBody changes and differs from current body)
  useEffect(() => {
    if (enrichedBody && enrichedBody.trim().length > 0) {
      setActiveIdeaState(prev => {
        // Only update if the enriched body is different from current body
        const currentBody = prev?.body || currentActiveIdea?.body || "";
        if (currentBody !== enrichedBody) {
          return {
            ...(prev || currentActiveIdea),
            body: enrichedBody
          };
        }
        return prev; // No change needed
      });
    }
  }, [enrichedBody, currentActiveIdea]);

  // Use actions and notes hook
  const {
    actions,
    notes,
    loadingActions,
    loadingNotes,
    newActionText,
    setNewActionText,
    newNoteContent,
    setNewNoteContent,
    handleCreateAction,
    handleUpdateAction,
    handleCreateNote
  } = useActionsAndNotes(ideaId, isValidIdeaId, isAuthenticated, getAuthHeaders);

  const { openSections, toggleSection } = useSectionToggle();

  // Use centralized hook for all detail page state and logic
  const detailState = useRecommendationDetailState({
    enrichedBody,
    isEnriching,
    enrichmentError,
    activeIdeaState,
    currentActiveIdea,
    parsedSections,
    activeIdea,
    cachedIdea,
    cachedRun,
    loading,
    inputs
  });
  
  // Destructure all state and data from the hook
  const {
    hasEnrichedBody,
    hasBasicBody,
    hasBody,
    needsEnrichment,
    isLoadingPage,
    shouldShowContent,
    enrichedParsedSections,
    enrichedOrderedSections,
    processedData,
    heroStatement,
    heroChips,
    executionPhaseCards,
    financialSnapshot,
    riskRows,
    validationQuestions,
    fitNarrativeMarkdown,
    personaMarkdown,
    marketInsights,
    immediateExperimentsList,
    immediateNextSteps,
    decisionChecklist,
    roadmapMarkdown,
    discoveryNextSteps,
    finalImmediateNextSteps
  } = detailState;

  // Redirect if we have stage2Markdown but the idea index doesn't match
  if (stage2Markdown && !activeIdea && ideas.length > 0) {
    return <Navigate to={backPath} replace state={backState} />;
  }

  if (isLoadingPage) {
    return <RecommendationLoadingState isEnriching={isEnriching || needsEnrichment} />;
  }
  
  // If enrichment failed, show a warning but still show the page with basic details
  if (enrichmentError && !hasEnrichedBody && activeIdea) {
    console.warn("Enrichment failed, showing page with basic details:", enrichmentError);
  }

 return (
 <>
 <Seo
 title={
 activeIdea
 ? `${activeIdea.title} | Recommendation Detail`
 : "Recommendation Detail | Startup Idea Advisor"
 }
 description="Dive deeper into the selected startup recommendation, including financial outlook, risk radar, and validation plan."
 path={`/dashboard/recommendations/${ideaIndex}`}
 />

 <RecommendationNavigation
 backPath={backPath}
 backState={backState}
 isAuthenticated={isAuthenticated}
 activeIdea={activeIdea}
 runQuery={runQuery}
 inputs={inputs}
 isEnriching={isEnriching}
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

 {/* Show idea information only if we have enriched body OR cached data (which already has enrichment) */}
 {shouldShowContent && (
 <div data-pdf-content="true">
 <RecommendationHeader
   activeIdea={activeIdea}
   heroStatement={heroStatement}
   heroChips={heroChips}
 />
 
 <RecommendationTabbedSections
   orderedSections={enrichedOrderedSections}
   openSections={openSections}
   toggleSection={toggleSection}
   fitNarrativeMarkdown={fitNarrativeMarkdown}
   discoveryNextSteps={discoveryNextSteps}
   financialSnapshot={financialSnapshot}
   executionPhaseCards={executionPhaseCards}
   riskRows={riskRows}
   validationQuestions={validationQuestions}
   roadmapMarkdown={roadmapMarkdown}
   personaMarkdown={personaMarkdown}
   marketInsights={marketInsights}
   immediateExperimentsList={immediateExperimentsList}
   immediateNextSteps={finalImmediateNextSteps}
   decisionChecklist={decisionChecklist}
   isEnriching={isEnriching}
   hasBody={hasBody}
   activeIdea={activeIdea}
   heroChips={heroChips}
   onValidate={async () => {
     const result = await validateRecommendationIdea(
       activeIdea,
       inputs,
       reports?.profile_analysis
     );
     if (result.success && result.validation?.id) {
       navigate(`/validate-result?id=${result.validation.id}`);
     }
   }}
   onSave={() => {
     // TODO: Implement save functionality
     console.log("Save idea:", activeIdea);
   }}
   validating={validating}
   isAuthenticated={isAuthenticated}
   actions={actions}
   notes={notes}
   loadingActions={loadingActions}
   loadingNotes={loadingNotes}
   newActionText={newActionText}
   setNewActionText={setNewActionText}
   newNoteContent={newNoteContent}
   setNewNoteContent={setNewNoteContent}
   handleCreateAction={handleCreateAction}
   handleUpdateAction={handleUpdateAction}
   handleCreateNote={handleCreateNote}
   isValidIdeaId={isValidIdeaId}
 />

<RecommendationActionButtons
 activeIdea={activeIdea}
 inputs={inputs}
 reports={reports}
 validateRecommendationIdea={validateRecommendationIdea}
 validating={validating}
 backPath={backPath}
 backState={backState}
 />

 {/* Explore other ideas section removed based on feedback */}
 </div>
 )}
 </>
 );
}


