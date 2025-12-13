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
        <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[15px] text-gray-700 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

