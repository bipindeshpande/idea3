import { Link } from "react-router-dom";

/**
 * FeatureCard - Stripe-style feature card with hover-lift, 3D shadows, icon badges, and split-color tints
 * V3: Enhanced with soft-3D shadow, icon badge circle, diagonal gradient, and optional animated border
 */
export default function FeatureCard({
  icon,
  title,
  description,
  tint = "blue", // blue, green, orange, purple, yellow
  link,
  children,
  className = "",
  animate, // "fade" | "slide" | "float" | undefined
  animatedBorder = false,
}) {
  const animationClass = animate === "fade" ? " mkt-anim-fade" :
                         animate === "slide" ? " mkt-anim-slide" :
                         animate === "float" ? " mkt-anim-float" : "";
  const tintClasses = {
    blue: "card-tint-blue",
    green: "card-tint-green",
    orange: "card-tint-orange",
    purple: "card-tint-purple",
    yellow: "card-tint-yellow",
  };

  // Split-color tints (diagonal gradient)
  const splitGradients = {
    blue: "linear-gradient(135deg, var(--mkt-card-blue) 0%, rgba(59, 130, 246, 0.1) 100%)",
    green: "linear-gradient(135deg, var(--mkt-card-green) 0%, rgba(34, 197, 94, 0.1) 100%)",
    orange: "linear-gradient(135deg, var(--mkt-card-orange) 0%, rgba(249, 115, 22, 0.1) 100%)",
    purple: "linear-gradient(135deg, var(--mkt-card-purple) 0%, rgba(139, 92, 246, 0.1) 100%)",
    yellow: "linear-gradient(135deg, var(--mkt-card-yellow) 0%, rgba(234, 179, 8, 0.1) 100%)",
  };

  const cardContent = (
    <div 
      className={`rounded-2xl p-8 border transition-all duration-300 card-floating card-3d ${tintClasses[tint]} ${animationClass || ""} ${className}`}
      style={{
        borderColor: "var(--mkt-outline)",
        background: splitGradients[tint],
        position: "relative",
        overflow: "hidden",
        transform: "translateZ(0)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateZ(0) scale(1.02)";
        e.currentTarget.classList.add("glow-accent");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateZ(0) scale(1)";
        e.currentTarget.classList.remove("glow-accent");
      }}
    >
      {/* Optional animated border */}
      {animatedBorder && (
        <div 
          className="absolute inset-0 rounded-2xl animate-mkt-glowPulse"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, var(--mkt-primary), var(--mkt-card-purple))",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      
      {/* Icon badge circle */}
      {icon && (
        <div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-3xl"
          style={{
            background: "var(--mkt-surface)",
            boxShadow: "var(--mkt-card-shadow)",
            border: "1px solid var(--mkt-outline)",
          }}
        >
          {icon}
        </div>
      )}
      
      <h3 
        className="mkt-h3 mb-4 font-semibold"
        style={{ color: "var(--mkt-heading)" }}
      >
        {title}
      </h3>
      {description && (
        <p 
          className="mkt-body leading-relaxed"
          style={{ color: "var(--mkt-paragraph)" }}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
