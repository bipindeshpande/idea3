import { useMemo, useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { parseStructuredIdeas, trimFromHeading } from "../../utils/parsers/index.js";
import { splitIdeaSections } from "../../utils/formatters/recommendationFormatters.js";
import { DEFAULT_SECTIONS, SECTION_ORDER, SECTION_LABELS } from "../../components/recommendations/utils/sectionConstants.js";

/**
 * Custom hook for managing recommendation data loading and parsing
 */
export function useRecommendationData(reports, inputs, loading, loadRunById, currentRunId) {
  const { ideaIndex } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const runId = query.get("id");

  // Get data from navigation state (cached) or context
  const stateData = location.state;
  const cachedIdea = stateData?.idea;
  const cachedRun = stateData?.run;
  const contextReports = cachedRun?.reports || cachedRun?.outputs || stateData?.recommendations || reports;
  const contextInputs = cachedRun?.inputs || stateData?.inputs || inputs;
  const cachedAllIdeas = cachedRun?.reports?.recommendations_structured || cachedRun?.outputs?.recommendations_structured || stateData?.allIdeas;

  // Freeze reports to prevent reloading discovery
  const stableReports = useMemo(() => contextReports, []);

  // Industry extraction
  const industry = contextInputs?.industry_interest || "";

  // Load run data if needed
  useEffect(() => {
    // If we have cached idea or cached run from navigation state, use it immediately
    if (cachedIdea || cachedRun) {
      if (process.env.NODE_ENV === 'development') {
        console.log("[useRecommendationData] Using cached data from navigation state, skipping ALL API/LLM calls", {
          hasCachedIdea: !!cachedIdea,
          hasCachedRun: !!cachedRun
        });
      }
      return;
    }

    if (stateData?.recommendations) {
      return;
    }

    // Only load if we don't already have the reports data and we're not currently loading
    if (runId && !loading && (!stableReports || Object.keys(stableReports).length === 0)) {
      loadRunById(runId);
    } else if (currentRunId && !runId && !loading && (!stableReports || Object.keys(stableReports).length === 0)) {
      loadRunById(currentRunId);
    }
  }, [runId, currentRunId, loading, stableReports, loadRunById, stateData, cachedIdea, cachedRun]);

  // Keep original markdown for ideas parsing
  const stage2Markdown = useMemo(
    () => trimFromHeading(stableReports?.personalized_recommendations ?? "", "### Comprehensive Recommendation Report"),
    [stableReports]
  );

  // Parse ideas from various sources
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
    const raw = stableReports?.personalized_recommendations || "";
    const structuredParsed = parseStructuredIdeas(raw);
    if (structuredParsed && structuredParsed.length > 0) {
      return structuredParsed;
    }
    // Fallback: markdown parser
    return parseStructuredIdeas(stage2Markdown, 10);
  }, [stage2Markdown, stableReports, cachedAllIdeas, cachedIdea]);

  // Find active idea
  const numericIndex = Number.parseInt(ideaIndex ?? "", 10);
  const activeIdea = cachedIdea || ideas.find((idea) => idea.index === numericIndex);

  // Compute ideaId
  const ideaId = useMemo(() => {
    const effectiveRunId = runId || currentRunId;
    if (effectiveRunId && activeIdea?.index !== undefined) {
      return `${effectiveRunId}::idea_${activeIdea.index}`;
    } else if (effectiveRunId) {
      console.warn("[useRecommendationData] Computed ideaId without idea index, using 0 as fallback");
      return `${effectiveRunId}::idea_0`;
    } else if (activeIdea?.index !== undefined) {
      console.error("[useRecommendationData] Cannot compute canonical ideaId: missing runId", {
        ideaIndex: activeIdea.index,
        runId,
        currentRunId
      });
      return null;
    }
    return null;
  }, [runId, currentRunId, activeIdea?.index]);

  const isValidIdeaId = ideaId && typeof ideaId === 'string' && ideaId.includes('::idea_');

  // Parse sections from markdown
  const [activeIdeaState, setActiveIdeaState] = useState(null);

  // Update activeIdeaState when activeIdea changes
  useEffect(() => {
    if (activeIdea) {
      setActiveIdeaState(prev => {
        // Preserve existing body if it exists (from enrichment)
        const existingBody = prev?.body && prev.body.trim().length > 0 ? prev.body : null;
        if (existingBody) {
          return {
            ...activeIdea,
            body: existingBody
          };
        }
        return activeIdea;
      });
    }
  }, [activeIdea]);

  const currentActiveIdea = activeIdeaState || activeIdea;

  // Parse sections
  const sections = useMemo(() => {
    const bodyToParse = currentActiveIdea?.body || "";

    if (!currentActiveIdea || !bodyToParse || bodyToParse.trim().length === 0) {
      return {
        merged: DEFAULT_SECTIONS,
        orderedSections: SECTION_ORDER.map(key => ({
          key,
          title: SECTION_LABELS[key],
          content: ""
        }))
      };
    }

    const parsed = splitIdeaSections(bodyToParse);
    const merged = { ...DEFAULT_SECTIONS, ...parsed };

    const orderedSections = SECTION_ORDER.map(key => ({
      key,
      title: SECTION_LABELS[key],
      content: merged[key] || ""
    }));

    return { merged, orderedSections };
  }, [currentActiveIdea]);

  const parsedSections = useMemo(() => sections.merged || DEFAULT_SECTIONS, [sections]);
  const orderedSections = sections.orderedSections;

  // Back navigation state
  const runQuery = runId || currentRunId;
  const backPath = runQuery ? `/results/recommendations?id=${runQuery}` : "/results/recommendations";
  const backState = stateData ? {
    recommendations: stateData.recommendations || contextReports,
    allIdeas: stateData.allIdeas || ideas,
    runId: stateData.runId || runQuery,
    inputs: stateData.inputs || contextInputs
  } : undefined;

  return {
    activeIdea,
    currentActiveIdea,
    activeIdeaState,
    setActiveIdeaState,
    ideas,
    ideaId,
    isValidIdeaId,
    industry,
    inputs: contextInputs,
    reports: stableReports,
    parsedSections,
    orderedSections,
    stage2Markdown,
    cachedIdea,
    cachedRun,
    backPath,
    backState,
    runQuery
  };
}

