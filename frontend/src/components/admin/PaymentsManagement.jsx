import { useState, useEffect } from "react";
import { getAdminAuthToken } from "../../utils/admin.js";

export default function PaymentsManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch("/api/admin/payments", {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: "bg-surface text-accent",
      pending: "bg-surface text-accent",
      failed: "badge-danger",
    };
    return (
      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colors[status] || "bg-surface-muted text-primary"}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <p className="text-secondary text-secondary">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-primary text-secondary">Payments ({payments.length})</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-default">
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">User</th>
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Payment ID</th>
              <th className="px-4 py-3 text-left font-semibold text-primary text-secondary">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b border-default hover:bg-surface hover:bg-surface">
                <td className="px-4 py-3 text-primary text-secondary">{payment.user_email}</td>
                <td className="px-4 py-3 font-semibold text-primary text-secondary">
                  ${payment.amount} {payment.currency}
                </td>
                <td className="px-4 py-3 text-secondary text-secondary">{payment.subscription_type}</td>
                <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                <td className="px-4 py-3 text-xs text-secondary text-secondary font-mono">{payment.stripe_payment_intent_id}</td>
                <td className="px-4 py-3 text-secondary text-secondary">
                  {payment.created_at ? new Date(payment.created_at).toLocaleString() : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

