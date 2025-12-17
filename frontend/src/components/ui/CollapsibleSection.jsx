export default function CollapsibleSection({ title, description, theme, isOpen, onToggle, children }) {
 return (
 <div className="ui-card shadow-soft rounded-3xl min-h-[80px]">
 <button
 onClick={onToggle}
 className="w-full flex items-center justify-between gap-3 px-6 py-4 hover-surface transition-colors border-b border-default"
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <span className="text-2xl flex-shrink-0">{theme.icon}</span>
 <div className="text-left flex-1 min-w-0">
 <h2
 className="text-lg font-semibold text-primary border-l-4 border-default pl-3"
 >
 {title}
 </h2>
 {description && (
 <p className="text-xs mt-1 text-primary">{description}</p>
 )}
 </div>
 </div>
 <span className={`text-xl transition-transform flex-shrink-0 text-primary ${isOpen ? "rotate-180" : ""}`}>
 ▼
 </span>
 </button>
 
 {isOpen && (
 <div className="px-6 pb-6 pt-4 text-primary min-h-[60px]">
 {children}
 </div>
 )}
 </div>
 );
}

