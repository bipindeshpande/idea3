export default function FounderConnectTabs({ activeTab, onTabChange, connections }) {
  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "listings", label: "My Listings" },
    { id: "browse-ideas", label: "Browse Ideas" },
    { id: "browse-people", label: "Browse Founders" },
    { id: "connections", label: "Connections" },
  ];

  const getConnectionCount = () => {
    if (activeTab !== "connections") return null;
    const sentCount = connections?.sent?.length || 0;
    const receivedCount = connections?.received?.length || 0;
    const total = sentCount + receivedCount;
    return total > 0 ? total : null;
  };

  return (
    <div className="mb-6 border-b border-default">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === tab.id
                ? "border-accent text-primary"
                : "border-transparent text-secondary hover:text-accent-hover hover:border-default"
            }`}
          >
            {tab.label}
            {tab.id === "connections" && getConnectionCount() !== null && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-surface text-accent rounded-full">
                {getConnectionCount()}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

