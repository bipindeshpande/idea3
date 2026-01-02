import React from "react";

export default function DashboardInsightsTab({ insights }) {
 if (!insights) {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center border-default bg-surface">
 <p className="text-sm text-secondary leading-relaxed">Loading insights...</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className="text-xs text-secondary mb-2">Total Discoveries</p>
 <p className="text-2xl font-semibold text-primary">{insights.discoveries || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className="text-xs text-secondary mb-2">Total Validations</p>
 <p className="text-2xl font-semibold text-primary">{insights.validations || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className="text-xs text-secondary mb-2">Other Sessions</p>
 <p className="text-2xl font-semibold text-primary">{insights.other || 0}</p>
 </div>
 </div>
 );
}

