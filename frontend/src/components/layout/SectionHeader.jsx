/**
 * SectionHeader - Standard section header component
 * Uses workspace typography system for consistent, proportionate font sizes
 * 
 * @param {string} title - Section title
 * @param {string} description - Optional description
 * @param {string} icon - Optional icon
 * @param {string} className - Additional CSS classes
 */
import { WORKSPACE_TYPOGRAPHY } from "../workspace/WorkspaceTheme.js";

export default function SectionHeader({
 title,
 description,
 icon,
 className = ""
}) {
 return (
 <div className={className}>
 {icon && (
 <div className="icon-circle bg-surface text-accent mb-4 text-2xl">
 {icon}
 </div>
 )}
 <h2 className={`${WORKSPACE_TYPOGRAPHY.h3} flex items-center gap-2`}>
 {title}
 </h2>
 {description && (
 <p className={`mt-1 ${WORKSPACE_TYPOGRAPHY.subtitle}`}>
 {description}
 </p>
 )}
 </div>
 );
}

