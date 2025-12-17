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
import UISelect from "./ui-select.jsx";

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
 className="block text-base mb-2 text-secondary"
 >
 {label}
 {required && <span className="text-accent ml-1">*</span>}
 </label>
 )}
 <UISelect
 id={selectId}
 value={value}
 onChange={onChange}
 required={required}
 className={className}
 aria-invalid={Boolean(error) || undefined}
 style={error ? { borderColor: "var(--danger)" } : undefined}
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
 </UISelect>
 {error && (
 <p className="text-xs text-danger mt-1">{error}</p>
 )}
 </div>
 );
}

