export default function CollapsibleSection({ title, description, theme, isOpen, onToggle, children }) {
  return (
    <div className="rounded-3xl border border-[#CBD5E1] dark:border-[#2D3648] bg-white dark:bg-[#161B22] shadow-[0_1px_3px_rgba(0,0,0,0.07)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)] min-h-[80px]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-6 py-4 hover:bg-[#F1F5F9] dark:hover:bg-[#1F2937] transition-colors border-b border-[rgba(0,0,0,0.06)] dark:border-[rgba(255,255,255,0.08)]"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{theme.icon}</span>
          <div className="text-left flex-1 min-w-0">
            <h2
              className="text-lg font-semibold text-[#1A1A1A] dark:text-[#EDEDED] border-l-4 border-[#2563EB] dark:border-[#3B82F6] pl-3"
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs mt-1 text-[#7A7A7A] dark:text-[#8B949E]">{description}</p>
            )}
          </div>
        </div>
        <span className={`text-xl transition-transform flex-shrink-0 text-[#3A3A3A] dark:text-[#C4C4C4] ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 pt-4 text-[#3A3A3A] dark:text-[#C4C4C4] min-h-[60px]">
          {children}
        </div>
      )}
    </div>
  );
}

