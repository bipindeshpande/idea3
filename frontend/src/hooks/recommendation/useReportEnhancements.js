import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Custom hook for managing report enhancements
 */
export function useReportEnhancements(isAuthenticated, runId, effectiveReports, cachedRun, getAuthHeaders) {
  const [enhancements, setEnhancements] = useState(null);
  const [enhancementsLoading, setEnhancementsLoading] = useState(false);
  const [enhancementsStarted, setEnhancementsStarted] = useState(false);
  const abortControllerRef = useRef(null);

  const startEnhancements = useCallback(async () => {
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
  }, [enhancementsStarted, runId, getAuthHeaders]);

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
  }, [isAuthenticated, runId, enhancementsStarted, effectiveReports, cachedRun, startEnhancements]);

  return {
    enhancements,
    enhancementsLoading,
    enhancementsStarted
  };
}

