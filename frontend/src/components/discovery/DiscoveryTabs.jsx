/**
 * DiscoveryTabs - Standardized tab navigation component for discovery pages
 */
export default function DiscoveryTabs({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) {
  return (
    <div className={`border-b border-default ${className}`}>
      <nav className="-mb-px flex space-x-8 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "border-default text-accent"
                : "border-transparent text-secondary hover:border-default hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

