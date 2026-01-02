import React from "react";

/**
 * Dashboard Stats Component
 * Displays 4 stat cards: Ideas, Validations, Match %, Risk Alerts
 */
export default function DashboardStats({ ideas, validations, matchPercent, riskAlerts }) {
  const stats = [
    {
      icon: (
        <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      label: "Ideas",
      value: ideas?.length || 0
    },
    {
      icon: (
        <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: "Validations",
      value: validations?.length || 0
    },
    {
      icon: (
        <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      label: "Match %",
      value: Math.round((matchPercent ?? 0) * 100) / 100 || 0
    },
    {
      icon: (
        <svg className="w-3 h-3 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      label: "Risk Alerts",
      value: riskAlerts ?? 0
    }
  ];

  return (
    <div className="grid gap-2 md:grid-cols-4">
      {stats.map((stat, index) => (
        <div key={index} className="ui-card2 ui-card2--muted" style={{ padding: "6px 8px" }}>
          <div className="flex items-center gap-1 mb-0.5">
            {stat.icon}
            <p className="text-xs text-secondary leading-tight">{stat.label}</p>
          </div>
          <p className="text-base font-mono font-bold text-primary leading-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}


