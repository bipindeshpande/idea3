import { useState, useEffect, useRef, useMemo } from "react";
import { parseProfileSections } from "../../utils/parsers/profileParsers.js";

/**
 * Custom hook for managing profile report state and logic
 * 
 * Handles:
 * - Loading profile analysis data
 * - Parsing profile sections
 * - Managing section toggle state
 * - Sample data handling
 * 
 * This allows ProfileReport component to be smaller and easier to debug.
 */
export function useProfileReportState({ reports, loadRunById, runId, isSample, SAMPLE_PROFILE_ANALYSIS }) {
  const [openSections, setOpenSections] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  
  // Track if we've already attempted to load for this runId
  const lastLoadedRunId = useRef(null);

  // Load run data if runId is provided (only once per runId)
  useEffect(() => {
    if (!isSample && runId && lastLoadedRunId.current !== runId) {
      lastLoadedRunId.current = runId;
      setIsLoading(true);
      loadRunById(runId)
        .then(() => {
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [runId, isSample, loadRunById]);

  // Use sample data if in sample mode, otherwise try reports from context first
  const effectiveProfileAnalysis = useMemo(() => {
    return isSample ? SAMPLE_PROFILE_ANALYSIS : reports?.profile_analysis;
  }, [isSample, SAMPLE_PROFILE_ANALYSIS, reports?.profile_analysis]);

  // Parse sections from profile analysis
  const sections = useMemo(() => {
    if (!effectiveProfileAnalysis) {
      return [];
    }
    
    return parseProfileSections(effectiveProfileAnalysis);
  }, [effectiveProfileAnalysis]);

  // Toggle section open/closed state
  const toggleSection = (sectionIndex) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionIndex)) {
        next.delete(sectionIndex);
      } else {
        next.add(sectionIndex);
      }
      return next;
    });
  };

  return {
    openSections,
    isLoading,
    effectiveProfileAnalysis,
    sections,
    toggleSection
  };
}
