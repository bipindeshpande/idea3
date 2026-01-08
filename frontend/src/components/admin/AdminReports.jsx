import { getAdminAuthToken } from "../../utils/admin.js";

export default function AdminReports() {
  const exportReport = async (reportType) => {
    try {
      const authToken = getAdminAuthToken();
      const response = await fetch(`/api/admin/reports/export?type=${reportType}`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to export report");
      }
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Failed to export report");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-default bg-surface p-8 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-primary">Reports</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-default bg-surface p-6 flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-accent">User Report</h3>
            <p className="mb-4 text-sm text-accent flex-grow">Export all user data with subscription details</p>
            <button
              onClick={() => exportReport("users")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="ui-card rounded-[16px] p-6 shadow-card flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-primary">Payment Report</h3>
            <p className="mb-4 text-sm text-secondary flex-grow">Export all payment transactions</p>
            <button
              onClick={() => exportReport("payments")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="ui-card rounded-[16px] p-6 shadow-card flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-primary">Activity Report</h3>
            <p className="mb-4 text-sm text-secondary flex-grow">Export runs and validations</p>
            <button
              onClick={() => exportReport("activity")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-default bg-surface p-6 flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-accent">Subscription Report</h3>
            <p className="mb-4 text-sm text-accent flex-grow">Export subscription analytics</p>
            <button
              onClick={() => exportReport("subscriptions")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-default bg-surface p-6 flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-accent">Revenue Report</h3>
            <p className="mb-4 text-sm text-accent flex-grow">Export revenue breakdown by period</p>
            <button
              onClick={() => exportReport("revenue")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>

          <div className="rounded-xl border border-default bg-surface p-6 flex flex-col">
            <h3 className="mb-2 text-lg font-semibold text-primary">Full Report</h3>
            <p className="mb-4 text-sm text-secondary flex-grow">Export comprehensive data dump</p>
            <button
              onClick={() => exportReport("full")}
              className="ui-btn ui-btn-secondary w-full mt-auto focus-visible:outline-accent"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

