/**
 * FormInput - Standardized form input component
 * 
 * @param {string} type - Input type (default: 'text')
 * @param {string} value - Input value
 * @param {Function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {string} label - Label text
 * @param {boolean} required - Required field indicator
 * @param {string} className - Additional CSS classes
 * @param {object} rest - Other input props
 */
import UIInput from "./ui-input.jsx";

export default function FormInput({
 type = "text",
 value,
 onChange,
 placeholder,
 error,
 label,
 required = false,
 className = "",
 ...rest
}) {
 const inputId = rest.id || `input-${Math.random().toString(36).substr(2, 9)}`;

 return (
 <div>
 {label && (
 <label 
 htmlFor={inputId} 
 className="block text-base mb-2 text-secondary"
 >
 {label}
 {required && <span className="text-accent ml-1">*</span>}
 </label>
 )}
 <UIInput
 id={inputId}
 type={type}
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 required={required}
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

