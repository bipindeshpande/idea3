import { useEffect } from "react";
import { parseStructuredIdeas } from "../../utils/parsers/index.js";
import { normalizeRunId } from "../../utils/runs.js";

const STORAGE_KEY = "sia_saved_runs";

/**
 * Custom hook to extract ideas from API and localStorage runs
 * 
 * @param {Array} apiRuns - Array of runs from API
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @param {boolean} loadingRuns - Whether runs are currently loading
 * @param {Function} getAuthHeaders - Function to get auth headers
 * @param {Function} setAllIdeas - State setter for ideas
 */
export function useIdeasExtraction({
  apiRuns,
  isAuthenticated,
  loadingRuns,
  getAuthHeaders,
  setAllIdeas
}) {
  useEffect(() => {
    const extractIdeas = async () => {
      const ideas = [];
      const seen = new Set();

      // Fetch missing reports from API runs
      const runsMissing = apiRuns.filter(
        r => !(r.reports?.personalized_recommendations || r.personalized_recommendations)
      );

      const fetchedReports = new Map();
      for (const run of runsMissing) {
        const id = normalizeRunId(run.run_id);
        try {
          const res = await fetch(`/api/user/run/${id}`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const json = await res.json();
            if (json.success) {
              let rep = json.run.reports;
              if (typeof rep === "string") {
                try {
                  rep = JSON.parse(rep);
                } catch {}
              }
              if (rep?.personalized_recommendations) {
                fetchedReports.set(id, rep);
              }
            }
          }
        } catch {}
      }

      // Process API runs
      for (const r of apiRuns) {
        const runId = normalizeRunId(r.run_id);
        let reports = r.reports;
        if (typeof reports === "string") {
          try {
            reports = JSON.parse(reports);
          } catch {}
        }
        let recs =
          reports?.personalized_recommendations ||
          r.personalized_recommendations ||
          fetchedReports.get(runId)?.personalized_recommendations;

        if (!recs) continue;

        const top = parseStructuredIdeas(recs, 3);
        top.forEach(idea => {
          const idx = String(idea.index);
          const id = `${runId}-${idx}`;
          if (!seen.has(id)) {
            seen.add(id);
            ideas.push({
              id,
              runId,
              ideaIndex: idx,
              title: idea.title,
              summary: idea.summary,
              runInputs: r.inputs || {},
              runCreatedAt: r.created_at,
              runReports: reports
            });
          }
        });
      }

      // Process localStorage runs
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.forEach(run => {
            const runId = normalizeRunId(run.run_id || run.id);
            if (
              apiRuns.some(a => normalizeRunId(a.run_id) === runId)
            ) {
              return;
            }
            const recs = run.outputs?.personalized_recommendations;
            if (!recs) return;
            const top = parseStructuredIdeas(recs, 3);
            top.forEach(idea => {
              const idx = String(idea.index);
              const id = `${runId}-${idx}`;
              if (!seen.has(id)) {
                seen.add(id);
                ideas.push({
                  id,
                  runId,
                  ideaIndex: idx,
                  title: idea.title,
                  summary: idea.summary,
                  runInputs: run.inputs,
                  runCreatedAt: run.timestamp,
                  runReports: run.outputs
                });
              }
            });
          });
        } catch {}
      }

      setAllIdeas(ideas);
    };

    if (apiRuns.length || !isAuthenticated || !loadingRuns) extractIdeas();
  }, [apiRuns, isAuthenticated, loadingRuns, getAuthHeaders, setAllIdeas]);
}

