import AccentGlow from "../ui/AccentGlow.jsx";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * PageHeader - Standard page header with optional accent glow
 * 
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {boolean} showAccent - Whether to show accent glow (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function PageHeader({ 
 title, 
 subtitle, 
 showAccent = true,
 className = "" 
}) {
 return (
 <header className={`space-y-3 relative ${className}`}>
 {showAccent && <AccentGlow />}
 <div className="relative z-10">
 <UIHeading level="h1" className="text-primary mb-2">{title}</UIHeading>
 {subtitle && (
 <p className="text-base text-secondary leading-relaxed mb-8">
 {subtitle}
 </p>
 )}
 </div>
 </header>
 );
}

