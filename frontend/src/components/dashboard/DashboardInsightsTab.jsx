import React from "react";

export default function DashboardInsightsTab({ insights }) {
 if (!insights) {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center border-default bg-surface">
 <p className="text-primary text-primary text-secondary leading-relaxed">Loading insights...</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm border-default bg-surface">
 <p className="text-xs text-secondary text-secondary mb-2">Total Discoveries</p>
 <p className="text-3xl font-semibold text-primary text-secondary">{insights.discoveries || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm border-default bg-surface">
 <p className="text-xs text-secondary text-secondary mb-2">Total Validations</p>
 <p className="text-3xl font-semibold text-primary text-secondary">{insights.validations || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm border-default bg-surface">
 <p className="text-xs text-secondary text-secondary mb-2">Other Sessions</p>
 <p className="text-3xl font-semibold text-primary text-secondary">{insights.other || 0}</p>
 </div>
 </div>
 );
}

