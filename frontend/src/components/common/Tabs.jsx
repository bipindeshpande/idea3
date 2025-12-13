/**
 * Tabs - Reusable tabbed interface component
 * 
 * @param {Array} tabs - Array of {id, label, badge} objects
 * @param {string} activeTab - Currently active tab ID
 * @param {Function} onTabChange - Tab change handler
 * @param {string} className - Additional CSS classes
 */
export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) {
  return (
    <div className={`mb-6 border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === tab.id
                ? "border-indigo-600 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            {tab.badge && tab.badge > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}

