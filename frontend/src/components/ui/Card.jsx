/**
 * Card - Standard card container component
 * 
 * @param {ReactNode} children - Card content
 * @param {string} className - Additional CSS classes
 * @param {'sm' | 'md' | 'lg'} padding - Padding size (default: 'md')
 */
export default function Card({ 
  children, 
  className = "",
  padding = "md" 
}) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6 md:p-7",
    lg: "p-8 md:p-10"
  };

  return (
    <div className={`rounded-xl border border-gray-200 shadow-sm bg-white ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
}

