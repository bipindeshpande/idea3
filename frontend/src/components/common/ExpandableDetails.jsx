import { useState } from "react";

/**
 * Lightweight expandable details component
 * Shows a small link that expands inline content on click
 * Perfect for adding depth without cluttering the page
 */
export default function ExpandableDetails({ 
 triggerText = "Learn more", 
 children, 
 className = "",
 icon = "→" 
}) {
 const [isOpen, setIsOpen] = useState(false);

 return (
 <div className={className}>
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent transition-colors"
 aria-expanded={isOpen}
 >
 <span>{triggerText}</span>
 <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>{icon}</span>
 </button>
 {isOpen && (
 <div className="mt-2 rounded-lg border border-default bg-surface p-3 text-xs text-secondary space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
 {children}
 </div>
 )}
 </div>
 );
}

