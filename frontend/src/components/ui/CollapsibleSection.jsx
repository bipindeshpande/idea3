export default function CollapsibleSection({ title, description, theme, isOpen, onToggle, children, className = "" }) {
 const borderClass = theme?.border || "border";
 const borderColor = theme?.borderColor || "var(--border)";
 const bgColor = theme?.bgColor || "var(--surface)";
 const headerBgColor = theme?.headerBgColor || bgColor;
 
 return (
 <div 
  className={`ui-card shadow-soft rounded-xl min-h-[80px] overflow-hidden ${borderClass} ${className}`}
  style={{
   borderColor: borderColor,
   backgroundColor: bgColor,
  }}
 >
 <button
 onClick={onToggle}
 className={`w-full flex items-center justify-between gap-3 px-6 py-4 hover-surface transition-colors ${isOpen ? 'border-b' : 'rounded-b-xl'}`}
 style={{
  borderColor: isOpen ? borderColor : 'transparent',
  backgroundColor: headerBgColor,
 }}
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <span className="text-2xl flex-shrink-0">{theme?.icon || "📋"}</span>
 <div className="text-left flex-1 min-w-0">
 <h2 className="text-lg font-semibold text-primary">
 {title}
 </h2>
 {description ? (
 <p className="text-xs mt-1 text-secondary">{description}</p>
 ) : (
 <p className="text-xs mt-1 text-secondary opacity-60">Click to expand and view details</p>
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

