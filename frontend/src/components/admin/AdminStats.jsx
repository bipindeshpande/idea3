import { useState, useEffect } from "react";
import { getAdminAuthToken, ADMIN_STORAGE_KEY } from "../../utils/admin.js";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      // Only load if authenticated
      if (localStorage.getItem(ADMIN_STORAGE_KEY) !== "true") {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      try {
        const authToken = getAdminAuthToken();
        const response = await fetch("/api/admin/stats", {
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
          setError(errorData.error || `Failed to load statistics (${response.status})`);
          console.error("Failed to load stats:", response.status, errorData);
        }
      } catch (error) {
        setError(`Network error: ${error.message}`);
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary text-secondary">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-card badge-danger rounded-[16px] p-6 shadow-card">
        <p className="font-semibold">Error loading statistics</p>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary text-secondary">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
      <h2 className="mb-6 text-2xl font-semibold text-primary text-secondary">Statistics</h2>
      
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-default bg-surface p-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Users</h3>
          <p className="text-3xl font-bold text-accent">{stats.total_users || 0}</p>
          <p className="mt-2 text-xs text-accent">Registered users</p>
        </div>

        <div className="ui-card rounded-[16px] p-6 shadow-card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Runs</h3>
          <p className="text-3xl font-bold text-primary font-mono">{stats.total_runs || 0}</p>
          <p className="mt-2 text-xs text-secondary">Idea discovery sessions</p>
        </div>

        <div className="ui-card rounded-[16px] p-6 shadow-card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-secondary">Total Validations</h3>
          <p className="text-3xl font-bold text-primary font-mono">{stats.total_validations || 0}</p>
          <p className="mt-2 text-xs text-secondary">Idea validations completed</p>
        </div>

        <div className="rounded-2xl border border-default bg-surface p-6">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Total Revenue</h3>
          <p className="text-3xl font-bold text-accent">${(stats.total_revenue || 0).toFixed(2)}</p>
          <p className="mt-2 text-xs text-accent">From completed payments</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-default bg-app bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Active Subscriptions</h3>
          <p className="text-2xl font-bold text-primary text-secondary">{stats.active_subscriptions || 0}</p>
        </div>

        <div className="rounded-2xl border border-default bg-app bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Free Trial Users</h3>
          <p className="text-2xl font-bold text-primary text-secondary">{stats.free_trial_users || 0}</p>
        </div>

        <div className="rounded-2xl border border-default bg-app bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Weekly Subscribers</h3>
          <p className="text-2xl font-bold text-primary text-secondary">{stats.weekly_subscribers || 0}</p>
        </div>

        <div className="rounded-2xl border border-default bg-app bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Monthly Subscribers</h3>
          <p className="text-2xl font-bold text-primary text-secondary">{stats.monthly_subscribers || 0}</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="rounded-2xl border border-default bg-app bg-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-primary text-secondary">Completed Payments</h3>
          <p className="text-2xl font-bold text-primary text-secondary">{stats.total_payments || 0}</p>
        </div>
      </div>
    </div>
  );
}

