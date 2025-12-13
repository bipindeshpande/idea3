/**
 * FormSelect - Standardized select dropdown component
 * 
 * @param {string} value - Selected value
 * @param {Function} onChange - Change handler
 * @param {Array} options - Array of {value, label} objects
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {string} label - Label text
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional CSS classes
 * @param {object} rest - Other select props
 */
export default function FormSelect({
  value,
  onChange,
  options = [],
  placeholder,
  error,
  label,
  required = false,
  className = "",
  ...rest
}) {
  const selectId = rest.id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div>
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm text-gray-600 mb-2"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500" : "border-gray-200"
        } bg-white p-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
}

