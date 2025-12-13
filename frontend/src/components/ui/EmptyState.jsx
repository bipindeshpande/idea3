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
    <div className={`rounded-xl border border-gray-200 shadow-sm bg-white p-6 md:p-7 text-center ${className}`}>
      {icon && (
        <div className="icon-circle bg-[#f3f5ff] text-indigo-600 mb-4 mx-auto text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {title}
      </h3>
      <p className="text-[15px] text-gray-600 leading-relaxed max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <button
            onClick={action.onClick}
            className="px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}

