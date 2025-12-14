import React from "react";

export default function DashboardInsightsTab({ insights }) {
  if (!insights) {
    return (
      <div className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-[15px] text-gray-700 dark:text-slate-300 leading-relaxed">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">Total Discoveries</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-slate-50">{insights.discoveries || 0}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">Total Validations</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-slate-50">{insights.validations || 0}</p>
      </div>

      <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
        <p className="text-xs text-gray-600 dark:text-slate-400 mb-2">Other Sessions</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-slate-50">{insights.other || 0}</p>
      </div>
    </div>
  );
}

