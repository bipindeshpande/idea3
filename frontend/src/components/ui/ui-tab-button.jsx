/**
 * TabButton - Standardized tab button component for consistent tab navigation
 */
export default function TabButton({ 
  active = false, 
  onClick, 
  children, 
  className = "" 
}) {
  return (
    <button
      onClick={onClick}
      className={`py-3 px-4 text-base font-medium transition-colors border-b-2 ${
        active
          ? "border-accent text-primary font-semibold"
          : "border-transparent text-secondary hover:text-primary"
      } ${className}`}
      style={active ? { borderBottomWidth: "3px", borderBottomColor: "var(--accent)" } : {}}
    >
      {children}
    </button>
  );
}

