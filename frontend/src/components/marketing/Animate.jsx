/**
 * Animate - Wrapper component for animation props
 * Supports: animate="fade" | "slide" | "float"
 */
export default function Animate({ 
  children, 
  animate = "fade",
  delay = 0,
  className = "" 
}) {
  const animationClass = animate ? `animate-mkt-${animate}` : "";
  
  return (
    <div 
      className={`${animationClass} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

