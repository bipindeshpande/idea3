/**
 * DiscoveryBadge - Standardized badge/chip component for discovery pages
 * Ensures consistent badge styling across all discovery pages
 */
import { DISCOVERY_RADIUS } from "./DiscoveryTheme.js";

export default function DiscoveryBadge({
  children,
  variant = "default",
  size = "md",
  icon,
  className = ""
}) {
  const variantClasses = {
    default: "bg-surface border border-default text-primary",
    accent: "bg-accent text-on-accent",
    muted: "bg-surface-muted border border-default text-primary",
    info: "bg-surface border border-accent text-accent",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 ${DISCOVERY_RADIUS.badge} ${variantClasses[variant]} ${sizeClasses[size]} font-medium ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

