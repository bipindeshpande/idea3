import { useState, useEffect, useRef } from "react";

/**
 * Custom hook for managing idea enrichment
 */
export function useEnrichment(currentActiveIdea, industry, reports, ideaId, getEnrichment, setEnrichment, cachedIdea, cachedRun, getAuthHeaders) {
  console.log("🟢 useEnrichment HOOK CALLED with:", {
    hasCurrentActiveIdea: !!currentActiveIdea,
    currentActiveIdeaTitle: currentActiveIdea?.title,
    industry,
    ideaId,
    hasCachedIdea: !!cachedIdea,
    hasCachedRun: !!cachedRun,
    hasGetAuthHeaders: !!getAuthHeaders
  });
  
  const [enrichedBody, setEnrichedBody] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState(null);
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
    console.log("🔵 useEffect TRIGGERED - Starting loadEnrichment check", {
      hasCachedIdea: !!cachedIdea,
      hasCachedRun: !!cachedRun,
      hasCurrentActiveIdea: !!currentActiveIdea,
      currentActiveIdeaTitle: currentActiveIdea?.title
    });
    
    async function loadEnrichment() {
      console.log("🟣 loadEnrichment function CALLED");
      // CRITICAL: Only skip enrichment if cached data has ENRICHED body (with markdown sections)
      if (cachedIdea || cachedRun) {
        const bodyToCheck = cachedIdea?.body || currentActiveIdea?.body;
        const isEnrichedBody = bodyToCheck && bodyToCheck.includes('## '); // Check for markdown headings
        
        console.log("🔍 ENRICHMENT DEBUG - Cached data check:", {
          hasCachedIdea: !!cachedIdea,
          hasCachedRun: !!cachedRun,
          cachedIdeaHasBody: !!cachedIdea?.body,
          cachedIdeaBodyLength: cachedIdea?.body?.length || 0,
          cachedIdeaBodyPreview: cachedIdea?.body?.substring(0, 100),
          isEnrichedBody: isEnrichedBody,
          cachedIdeaTitle: cachedIdea?.title,
          currentActiveIdeaHasBody: !!currentActiveIdea?.body,
          currentActiveIdeaBodyLength: currentActiveIdea?.body?.length || 0
        });
        
        if (isEnrichedBody) {
          // Body contains enriched markdown - use it
          console.log("✅ Cached idea has ENRICHED body - skipping API call");
          if (process.env.NODE_ENV === 'development') {
            console.log("[useEnrichment] Enrichment disabled - viewing cached enriched data");
          }
          setEnrichedBody(bodyToCheck);
          enrichmentCalledRef.current = true;
          return;
        } else {
          // Body exists but not enriched - continue to API call
          console.log("⚠️ Cached idea has body but NOT enriched - will call API");
        }
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
        // Check if body is actually enriched (contains markdown sections)
        const isEnrichedBody = currentActiveIdea.body.includes('## ');
        if (isEnrichedBody) {
          console.log("✅ SKIP: Already enriched, body length:", currentActiveIdea.body.length);
          enrichmentCalledRef.current = true;
          return;
        } else {
          console.log("⚠️ Body exists but not enriched (no markdown sections) - will call API");
        }
      }
      if (!reports?.profile_analysis) {
        console.log("❌ BLOCKED: No profile_analysis");
        return;
      }

      console.log("❌ CACHE MISS: No cached enrichment for", ideaId, "- will fetch from API");
      console.log("🚀 ENRICHMENT API CALL STARTING - All checks passed!");

      enrichmentCalledRef.current = true;
      setIsEnriching(true);

      try {
        console.log("=== Making enrichment API call ===");
        const authHeaders = getAuthHeaders ? getAuthHeaders() : {};
        const response = await fetch("/api/discovery/enrich_idea?format=json", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...authHeaders
          },
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
          setEnrichmentError(result?.error || "Enrichment failed");
        }
      } catch (err) {
        console.error("❌ Enrichment failed", err);
        setEnrichmentError(err.message || "Failed to load enrichment data");
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
    setEnrichment,
    getAuthHeaders
  ]);

  return {
    enrichedBody,
    isEnriching,
    enrichmentError,
    setEnrichedBody
  };
}

