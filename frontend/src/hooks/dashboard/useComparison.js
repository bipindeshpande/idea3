import { useCallback, useState } from "react";
import { parseStructuredIdeas } from "../../utils/parsers/index.js";
import { extractComparisonMetrics } from "../../utils/dashboard/extractComparisonMetrics.js";

/**
 * Hook for managing idea and validation comparisons
 */
export function useComparison({
  allIdeas,
  allRunsMerged,
  allValidations,
  getAuthHeaders,
  setComparisonData,
  setSelectedIdeas
}) {
  const [comparing, setComparing] = useState(false);

  const performComparison = useCallback(async (ideasToCompare) => {
    if (!ideasToCompare || ideasToCompare.size === 0) {
      alert("Please select at least one idea to compare");
      return;
    }

    if (ideasToCompare.size > 5) {
      alert("Maximum 5 ideas can be compared at once");
      return;
    }

    setComparing(true);

    try {
      const selectedIdeasData = allIdeas.filter(idea => {
        const ideaId = idea.id || `${idea.runId}-${idea.ideaIndex}`;
        return ideasToCompare.has(ideaId) || 
               ideasToCompare.has(`run_${idea.runId}_idea_${idea.ideaIndex}`) ||
               ideasToCompare.has(`${idea.runId}::idea_${idea.ideaIndex}`);
      });

      if (selectedIdeasData.length === 0) {
        alert("No matching ideas found. Please try selecting ideas again.");
        setComparing(false);
        return;
      }

      const runIds = [...new Set(selectedIdeasData.map(idea => idea.runId))];

      const requestBody = {
        run_ids: runIds,
        validation_ids: [],
      };

      const response = await fetch("/api/user/compare-sessions", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          if (data.comparison) {
            const ideasComparison = {
              ideas: selectedIdeasData.map(idea => {
                const run = data.comparison.runs?.find(r => r.run_id === idea.runId);
                if (run && run.reports?.personalized_recommendations) {
                  const topIdeas = parseStructuredIdeas(run.reports.personalized_recommendations, 3);
                  const matchedIdea = topIdeas.find(i => String(i.index) === String(idea.ideaIndex));
                  if (matchedIdea) {
                    const metrics = extractComparisonMetrics(run, idea.ideaIndex);
                    return {
                      ...idea,
                      fullData: matchedIdea,
                      metrics,
                      runInputs: run.inputs,
                      runCreatedAt: run.created_at,
                    };
                  }
                }
                const metrics = extractComparisonMetrics(
                  allRunsMerged.find(r => r.run_id === idea.runId),
                  idea.ideaIndex
                );
                return {
                  ...idea,
                  metrics,
                };
              }),
            };
            setComparisonData(ideasComparison);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            alert("Comparison completed but no data was returned. Please try again.");
          }
        } else {
          alert(data.error || "Failed to compare ideas. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Comparison error:", errorData);
        alert(errorData.error || `Failed to compare ideas (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error("Failed to compare ideas:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setComparing(false);
    }
  }, [allIdeas, allRunsMerged, getAuthHeaders, setComparisonData]);

  const performValidationComparison = useCallback(async (validationIdsToCompare) => {
    if (!validationIdsToCompare || validationIdsToCompare.size === 0) {
      alert("Please select at least one validation to compare");
      return;
    }

    if (validationIdsToCompare.size > 5) {
      alert("Maximum 5 validations can be compared at once");
      return;
    }

    setComparing(true);

    try {
      const selectedValidationsData = allValidations.filter(validation => {
        const validationId = validation.validation_id || validation.id;
        return validationIdsToCompare.has(validationId);
      });

      if (selectedValidationsData.length === 0) {
        alert("No matching validations found. Please try selecting validations again.");
        setComparing(false);
        return;
      }

      const validationIds = selectedValidationsData.map(v => v.validation_id || v.id);

      const requestBody = {
        run_ids: [],
        validation_ids: validationIds,
      };

      const response = await fetch("/api/user/compare-sessions", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.success) {
          if (data.comparison) {
            const validationsComparison = {
              validations: selectedValidationsData.map(validation => {
                const apiValidation = data.comparison.validations?.find(
                  v => (v.validation_id || v.id) === (validation.validation_id || validation.id)
                );
                
                const validationResult = apiValidation?.validation || 
                                        validation.validation_result || 
                                        validation.validation || {};
                
                return {
                  id: validation.validation_id || validation.id,
                  title: validation.idea_explanation || "Validation",
                  summary: validation.idea_explanation || "",
                  overall_score: validation.overall_score || validationResult.overall_score,
                  scores: validationResult.scores || {},
                  category_answers: validation.category_answers || {},
                  created_at: validation.created_at || validation.timestamp,
                  validation_result: validationResult,
                };
              }),
            };
            setComparisonData(validationsComparison);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            alert("Comparison completed but no data was returned. Please try again.");
          }
        } else {
          alert(data.error || "Failed to compare validations. Please try again.");
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Validation comparison error:", errorData);
        alert(errorData.error || `Failed to compare validations (${response.status}). Please try again.`);
      }
    } catch (error) {
      console.error("Failed to compare validations:", error);
      alert("Network error. Please check your connection and try again.");
    } finally {
      setComparing(false);
    }
  }, [allValidations, getAuthHeaders, setComparisonData]);

  return {
    comparing,
    performComparison,
    performValidationComparison
  };
}

