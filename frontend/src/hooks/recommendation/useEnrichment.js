import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing idea enrichment
 */
export function useEnrichment(currentActiveIdea, industry, reports, ideaId, getEnrichment, setEnrichment, cachedIdea, cachedRun) {
  const [enrichedBody, setEnrichedBody] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const enrichmentCalledRef = useRef(false);
  const lastEnrichmentIdeaRef = useRef(null);

  // Check cache on mount/idea change and set enrichedBody if found
  useEffect(() => {
    if (ideaId && !enrichedBody && !currentActiveIdea?.body) {
      const cachedEnrichment = getEnrichment(ideaId);
      if (cachedEnrichment) {
        console.log("✅ CACHE LOAD: Found cached enrichment on mount for", ideaId);
        setEnrichedBody(cachedEnrichment);
      }
    }
  }, [ideaId, getEnrichment, enrichedBody, currentActiveIdea?.body]);

  // Fetch enrichment when user clicks "View details"
  useEffect(() => {
    async function loadEnrichment() {
      // CRITICAL: Disable enrichment if viewing cached idea or cached run
      if (cachedIdea || cachedRun) {
        if (process.env.NODE_ENV === 'development') {
          console.log("[useEnrichment] Enrichment disabled - viewing cached data", {
            hasCachedIdea: !!cachedIdea,
            hasCachedRun: !!cachedRun
          });
        }
        if (cachedIdea?.body) {
          setEnrichedBody(cachedIdea.body);
        }
        enrichmentCalledRef.current = true;
        return;
      }

      // Reset ref if idea changed
      const currentIdeaKey = currentActiveIdea?.index !== undefined
        ? `idea_${currentActiveIdea.index}`
        : currentActiveIdea?.title;

      if (lastEnrichmentIdeaRef.current !== currentIdeaKey) {
        console.log("🔄 Idea changed, resetting enrichment ref");
        enrichmentCalledRef.current = false;
        lastEnrichmentIdeaRef.current = currentIdeaKey;
      }

      // Check cache first
      const cachedEnrichment = ideaId ? getEnrichment(ideaId) : null;
      if (cachedEnrichment) {
        console.log("✅ CACHE HIT (useEffect): Using cached enrichment for", ideaId);
        setEnrichedBody(cachedEnrichment);
        enrichmentCalledRef.current = true;
        return;
      }

      // Ref-based guard
      if (enrichmentCalledRef.current) {
        console.log("✅ SKIP: Enrichment already called for this idea (ref guard)");
        return;
      }

      // Validation checks
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
        enrichmentCalledRef.current = true;
        return;
      }
      if (!reports?.profile_analysis) {
        console.log("❌ BLOCKED: No profile_analysis");
        return;
      }

      console.log("❌ CACHE MISS: No cached enrichment for", ideaId, "- will fetch from API");

      enrichmentCalledRef.current = true;
      setIsEnriching(true);

      try {
        console.log("=== Making enrichment API call ===");
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
            profile_analysis: reports?.profile_analysis
          })
        });

        const result = await response.json();

        if (result?.success) {
          const enrichmentBody = result.enrichment.body;

          // Store enrichment in cache
          if (ideaId && enrichmentBody) {
            setEnrichment(ideaId, enrichmentBody);
            console.log("✅ CACHE STORED: Enrichment saved to cache for", ideaId);
          }

          setEnrichedBody(enrichmentBody);
          console.log("✅ ENRICHMENT COMPLETE");
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
  }, [
    currentActiveIdea?.title,
    currentActiveIdea?.index,
    industry,
    reports?.profile_analysis,
    cachedIdea,
    cachedRun,
    ideaId,
    getEnrichment,
    setEnrichment
  ]);

  return {
    enrichedBody,
    isEnriching,
    setEnrichedBody
  };
}

