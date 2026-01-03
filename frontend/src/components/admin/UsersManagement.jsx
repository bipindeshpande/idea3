import { useState, useEffect } from "react";
import { getAdminAuthToken } from "../../utils/admin.js";
import UserDetailModal from "./UserDetailModal.jsx";

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/users", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetail = async (userId) => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch(`/api/admin/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserDetail(data);
      }
    } catch (error) {
      console.error("Failed to load user detail:", error);
    }
  };

  const getStatusBadge = (user) => {
    if (user.is_subscription_active) {
      return (
        <span className="inline-block rounded-full bg-surface bg-surface px-2 py-1 text-xs font-semibold text-accent text-accent">
          Active
        </span>
      );
    } else if (user.subscription_type === "free_trial") {
      return (
        <span className="inline-block rounded-full bg-surface bg-surface px-2 py-1 text-xs font-semibold text-accent text-accent">
          Free Trial
        </span>
      );
    } else {
      return (
        <span className="inline-block rounded-full bg-app bg-surface px-2 py-1 text-xs font-semibold text-primary text-secondary">
          Expired
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary text-secondary">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-primary text-secondary">Users ({users.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-default">
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Subscription</th>
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Days Remaining</th>
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-default hover:bg-surface hover:bg-surface">
                  <td className="px-4 py-3 text-primary text-secondary">{user.email}</td>
                  <td className="px-4 py-3 text-secondary text-secondary">{user.subscription_type || "N/A"}</td>
                  <td className="px-4 py-3">{getStatusBadge(user)}</td>
                  <td className="px-4 py-3 text-secondary text-secondary">{user.days_remaining || 0}</td>
                  <td className="px-4 py-3 text-secondary text-secondary">
                    {user.subscription_started_at ? new Date(user.subscription_started_at).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => loadUserDetail(user.id)}
                      className="rounded-lg border border-default bg-surface px-3 py-1 text-xs font-semibold text-accent transition hover:bg-surface-hover"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {userDetail && (
        <UserDetailModal
          userDetail={userDetail}
          onClose={() => {
            setUserDetail(null);
          }}
          onUpdate={loadUsers}
        />
      )}
    </div>
  );
}

