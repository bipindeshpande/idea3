/**
 * Blob - Decorative blob overlay for marketing pages
 */
export default function Blob({ size = "medium", position = "top-right", className = "" }) {
  const sizeClasses = {
    small: "marketing-blob--small",
    medium: "marketing-blob--medium",
    large: "marketing-blob--large",
  };

  const positionClasses = {
    "top-left": "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
    "top-right": "top-0 right-0 translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
    "bottom-right": "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div
      className={`marketing-blob ${sizeClasses[size]} ${positionClasses[position]} ${className}`}
      aria-hidden="true"
    />
  );
}

