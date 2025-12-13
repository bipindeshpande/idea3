/**
 * Button - Standardized button component
 * 
 * @param {ReactNode} children - Button content
 * @param {'primary' | 'secondary'} variant - Button style variant
 * @param {Function} onClick - Click handler
 * @param {boolean} disabled - Disabled state
 * @param {'button' | 'submit' | 'reset'} type - Button type
 * @param {string} className - Additional CSS classes
 */
export default function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  className = ""
}) {
  const variantClasses = {
    primary: "px-5 py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed",
    secondary: "px-5 py-2.5 rounded-lg font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

