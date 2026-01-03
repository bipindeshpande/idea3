import { useEffect, useMemo } from "react";
import { Navigate, useParams, useLocation, useNavigate } from "react-router-dom";
import Seo from "../../components/common/Seo.jsx";
import FocusLayout from "../../layouts/FocusLayout.jsx";
import DiscoveryNavigation from "../../components/discovery/DiscoveryNavigation.jsx";
import DiscoveryEmptyState from "../../components/discovery/DiscoveryEmptyState.jsx";
import DiscoveryLoadingState from "../../components/discovery/DiscoveryLoadingState.jsx";
import { DISCOVERY_SPACING } from "../../components/discovery/DiscoveryTheme.js";
import { useReports } from "../../context/ReportsContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useValidation } from "../../context/ValidationContext.jsx";
import OpenForCollaboratorsButton from "../../components/founder/OpenForCollaboratorsButton.jsx";
import CollapsibleSection from "../../components/ui/CollapsibleSection.jsx";
import { logToFile, downloadLogFile, getLogBufferSize } from "../../utils/fileLogger.js";
// Import extracted modules
import { getSectionToggleId, getSectionDescription } from "../../components/recommendations/utils/sectionConstants.js";
import { getSectionTheme } from "../../components/recommendations/utils/sectionThemes.js";
import { useSectionToggle } from "../../components/recommendations/hooks/useSectionToggle.js";
import RecommendationSections from "../../components/recommendations/RecommendationSections.jsx";
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
 <RecommendationHeader
 activeIdea={activeIdea}
 heroStatement={heroStatement}
 heroChips={heroChips}
 actions={actions}
 notes={notes}
 />

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
            immediateNextSteps={finalImmediateNextSteps}
            decisionChecklist={decisionChecklist}
          />
        </CollapsibleSection>
      );
    })}

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


