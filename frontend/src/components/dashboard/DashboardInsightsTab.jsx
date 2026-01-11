import React from "react";
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

export default function DashboardInsightsTab({ insights }) {
 if (!insights) {
 return (
 <div className="rounded-xl border border-default shadow-sm bg-surface p-6 md:p-7 text-center border-default bg-surface">
 <p className={WORKSPACE_TYPOGRAPHY.subtitle + " leading-relaxed"}>Loading insights...</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className={WORKSPACE_TYPOGRAPHY.caption + " mb-2"}>Total Discoveries</p>
 <p className={WORKSPACE_TYPOGRAPHY.statValue}>{insights.discoveries || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className={WORKSPACE_TYPOGRAPHY.caption + " mb-2"}>Total Validations</p>
 <p className={WORKSPACE_TYPOGRAPHY.statValue}>{insights.validations || 0}</p>
 </div>

 <div className="rounded-xl border border-default p-5 bg-surface shadow-sm">
 <p className={WORKSPACE_TYPOGRAPHY.caption + " mb-2"}>Other Sessions</p>
 <p className={WORKSPACE_TYPOGRAPHY.statValue}>{insights.other || 0}</p>
 </div>
 </div>
 );
}

