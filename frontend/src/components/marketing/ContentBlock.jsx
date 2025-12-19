/**
 * ContentBlock - Premium two-column layout: text left, visual right
 */
export default function ContentBlock({
  title,
  description,
  children,
  visual,
  reverse = false,
  className = "",
  titleLevel = "h3",
  animate,
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const contentOrder = reverse ? "md:flex-row-reverse" : "md:flex-row";
  
  return (
    <div className={`${animationClass || ""} ${className}`}>
      <div className={`flex flex-col ${contentOrder} gap-8 items-center`}>
        {/* Text content */}
        <div className="flex-1">
          {title && (
            <h3 
              className="mkt-h3 font-semibold mb-4"
              style={{ color: "var(--mkt-heading)" }}
            >
              {title}
            </h3>
          )}
          {description && (
            <p 
              className="mkt-body mb-4 leading-relaxed"
              style={{ color: "var(--mkt-paragraph)" }}
            >
              {description}
            </p>
          )}
          {children}
        </div>
        
        {/* Visual block */}
        {visual && (
          <div className="flex-1 w-full max-w-md">
            <div 
              className="w-full h-56 rounded-xl mkt-card--floating"
              style={{
                background: visual.gradient || "linear-gradient(135deg, var(--mkt-card-blue), var(--mkt-card-purple))",
                boxShadow: "var(--mkt-layer-shadow)",
                borderRadius: "12px"
              }}
            >
              {visual.content || (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-6xl opacity-50">📊</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
