import { useState, useEffect, useCallback } from "react";
import { getAdminAuthToken, ADMIN_STORAGE_KEY } from "../../utils/admin.js";
import SystemSettingsPanel from "./SystemSettingsPanel.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");

  const loadDashboardData = useCallback(async () => {
    // Only load if authenticated
    if (localStorage.getItem(ADMIN_STORAGE_KEY) !== "true") {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch(`/api/admin/stats?time_range=${timeRange}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.stats) {
          setStats(data.stats);
          setError(null);
        } else {
          setError(data.error || "Invalid response format");
          console.error("Invalid response format:", data);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || `Failed to load dashboard data (${response.status})`);
        console.error("Failed to load dashboard data:", response.status, errorData);
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-card badge-danger rounded-[16px] p-6 shadow-card">
        <p className="font-semibold">Error loading dashboard</p>
        <p className="mt-2 text-sm">{error}</p>
        <button
          onClick={loadDashboardData}
          className="ui-btn ui-btn-primary mt-4 focus-visible:outline-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary">No dashboard data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-default bg-surface p-6 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-primary">Dashboard Overview</h2>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-default bg-surface px-4 py-2 text-sm font-semibold text-primary"
          >
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-default p-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Users</h3>
            <p className="text-4xl font-bold text-accent">{stats.total_users || 0}</p>
            <p className="mt-2 text-xs text-accent">Registered accounts</p>
          </div>

          <div className="ui-card rounded-[16px] p-6 shadow-card">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Revenue</h3>
            <p className="text-4xl font-bold text-primary font-mono">${(stats.total_revenue || 0).toFixed(2)}</p>
            <p className="mt-2 text-xs text-secondary">From completed payments</p>
          </div>

          <div className="ui-card rounded-[16px] p-6 shadow-card">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Active Subscriptions</h3>
            <p className="text-4xl font-bold text-primary font-mono">{stats.active_subscriptions || 0}</p>
            <p className="mt-2 text-xs text-secondary">Currently active</p>
          </div>

          <div className="rounded-2xl border border-default p-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Runs</h3>
            <p className="text-4xl font-bold text-accent">{stats.total_runs || 0}</p>
            <p className="mt-2 text-xs text-accent">Discovery sessions</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-default bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Free Users</h3>
            <p className="text-2xl font-bold text-primary">{stats.free_trial_users || 0}</p>
          </div>
          <div className="rounded-xl border border-default bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Weekly Subscribers</h3>
            <p className="text-2xl font-bold text-primary">{stats.weekly_subscribers || 0}</p>
          </div>
          <div className="rounded-xl border border-default bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Starter Subscribers</h3>
            <p className="text-2xl font-bold text-primary">{stats.starter_subscribers || 0}</p>
          </div>
          <div className="rounded-xl border border-default bg-surface p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Pro Subscribers</h3>
            <p className="text-2xl font-bold text-primary">{stats.pro_subscribers || 0}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-default bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-primary">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Total Validations</span>
                <span className="text-lg font-bold text-primary">{stats.total_validations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Completed Payments</span>
                <span className="text-lg font-bold text-primary">{stats.total_payments || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Conversion Rate</span>
                <span className="text-lg font-bold text-primary">
                  {stats.total_users > 0 ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-default bg-surface p-6">
            <h3 className="mb-4 text-lg font-semibold text-primary">Revenue Metrics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Average Revenue per User</span>
                <span className="text-lg font-bold text-primary">
                  ${stats.total_users > 0 ? (stats.total_revenue / stats.total_users).toFixed(2) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Monthly Recurring Revenue</span>
                <span className="text-lg font-bold text-primary">
                  ${((stats.pro_subscribers || 0) * 15 + (stats.starter_subscribers || 0) * 7).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Weekly Recurring Revenue</span>
                <span className="text-lg font-bold text-primary">
                  ${((stats.weekly_subscribers || 0) * 5).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="mt-6 rounded-xl border border-default bg-surface p-6">
        <SystemSettingsPanel />
      </div>
    </div>
  );
}

