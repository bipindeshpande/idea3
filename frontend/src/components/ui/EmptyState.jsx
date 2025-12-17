import UIHeading from "./ui-heading.jsx";
import UIButton from "./ui-button.jsx";

/**
 * EmptyState - Empty state display component
 * 
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {string} icon - Optional icon (emoji or text)
 * @param {object} action - Optional action button {label, onClick}
 * @param {string} className - Additional CSS classes
 */
export default function EmptyState({
 title,
 description,
 icon,
 action,
 className = ""
}) {
 return (
 <div className={`ui-card2 ui-pad-md text-center ${className}`}>
 {icon && (
 <div
 className="icon-circle mb-4 mx-auto text-2xl"
 style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}
 >
 {icon}
 </div>
 )}
 {title && <UIHeading level="h3" className="mb-1">{title}</UIHeading>}
 {description && (
 <p className="text-secondary leading-relaxed max-w-md mx-auto mt-2">
 {description}
 </p>
 )}
 {action && (
 <div className="mt-6">
 <UIButton variant="primary" onClick={action.onClick}>
 {action.label}
 </UIButton>
 </div>
 )}
 </div>
 );
}

