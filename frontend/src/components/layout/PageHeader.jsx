import AccentGlow from "../ui/AccentGlow.jsx";

/**
 * PageHeader - Standard page header with optional accent glow
 * 
 * @param {string} title - Main page title
 * @param {string} subtitle - Optional subtitle/description
 * @param {boolean} showAccent - Whether to show accent glow (default: true)
 * @param {string} className - Additional CSS classes
 */
export default function PageHeader({ 
  title, 
  subtitle, 
  showAccent = true,
  className = "" 
}) {
  return (
    <header className={`space-y-3 relative ${className}`}>
      {showAccent && <AccentGlow />}
      <div className="relative z-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] text-gray-700 leading-relaxed mb-8">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

