import { useMemo } from "react";

/**
 * Hook for merging API and local data (runs and validations)
 */
export function useDataMerging({
  apiRuns,
  runs,
  apiValidations,
  getSavedValidations,
  isAuthenticated,
  loadingRuns
}) {
  const allRunsMerged = useMemo(() => {
    if (isAuthenticated && !loadingRuns) {
      const apiMapped = apiRuns.map(r => {
        let reports = {};
        if (r.reports) {
          try {
            reports = typeof r.reports === "string" ? JSON.parse(r.reports) : r.reports;
          } catch {}
        }
        return {
          id: `run_${r.run_id}`,
          timestamp: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
          inputs: r.inputs || {},
          outputs: reports,
          reports,
          run_id: r.run_id,
          from_api: true,
          is_validation: false
        };
      });

      const localMapped = runs.map(r => ({
        ...r,
        from_api: false,
        is_validation: false
      }));

      const combined = [...apiMapped];
      const apiIds = new Set(apiMapped.map(r => r.run_id));

      localMapped.forEach(local => {
        const id = local.run_id || local.id;
        if (!apiIds.has(id)) combined.push(local);
      });

      return combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    return runs.map(r => ({
      ...r,
      from_api: false,
      is_validation: false
    }));
  }, [apiRuns, runs, isAuthenticated, loadingRuns]);

  const allValidations = useMemo(() => {
    if (loadingRuns) {
      console.log("⏳ Validations loading - waiting for runs to finish");
      return [];
    }

    console.log("🔍 Processing validations:", {
      apiValidationsCount: apiValidations?.length || 0,
      apiValidations: apiValidations,
      isAuthenticated,
      loadingRuns
    });

    // Transform API validations
    const apiMapped = (apiValidations || []).map(v => {
      const validationResult = v.validation || {};
      const overallScore = validationResult.overall_score;
      
      return {
        id: v.validation_id || v.id,
        validation_id: v.validation_id || v.id,
        timestamp: v.created_at ? new Date(v.created_at).getTime() : Date.now(),
        idea_explanation: v.idea_explanation || "",
        category_answers: v.category_answers || {},
        overall_score: overallScore !== undefined ? overallScore : validationResult.scores ? 
          Object.values(validationResult.scores || {}).reduce((sum, score) => sum + (parseFloat(score) || 0), 0) / 
          (Object.keys(validationResult.scores || {}).length || 1) : undefined,
        validation_result: validationResult,
        created_at: v.created_at,
        from_api: true,
        is_validation: true
      };
    });

    // Get localStorage validations if authenticated
    let localValidations = [];
    if (isAuthenticated) {
      try {
        const saved = getSavedValidations();
        localValidations = (saved || []).map(v => {
          const validationResult = v.validation || v.validation_result || {};
          const overallScore = validationResult.overall_score;
          
          return {
            id: v.id || v.validation_id,
            validation_id: v.validation_id || v.id,
            timestamp: v.timestamp || Date.now(),
            idea_explanation: v.ideaExplanation || v.idea_explanation || "",
            category_answers: v.categoryAnswers || v.category_answers || {},
            overall_score: overallScore !== undefined ? overallScore : 
              (validationResult.scores ? 
                Object.values(validationResult.scores || {}).reduce((sum, score) => sum + (parseFloat(score) || 0), 0) / 
                (Object.keys(validationResult.scores || {}).length || 1) : undefined),
            validation_result: validationResult,
            created_at: v.created_at || (v.timestamp ? new Date(v.timestamp).toISOString() : null),
            from_api: false,
            is_validation: true
          };
        });
      } catch (err) {
        console.error("Failed to load saved validations:", err);
      }
    }

    // Merge: prefer API validations, add local ones that aren't in API
    const combined = [...apiMapped];
    const apiIds = new Set(apiMapped.map(v => v.validation_id || v.id));
    
    localValidations.forEach(local => {
      const id = local.validation_id || local.id;
      if (!apiIds.has(id)) {
        combined.push(local);
      }
    });

    // Sort by timestamp (newest first)
    const sorted = combined.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    console.log("✅ Final validations:", {
      totalCount: sorted.length,
      apiCount: apiMapped.length,
      localCount: localValidations.length,
      validations: sorted.slice(0, 3).map(v => ({
        id: v.id,
        idea_explanation: v.idea_explanation?.substring(0, 50),
        overall_score: v.overall_score
      }))
    });
    return sorted;
  }, [apiValidations, getSavedValidations, isAuthenticated, loadingRuns]);

  return {
    allRunsMerged,
    allValidations
  };
}

