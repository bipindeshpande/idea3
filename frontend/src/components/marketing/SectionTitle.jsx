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
    <div className={`${center ? "text-center" : ""} mb-16 ${animationClass || ""} ${className}`}>
      <h2 
        className="mkt-h2 font-bold mb-4"
        style={{ color: "var(--mkt-heading)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p 
          className={`mkt-body ${center ? "max-w-2xl mx-auto" : ""}`}
          style={{ color: "var(--mkt-subheading)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
