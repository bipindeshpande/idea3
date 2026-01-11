export default function AdminTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "reports", label: "Reports" },
    { id: "stats", label: "Statistics" },
    { id: "users", label: "Users" },
    { id: "payments", label: "Payments" },
    { id: "validation", label: "Validation Questions" },
  ];

  return (
    <div className="mb-6 flex gap-2 border-b border-default overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === tab.id
              ? "border-b-2 border-default text-accent"
              : "text-secondary hover:text-primary"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

