/**
 * DiscoveryCard - Standardized card component for discovery flow pages
 * Ensures consistent styling across all discovery pages
 */
export default function DiscoveryCard({ 
  children, 
  className = "",
  padding = "md",
  variant = "default"
}) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  const variantClasses = {
    default: "bg-surface border border-default shadow-card",
    muted: "bg-surface-muted border border-default shadow-sm",
    elevated: "bg-surface border border-default shadow-card-lg",
    info: "bg-surface border border-accent shadow-card",
  };

  return (
    <div 
      className={`rounded-xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}

