import { useEffect, useMemo } from "react";
import { Navigate, useParams, useLocation, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
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
// Import utility functions
import { processRecommendationData } from "../../utils/recommendationDataProcessing.js";
// Import UI components
import RecommendationLoadingState from "../../components/recommendation/RecommendationLoadingState.jsx";
import RecommendationHeader from "../../components/recommendation/RecommendationHeader.jsx";
import ActionItemsSection from "../../components/recommendation/ActionItemsSection.jsx";
import NotesSection from "../../components/recommendation/NotesSection.jsx";
import RecommendationSectionsList from "../../components/recommendation/RecommendationSectionsList.jsx";
import RecommendationActionButtons from "../../components/recommendation/RecommendationActionButtons.jsx";
import RecommendationNavigation from "../../components/recommendation/RecommendationNavigation.jsx";


export default function RecommendationDetail() {
  const { ideaIndex } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { reports: contextReports, loadRunById, currentRunId, inputs: contextInputs, loading, getEnrichment, setEnrichment } = useReports();
  const { getAuthHeaders, isAuthenticated } = useAuth();
  const { validateRecommendationIdea, loading: validating } = useValidation();
  
  // Initialize file logger on mount
  useEffect(() => {
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

  // Use enrichment hook
  const { enrichedBody, isEnriching, setEnrichedBody } = useEnrichment(
    currentActiveIdea,
    industry,
    reports,
    ideaId,
    getEnrichment,
    setEnrichment,
    cachedIdea,
    cachedRun
  );

  // Update activeIdeaState with enriched body
  useEffect(() => {
    if (enrichedBody && activeIdeaState && !activeIdeaState.body) {
      setActiveIdeaState(prev => ({
        ...(prev || currentActiveIdea),
        body: enrichedBody
      }));
    }
  }, [enrichedBody, activeIdeaState, currentActiveIdea, setActiveIdeaState]);

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

  // Process recommendation data
  const processedData = useMemo(() => {
    const bodyToParse = enrichedBody || activeIdeaState?.body || currentActiveIdea?.body || "";
    if (!currentActiveIdea || !bodyToParse || bodyToParse.trim().length === 0) {
      return null;
    }
    return processRecommendationData(parsedSections, currentActiveIdea, inputs);
  }, [enrichedBody, activeIdeaState, currentActiveIdea, parsedSections, inputs]);

  // Extract processed data
  const {
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
  } = processedData || {};

  // Use lightweight next_steps from enrichment if available
  const discoveryNextSteps = currentActiveIdea?.enrichment?.next_steps;
  const finalImmediateNextSteps = discoveryNextSteps
    ? discoveryNextSteps
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().replace(/^-\s*/, ""))
    : immediateNextSteps || [];


 // Redirect if we have stage2Markdown but the idea index doesn't match
 if (stage2Markdown && !activeIdea && ideas.length > 0) {
 return <Navigate to={backPath} replace state={backState} />;
 }

  // Loading state: Show spinner when enriching and no body yet
  const hasBody = !!(enrichedBody?.length > 0 || activeIdeaState?.body?.length > 0 || currentActiveIdea?.body?.length > 0);
  const isLoadingPage = (loading && !cachedIdea && !cachedRun) || (!hasBody && isEnriching && activeIdea) || (activeIdea && !hasBody && loading);

  if (isLoadingPage) {
    return <RecommendationLoadingState isEnriching={isEnriching} />;
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

 <RecommendationNavigation
 backPath={backPath}
 backState={backState}
 isAuthenticated={isAuthenticated}
 activeIdea={activeIdea}
 runQuery={runQuery}
 inputs={inputs}
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
 <RecommendationHeader
 activeIdea={activeIdea}
 heroStatement={heroStatement}
 heroChips={heroChips}
 actions={actions}
 notes={notes}
 />

 <RecommendationSectionsList
 orderedSections={orderedSections}
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
 />

    {/* Action Items Section */}
    <ActionItemsSection
      actions={actions}
      loadingActions={loadingActions}
      newActionText={newActionText}
      setNewActionText={setNewActionText}
      handleCreateAction={handleCreateAction}
      handleUpdateAction={handleUpdateAction}
      isValidIdeaId={isValidIdeaId}
      isAuthenticated={isAuthenticated}
    />

    {/* Notes Section */}
    <NotesSection
      notes={notes}
      loadingNotes={loadingNotes}
      newNoteContent={newNoteContent}
      setNewNoteContent={setNewNoteContent}
      handleCreateNote={handleCreateNote}
      isValidIdeaId={isValidIdeaId}
      isAuthenticated={isAuthenticated}
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
 </>
 )}
 </FocusLayout>
 );
}


