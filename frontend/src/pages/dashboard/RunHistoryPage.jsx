import { useEffect, useMemo, useState } from "react";
import { fetchRuns, fetchRunById } from "../../utils/runs";
import { useReports } from "../../context/ReportsContext.jsx";

const TIME_FILTERS = [
  { id: "all", label: "All time", days: null },
  { id: "24h", label: "Last 24h", days: 1 / 24 },
  { id: "7d", label: "Last 7d", days: 7 },
  { id: "30d", label: "Last 30d", days: 30 },
];

const SORT_OPTIONS = [
  { id: "created_at_desc", label: "Created (newest)" },
  { id: "created_at_asc", label: "Created (oldest)" },
  { id: "duration_desc", label: "Duration (longest)" },
  { id: "duration_asc", label: "Duration (shortest)" },
];

function formatDurationMs(ms) {
  if (ms == null) return "n/a";
  if (ms < 1000) return `${ms.toFixed(0)} ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)} s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem.toFixed(0)}s`;
}

export default function RunHistoryPage() {
  const { runCrew, setInputs } = useReports();
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [error, setError] = useState(null);
  const [interestFilter, setInterestFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("created_at_desc");
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchRuns({ page: 1, pageSize: 200, sortBy: "created_at", sortOrder: "desc" })
      .then((data) => {
        if (!isMounted) return;
        // FIX: Extract runs from response - API returns { runs: [...], pagination: {...} }
        const runsList = data.runs || [];
        console.log("Loaded sessions:", runsList);
        setRuns(runsList);
        setError(null);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load runs");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRuns = useMemo(() => {
    let r = runs.slice();
    if (interestFilter !== "all") {
      r = r.filter((run) => (run.inputs?.interest_area || "").toLowerCase() === interestFilter.toLowerCase());
    }
    if (timeFilter !== "all") {
      const now = Date.now();
      const days = TIME_FILTERS.find((f) => f.id === timeFilter)?.days;
      if (days) {
        const threshold = now - days * 24 * 60 * 60 * 1000;
        r = r.filter((run) => {
          const ts = run.created_at ? new Date(run.created_at).getTime() : null;
          return ts && ts >= threshold;
        });
      }
    }
    // sort
    r.sort((a, b) => {
      const durA = durationMs(a);
      const durB = durationMs(b);
      switch (sortOption) {
        case "created_at_asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "created_at_desc":
          return new Date(b.created_at) - new Date(a.created_at);
        case "duration_asc":
          return durA - durB;
        case "duration_desc":
          return durB - durA;
        default:
          return 0;
      }
    });
    return r;
  }, [runs, interestFilter, timeFilter, sortOption]);

  const interestOptions = useMemo(() => {
    const set = new Set();
    runs.forEach((r) => {
      if (r.inputs?.interest_area) set.add(r.inputs.interest_area);
    });
    return Array.from(set);
  }, [runs]);

  function durationMs(run) {
    if (!run.created_at || !run.completed_at) return null;
    return new Date(run.completed_at).getTime() - new Date(run.created_at).getTime();
  }

  const handleSelectRun = async (runId) => {
    setDetailLoading(true);
    try {
      const data = await fetchRunById(runId);
      setSelectedRun(data);
    } catch (e) {
      setError(e.message || "Failed to load run details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRerun = async (run) => {
    if (!run?.inputs) return;
    try {
      setInputs(run.inputs);
      await runCrew(run.inputs);
    } catch (e) {
      setError(e.message || "Failed to rerun");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Run History</h1>
          <p className="text-sm text-slate-500">View and manage your past discovery runs.</p>
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-xs font-semibold text-slate-600">Interest Area</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
          >
            <option value="all">All</option>
            {interestOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Time</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            {TIME_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Sort</label>
          <select
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading runs...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Run ID</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Interest</th>
                <th className="px-3 py-2 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {(filteredRuns || []).map((run) => (
                <tr key={run.run_id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono text-xs">{run.run_id}</td>
                  <td className="px-3 py-2">{run.created_at ? new Date(run.created_at).toLocaleString() : "n/a"}</td>
                  <td className="px-3 py-2">{formatDurationMs(durationMs(run))}</td>
                  <td className="px-3 py-2 capitalize">{run.status || "unknown"}</td>
                  <td className="px-3 py-2">{run.inputs?.interest_area || "—"}</td>
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="text-brand-600 hover:underline text-xs"
                      onClick={() => handleSelectRun(run.run_id)}
                    >
                      View
                    </button>
                    <button
                      className="text-brand-600 hover:underline text-xs"
                      onClick={() => handleRerun(run)}
                    >
                      Re-run
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRuns.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-center text-slate-500" colSpan={6}>No runs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedRun && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Run Details</h2>
            {detailLoading && <span className="text-xs text-slate-500">Loading...</span>}
          </div>
          <div className="grid gap-2 text-sm">
            <div><strong>Run ID:</strong> {selectedRun.run_id}</div>
            <div><strong>Status:</strong> {selectedRun.status || "unknown"}{selectedRun.cached ? " (cached)" : ""}</div>
            <div><strong>Created:</strong> {selectedRun.created_at ? new Date(selectedRun.created_at).toLocaleString() : "n/a"}</div>
            <div><strong>Completed:</strong> {selectedRun.completed_at ? new Date(selectedRun.completed_at).toLocaleString() : "n/a"}</div>
            <div><strong>Duration:</strong> {formatDurationMs(durationMs(selectedRun))}</div>
            <div><strong>Interest:</strong> {selectedRun.inputs?.interest_area || "—"}</div>
          </div>
          <div className="grid gap-2 text-sm">
            <div>
              <strong>Profile Analysis</strong>
              <div className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                {selectedRun.reports?.profile_analysis || selectedRun.profile_analysis || "No data"}
              </div>
            </div>
            <div>
              <strong>Recommendations</strong>
              <div className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                {selectedRun.reports?.personalized_recommendations || selectedRun.personalized_recommendations || "No data"}
              </div>
            </div>
            <div>
              <strong>Static Blocks Used</strong>
              <div className="mt-1 whitespace-pre-wrap rounded border border-slate-200 bg-slate-50 p-2 text-xs">
                {selectedRun.reports?.startup_ideas_research || "No data"}
              </div>
            </div>
            <div>
              <strong>Token Usage</strong>
              <div className="mt-1 text-xs text-slate-700">
                {selectedRun.reports?.usage ? (
                  <ul className="list-disc pl-4">
                    <li>Prompt tokens: {selectedRun.reports.usage.prompt_tokens ?? "n/a"}</li>
                    <li>Completion tokens: {selectedRun.reports.usage.completion_tokens ?? "n/a"}</li>
                    <li>Total tokens: {selectedRun.reports.usage.total_tokens ?? "n/a"}</li>
                  </ul>
                ) : (
                  "No usage data"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

