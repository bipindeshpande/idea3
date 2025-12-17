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
import UITextarea from "./ui-textarea.jsx";

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
 className="block text-base mb-2 text-secondary"
 >
 {label}
 {required && <span className="text-accent ml-1">*</span>}
 </label>
 )}
 <UITextarea
 id={textareaId}
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 required={required}
 rows={rows}
 className={className}
 aria-invalid={Boolean(error) || undefined}
 style={error ? { borderColor: "var(--danger)" } : undefined}
 {...rest}
 />
 {error && (
 <p className="text-xs text-danger mt-1">{error}</p>
 )}
 </div>
 );
}

