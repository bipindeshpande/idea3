/**
 * SectionTitle - Premium section title with subtitle and automatic spacing
 */
export default function SectionTitle({
  title,
  subtitle,
  center = false,
  className = "",
  animate,
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  return (
    <div className={`${center ? "text-center" : ""} mb-10 ${animationClass || ""} ${className}`}>
      <h2 
        className="mkt-h2 font-bold mb-3"
        style={{ color: "var(--mkt-heading)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p 
          className={`mkt-body ${center ? "max-w-xl mx-auto" : ""}`}
          style={{ color: "var(--mkt-subheading)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
