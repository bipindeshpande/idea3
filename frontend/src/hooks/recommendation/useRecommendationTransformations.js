import { useMemo } from "react";
import { trimFromHeading, parseStructuredIdeas } from "../../utils/streamingParser.js";
import { buildFinalConclusion, parseRecommendationMatrix, splitFullReportSections } from "../../utils/formatters/recommendationFormatters.js";

/**
 * Custom hook for transforming and parsing recommendation data
 */
export function useRecommendationTransformations(effectiveReports, cachedIdeas, effectiveInputs = {}) {
  // Process markdown
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

  // Parse all ideas from various sources
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
  const unifiedNextSteps = useMemo(() => {
    if (allNextSteps.length > 0) {
      return allNextSteps
        .map((idea, index) => {
          return `## Next Steps for ${idea.title}\n\n${idea.steps}\n`;
        })
        .join("\n\n");
    }
    return null;
  }, [allNextSteps]);

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

  return {
    markdown,
    conflictAdjustment,
    allIdeas,
    topIdeas,
    secondaryIdeas,
    unifiedNextSteps,
    sections,
    matrixRows,
    finalRecommendation,
    finalConclusion
  };
}

