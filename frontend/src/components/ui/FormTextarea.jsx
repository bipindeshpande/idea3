/**
 * FormTextarea - Standardized textarea component
 * 
 * @param {string} value - Textarea value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {string} label - Label text
 * @param {boolean} required - Required field indicator
 * @param {number} rows - Number of rows (default: 4)
 * @param {string} className - Additional CSS classes
 * @param {object} rest - Other textarea props
 */
export default function FormTextarea({
  value,
  onChange,
  placeholder,
  error,
  label,
  required = false,
  rows = 4,
  className = "",
  ...rest
}) {
  const textareaId = rest.id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div>
      {label && (
        <label 
          htmlFor={textareaId} 
          className="block text-sm text-gray-600 mb-2"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500" : "border-gray-200"
        } bg-white p-3 text-gray-900 shadow-sm transition-all duration-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${className}`}
        {...rest}
      />
      {error && (
        <p className="text-xs text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
}

