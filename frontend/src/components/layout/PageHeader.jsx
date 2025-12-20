import AccentGlow from "../ui/AccentGlow.jsx";
import UIHeading from "../ui/ui-heading.jsx";

/**
 * PageHeader - Standard page header with optional accent glow
 * 
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {string} description - Alias for subtitle (for backward compatibility)
 * @param {string} subscript - Optional subscript text to display below the title
 * @param {boolean} showAccent - Whether to show accent glow (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function PageHeader({ 
 title, 
 subtitle, 
 description,
 subscript,
 showAccent = true,
 className = "" 
}) {
 // Use subtitle or description (description is alias for backward compatibility)
 const displaySubtitle = subtitle || description;
 
 return (
 <header 
  className={`space-y-3 relative py-12 ${className}`}
  style={{
   minHeight: "200px",
   display: "flex",
   flexDirection: "column",
   justifyContent: "center"
  }}
 >
 {showAccent && <AccentGlow />}
 <div className="relative z-10">
 <div className="mb-2">
  <UIHeading level="h1" className="text-primary">{title}</UIHeading>
  {subscript && (
   <div 
    className="text-sm font-normal text-secondary mt-2"
    style={{
     fontSize: "0.875rem",
     fontWeight: "var(--font-weight-normal)",
     color: "var(--mkt-text-dim)",
     lineHeight: "1.5"
    }}
   >
    {subscript}
   </div>
  )}
 </div>
 {displaySubtitle && (
 <p className="text-base text-secondary leading-relaxed mb-8">
 {displaySubtitle}
 </p>
 )}
 </div>
 </header>
 );
}

