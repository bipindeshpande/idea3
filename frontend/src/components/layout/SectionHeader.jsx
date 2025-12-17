/**
 * SectionHeader - Standard section header component
 * 
 * @param {string} title - Section title
 * @param {string} description - Optional description
 * @param {string} icon - Optional icon
 * @param {string} className - Additional CSS classes
 */
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
 <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
 {title}
 </h2>
 {description && (
 <p className="mt-1 text-primary text-primary leading-relaxed">
 {description}
 </p>
 )}
 </div>
 );
}

