/**
 * Dashboard API Service
 * Centralized service for all dashboard-related API calls
 */

/**
 * Fetch user activity (runs and validations)
 * @param {number} limit - Maximum number of items to return
 * @param {Object} headers - Request headers (auth headers)
 * @returns {Promise<Object>} Activity data with runs and validations
 */
export async function fetchUserActivity(limit = 100, headers = {}) {
  const response = await fetch(`/api/user/activity?limit=${limit}`, {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch user activity: ${response.status}`);
  }
  
  const json = await response.json();
  if (!json.success) {
    throw new Error('Activity fetch was not successful');
  }
  
  return {
    runs: json.runs || json?.activity?.runs || [],
    validations: json.validations || json?.activity?.validations || []
  };
}

/**
 * Fetch dashboard data (actions, notes, and activity)
 * @param {Object} headers - Request headers (auth headers)
 * @returns {Promise<Object>} Dashboard data
 */
export async function fetchDashboard(headers = {}) {
  const response = await fetch("/api/user/dashboard", {
    headers
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.status}`);
  }
  
  const data = await response.json();
  if (!data.success) {
    throw new Error('Dashboard fetch was not successful');
  }
  
  return {
    runs: data.activity?.runs || [],
    validations: data.activity?.validations || [],
    actions: data.actions || [],
    notes: data.notes || []
  };
}

/**
 * Fetch run statistics/insights
 * @param {Object} headers - Request headers (auth headers)
 * @returns {Promise<Object|null>} Insights data or null if not available
 */
export async function fetchStats(headers = {}) {
  try {
    const response = await fetch("/api/runs/stats", {
      headers
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.warn("Failed to fetch stats:", error);
    return null;
  }
}

/**
 * Fetch run details by ID
 * @param {string} runId - Normalized run ID
 * @param {Object} headers - Request headers (auth headers)
 * @returns {Promise<Object|null>} Run data or null if not found
 */
export async function fetchRunDetails(runId, headers = {}) {
  try {
    const response = await fetch(`/api/user/run/${runId}`, {
      headers
    });
    
    if (!response.ok) {
      return null;
    }
    
    const json = await response.json();
    if (!json.success) {
      return null;
    }
    
    return json.run;
  } catch (error) {
    console.warn(`Failed to fetch run ${runId}:`, error);
    return null;
  }
}


