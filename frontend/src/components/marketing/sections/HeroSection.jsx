/**
 * HeroSection - Standardized Hero Section Wrapper
 * 
 * Standardizes all hero sections across the marketing site.
 * 
 * Rules:
 * - Uses base Hero component
 * - Supports both `data` object and individual props
 * - Optional wrapper styling
 * - Optional decorative children
 * - Uses tokens only
 */

import Hero from "../Hero.jsx";

export default function HeroSection({
  // Support both data object and individual props
  data,
  title,
  subheadline,
  primaryCTA,
  secondaryCTA,
  eyebrow,
  // Wrapper options
  wrapperClassName = "",
  wrapperStyle = {},
  // Hero component options
  className = "",
  // Children for decorations
  children,
  // Pass through any other props
  ...props
}) {
  // Normalize props - prefer data object, fallback to individual props
  const heroProps = data 
    ? { ...data, className }
    : {
        title,
        subheadline,
        primaryCTA,
        secondaryCTA,
        eyebrow,
        className,
        ...props
      };

  // If wrapper styling is needed, wrap in section
  if (wrapperClassName || Object.keys(wrapperStyle).length > 0) {
    return (
      <section 
        className={wrapperClassName}
        style={wrapperStyle}
        data-section-file="HeroSection.jsx"
      >
        <Hero {...heroProps}>
          {children}
        </Hero>
      </section>
    );
  }

  // Otherwise, just return Hero directly (with children if provided)
  return <Hero {...heroProps}>{children}</Hero>;
}

