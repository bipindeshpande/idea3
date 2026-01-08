import { useState } from "react";
import { getAdminAuthToken } from "../../utils/admin.js";

export default function UserDetailModal({ userDetail, onClose, onUpdate }) {
  if (!userDetail || !userDetail.user) {
    return null;
  }

  const [subscriptionType, setSubscriptionType] = useState(userDetail.user.subscription_type || "free_trial");
  const [durationDays, setDurationDays] = useState(7);
  const [saving, setSaving] = useState(false);

  const handleUpdateSubscription = async () => {
    setSaving(true);
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch(`/api/admin/user/${userDetail.user.id}/subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          subscription_type: subscriptionType,
          duration_days: durationDays,
        }),
      });

      if (response.ok) {
        alert("Subscription updated successfully");
        onUpdate();
        onClose();
      } else {
        try {
          const data = await response.json();
          alert(`Failed to update: ${data.error || "Unknown error"}`);
        } catch {
          alert(`Failed to update: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-3xl border border-default bg-surface p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">User Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary transition hover:bg-surface hover:text-primary"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold text-primary">Email</h3>
            <p className="text-secondary">{userDetail.user.email}</p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">Current Subscription</h3>
            <p className="text-secondary">
              {userDetail.user.subscription_type || "N/A"} - {userDetail.user.days_remaining || 0} days remaining
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">Update Subscription</h3>
            <div className="space-y-3">
              <select
                value={subscriptionType}
                onChange={(e) => setSubscriptionType(e.target.value)}
                className="w-full rounded-lg border border-default bg-surface p-2 text-sm text-primary"
              >
                <option value="free_trial">Free Trial</option>
                <option value="weekly">Weekly ($5)</option>
                <option value="starter">Starter ($7/month)</option>
                <option value="pro">Pro ($15/month)</option>
              </select>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                placeholder="Duration in days"
                className="w-full rounded-lg border border-default bg-surface p-2 text-sm text-primary"
              />
              <button
                onClick={handleUpdateSubscription}
                disabled={saving}
                className="ui-btn ui-btn-primary w-full focus-visible:outline-accent disabled:opacity-50"
              >
                {saving ? "Updating..." : "Update Subscription"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">Runs ({userDetail.runs?.length || 0})</h3>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {userDetail.runs?.map((run) => (
                <div key={run.id} className="rounded-lg border border-default bg-surface p-2 text-xs text-primary">
                  {run.run_id} - {run.created_at ? new Date(run.created_at).toLocaleString() : "N/A"}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">Validations ({userDetail.validations?.length || 0})</h3>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {userDetail.validations?.map((validation) => (
                <div key={validation.id} className="rounded-lg border border-default bg-surface p-2 text-xs text-primary">
                  {validation.validation_id} - {validation.created_at ? new Date(validation.created_at).toLocaleString() : "N/A"}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-primary">Payments ({userDetail.payments?.length || 0})</h3>
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {userDetail.payments?.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-default bg-surface p-2 text-xs text-primary">
                  ${payment.amount} {payment.currency} - {payment.subscription_type} - {payment.status} -{" "}
                  {payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A"}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

