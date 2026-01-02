export default function ValidationTabs({ activeTab, setActiveTab, recommendations, finalConclusion }) {
  const tabs = [
    { id: "input", label: "Your Input", hidden: false },
    { id: "results", label: "Validation Results", hidden: false },
    { id: "analysis", label: "Detailed Analysis & Recommendations", hidden: !recommendations },
    { id: "conclusion", label: "Final Validation Conclusion & Decision", hidden: !finalConclusion },
    { id: "nextsteps", label: "Next Steps", hidden: false },
  ];

  return (
    <div className="mb-8 no-print">
      <nav className="flex flex-wrap gap-2 rounded-full bg-app p-1">
        {tabs
          .filter((tab) => !tab.hidden)
          .map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-surface text-primary shadow-sm shadow-soft"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
      </nav>
    </div>
  );
}

