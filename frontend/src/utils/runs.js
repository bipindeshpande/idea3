/**
 * Helper functions for run history API.
 */

export async function fetchRuns({ page = 1, pageSize = 100, sortBy = "created_at", sortOrder = "desc" } = {}) {
  const resp = await fetch(`/api/runs?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&sort_order=${sortOrder}`);
  if (!resp.ok) throw new Error("Failed to load runs");
  return resp.json();
}

export async function fetchRunById(runId) {
  const resp = await fetch(`/api/runs/${encodeURIComponent(runId)}`);
  if (!resp.ok) throw new Error("Failed to load run details");
  return resp.json();
}

