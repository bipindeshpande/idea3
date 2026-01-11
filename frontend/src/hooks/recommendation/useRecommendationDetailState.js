import { useMemo } from "react";
import { splitIdeaSections } from "../../utils/formatters/recommendationFormatters.js";
import { DEFAULT_SECTIONS, SECTION_ORDER, SECTION_LABELS } from "../../components/recommendations/utils/sectionConstants.js";
import { processRecommendationData } from "../../utils/recommendationDataProcessing.js";

/**
 * Custom hook for managing recommendation detail page state and logic
 * 
 * Handles:
 * - Enrichment state detection (enriched vs basic body)
 * - Section parsing from enriched body
 * - Loading state determination
 * - Processed data extraction
 * 
 * This allows RecommendationDetail component to be smaller and easier to debug.
 * When something breaks, you can fix just this hook instead of the whole component.
 */
export function useRecommendationDetailState({
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
}) {
  
  // Check if we have enriched body (with section headers) vs just basic details
  const hasEnrichedBody = useMemo(() => {
    return !!(enrichedBody?.length > 0 && enrichedBody.includes("### Market Opportunity"));
  }, [enrichedBody]);
  
  const hasBasicBody = useMemo(() => {
    return !!(activeIdeaState?.body?.length > 0 || currentActiveIdea?.body?.length > 0);
  }, [activeIdeaState?.body, currentActiveIdea?.body]);
  
  // hasBody is true if we have any body content (enriched or basic)
  const hasBody = hasEnrichedBody || hasBasicBody;
  
  // Determine if enrichment is needed
  const needsEnrichment = useMemo(() => {
    return activeIdea && !hasEnrichedBody && !cachedIdea && !cachedRun;
  }, [activeIdea, hasEnrichedBody, cachedIdea, cachedRun]);
  
  // Parse sections from enriched body (enrichment data contains all sections: Market Opportunity, Key Risks, etc.)
  const enrichedParsedSections = useMemo(() => {
    const bodyToParse = enrichedBody || activeIdeaState?.body || currentActiveIdea?.body || "";
    if (!bodyToParse || bodyToParse.trim().length === 0) {
      return parsedSections; // Fallback to base parsedSections if no enrichment body
    }
    // Parse sections from enriched body (contains Market Opportunity, Key Risks, etc.)
    const enrichedSections = splitIdeaSections(bodyToParse);
    // Merge: base sections + enriched sections (enriched sections take priority)
    return { ...DEFAULT_SECTIONS, ...parsedSections, ...enrichedSections };
  }, [enrichedBody, activeIdeaState?.body, currentActiveIdea?.body, parsedSections]);
  
  // Update orderedSections to use enriched sections
  const enrichedOrderedSections = useMemo(() => {
    return SECTION_ORDER.map(key => ({
      key,
      title: SECTION_LABELS[key],
      content: enrichedParsedSections[key] || ""
    }));
  }, [enrichedParsedSections]);
  
  // Process recommendation data using enriched sections
  const processedData = useMemo(() => {
    const bodyToParse = enrichedBody || activeIdeaState?.body || currentActiveIdea?.body || "";
    if (!currentActiveIdea || !bodyToParse || bodyToParse.trim().length === 0) {
      return null;
    }
    return processRecommendationData(enrichedParsedSections, currentActiveIdea, inputs);
  }, [enrichedBody, activeIdeaState, currentActiveIdea, enrichedParsedSections, inputs]);
  
  // Extract processed data - ensure arrays are never null/undefined
  const extractedData = useMemo(() => {
    if (!processedData) {
      return {
        heroStatement: null,
        heroChips: [], // Always return array, never null
        executionPhaseCards: null,
        financialSnapshot: null,
        riskRows: null,
        validationQuestions: null,
        fitNarrativeMarkdown: null,
        personaMarkdown: null,
        marketInsights: null,
        immediateExperimentsList: [],
        immediateNextSteps: [],
        decisionChecklist: [],
        roadmapMarkdown: null
      };
    }
    
    return {
      heroStatement: processedData.heroStatement,
      heroChips: Array.isArray(processedData.heroChips) ? processedData.heroChips : [],
      executionPhaseCards: processedData.executionPhaseCards,
      financialSnapshot: processedData.financialSnapshot,
      riskRows: processedData.riskRows,
      validationQuestions: processedData.validationQuestions,
      fitNarrativeMarkdown: processedData.fitNarrativeMarkdown,
      personaMarkdown: processedData.personaMarkdown,
      marketInsights: processedData.marketInsights,
      immediateExperimentsList: Array.isArray(processedData.immediateExperimentsList) ? processedData.immediateExperimentsList : [],
      immediateNextSteps: Array.isArray(processedData.immediateNextSteps) ? processedData.immediateNextSteps : [],
      decisionChecklist: Array.isArray(processedData.decisionChecklist) ? processedData.decisionChecklist : [],
      roadmapMarkdown: processedData.roadmapMarkdown
    };
  }, [processedData]);
  
  // Use lightweight next_steps from enrichment if available
  const discoveryNextSteps = currentActiveIdea?.enrichment?.next_steps;
  const finalImmediateNextSteps = useMemo(() => {
    if (discoveryNextSteps) {
      return discoveryNextSteps
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.trim().replace(/^-\s*/, ""));
    }
    return extractedData.immediateNextSteps || [];
  }, [discoveryNextSteps, extractedData.immediateNextSteps]);
  
  // Loading state: Show spinner when:
  // 1. Initial data is loading (and not cached)
  // 2. Enrichment is needed and is currently being fetched
  // 3. We have basic body but enrichment is in progress (wait for it to complete)
  const isLoadingPage = useMemo(() => {
    return (
      (loading && !cachedIdea && !cachedRun) || 
      (needsEnrichment && isEnriching && !enrichmentError) ||
      (hasBasicBody && !hasEnrichedBody && isEnriching && !enrichmentError && activeIdea && !cachedIdea && !cachedRun)
    );
  }, [loading, cachedIdea, cachedRun, needsEnrichment, isEnriching, enrichmentError, hasBasicBody, hasEnrichedBody, activeIdea]);
  
  // Check if content should be shown (has enriched body OR cached data)
  const shouldShowContent = useMemo(() => {
    return activeIdea && (hasEnrichedBody || cachedIdea || cachedRun);
  }, [activeIdea, hasEnrichedBody, cachedIdea, cachedRun]);
  
  return {
    // State flags
    hasEnrichedBody,
    hasBasicBody,
    hasBody,
    needsEnrichment,
    isLoadingPage,
    shouldShowContent,
    
    // Parsed data
    enrichedParsedSections,
    enrichedOrderedSections,
    processedData,
    
    // Extracted processed data
    ...extractedData,
    
    // Next steps
    discoveryNextSteps,
    finalImmediateNextSteps
  };
}
