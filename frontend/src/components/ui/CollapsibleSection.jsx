import { useState, useEffect, useRef } from "react";

export default function CollapsibleSection({ title, description, theme, isOpen, onToggle, children, className = "" }) {
 const borderClass = theme?.border || "border";
 const borderColor = theme?.borderColor || "var(--border)";
 const bgColor = theme?.bgColor || "var(--surface)";
 const headerBgColor = theme?.headerBgColor || bgColor;
 
 const contentRef = useRef(null);
 const [maxHeight, setMaxHeight] = useState(0);

 // Calculate content height for smooth animation
 useEffect(() => {
   if (contentRef.current) {
     setMaxHeight(isOpen ? contentRef.current.scrollHeight : 0);
   }
 }, [isOpen, children]);

 return (
 <div 
  className={`ui-card shadow-soft rounded-xl overflow-hidden ${borderClass} ${className} transition-all duration-300 hover:shadow-md`}
  style={{
   borderColor: borderColor,
   backgroundColor: bgColor,
  }}
 >
 <button
 onClick={onToggle}
 className={`w-full flex items-center justify-between gap-3 px-6 py-4 hover-surface transition-all duration-200 ${isOpen ? 'border-b' : 'rounded-b-xl'}`}
 style={{
  borderColor: isOpen ? borderColor : 'transparent',
  backgroundColor: headerBgColor,
 }}
 aria-expanded={isOpen}
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <span className={`text-2xl flex-shrink-0 transition-transform duration-300 ${isOpen ? 'scale-110' : 'scale-100'}`}>
   {theme?.icon || "📋"}
 </span>
 <div className="text-left flex-1 min-w-0">
 <h2 className="text-lg font-semibold text-primary transition-colors">
 {title}
 </h2>
 {description ? (
 <p className="text-xs mt-1 text-secondary transition-opacity duration-200">{description}</p>
 ) : (
 <p className="text-xs mt-1 text-secondary opacity-60 transition-opacity duration-200">
   Click to expand and view details
 </p>
 )}
 </div>
 </div>
 <span className={`text-xl transition-transform duration-300 flex-shrink-0 text-primary ${isOpen ? "rotate-180" : "rotate-0"}`}>
 ▼
 </span>
 </button>
 
 <div
   ref={contentRef}
   className="overflow-hidden transition-all duration-300 ease-in-out"
   style={{ maxHeight: isOpen ? `${maxHeight}px` : '0px' }}
 >
   <div className={`px-6 pb-6 pt-4 text-primary transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
     {children}
   </div>
 </div>
 </div>
 );
}

