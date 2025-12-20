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
  eyebrow, // V6: Eyebrow label
  microBenefit, // V6: Micro-benefit line under description
  accentBorder = false, // V6: Top accent border
  scale = 1, // V6: Size variation (0.98 - 1)
  identity, // V8: Identity mirroring microcopy
  contrastBlock, // V10: Contrast block before description
  anchor, // V10: Anchor ribbon for "best fit" feature
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
      className={`rounded-xl p-5 border transition-all duration-300 card-floating card-3d ${tintClasses[tint]} ${animationClass || ""} ${className} ${!className.includes('flex') ? '' : 'flex flex-col'}`}
      style={{
        borderColor: "var(--mkt-outline)",
        background: splitGradients[tint],
        position: "relative",
        overflow: "hidden",
        transform: `translateZ(0) scale(${scale})`,
        ...(className.includes('flex') ? { height: '100%' } : {})
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `translateZ(0) scale(${scale * 1.02}) rotate(0.5deg)`;
        e.currentTarget.classList.add("glow-accent");
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `translateZ(0) scale(${scale}) rotate(0deg)`;
        e.currentTarget.classList.remove("glow-accent");
      }}
    >
      {/* V6: Top accent border */}
      {accentBorder && (
        <div 
          className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
          style={{
            background: `linear-gradient(to right, var(--mkt-hero-start), var(--mkt-hero-end))`
          }}
        />
      )}
      
      {/* V6: Diagonal light highlight */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-1/2 opacity-20 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3), transparent)",
          borderRadius: "0 12px 0 0"
        }}
      />
      
      {/* Optional animated border */}
      {animatedBorder && (
        <div 
          className="absolute inset-0 rounded-xl animate-mkt-glowPulse"
          style={{
            padding: "1px",
            background: "linear-gradient(135deg, var(--mkt-primary), var(--mkt-card-purple))",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
      
      {/* V6: Eyebrow label */}
      {eyebrow && (
        <div className="mkt-eyebrow mb-2">
          {eyebrow}
        </div>
      )}
      
      {/* Icon badge circle */}
      {icon && (
        <div 
          className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 text-2xl"
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
        className="mkt-h3 mb-3 font-semibold"
        style={{ color: "var(--mkt-heading)", fontSize: "18px" }}
      >
        {title}
      </h3>
      <div className={className.includes('flex') ? 'flex-grow flex flex-col' : ''}>
        {description && (
          <p 
            className="mkt-body leading-relaxed mb-2"
            style={{ color: "var(--mkt-paragraph)" }}
          >
            {description}
          </p>
        )}
        {/* V6: Micro-benefit line */}
        {microBenefit && (
          <p className="text-xs opacity-70 mt-2" style={{ color: "var(--mkt-text-dim)" }}>
            {microBenefit}
          </p>
        )}
        {/* V8: Identity mirroring microcopy */}
        {identity && (
          <p className="mkt-identity mt-2">
            {identity}
          </p>
        )}
      </div>
      <div className={className.includes('flex') ? 'mt-auto' : ''}>
        {children}
      </div>
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
