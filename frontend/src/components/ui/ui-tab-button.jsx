/**
 * TabButton - Standardized tab button component for consistent tab navigation
 */
export default function TabButton({ 
  active = false, 
  onClick, 
  children, 
  className = "",
  fullWidthOnMobile = false
}) {
  return (
    <button
      onClick={onClick}
      className={`
        py-3 px-4 
        text-sm sm:text-base 
        font-medium 
        transition-all duration-200
        border-b-2 
        whitespace-nowrap
        ${active
          ? "border-accent text-primary font-semibold scale-105 sm:scale-100"
          : "border-transparent text-secondary hover:text-primary hover:bg-surface/50"
        } 
        ${fullWidthOnMobile ? "w-full sm:w-auto" : ""}
        ${className}
      `}
      style={active ? { 
        borderBottomWidth: "3px", 
        borderBottomColor: "var(--accent)" 
      } : {}}
      aria-selected={active}
      role="tab"
    >
      {children}
    </button>
  );
}

