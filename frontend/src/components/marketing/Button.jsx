/**
 * Marketing Button Component - Single Source of Truth
 * 
 * Variants: primary, secondary, ghost, destructive
 * Sizes: sm, md, lg
 * 
 * Uses tokens only - no hardcoded values
 * No custom styles allowed - use variants only
 */

import { forwardRef } from "react";
import { Link } from "react-router-dom";

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    as,
    to,
    type = "button",
    disabled = false,
    className = "",
    ...props
  },
  ref
) {
  // Determine component - if 'to' prop exists, use Link, otherwise use 'as' or default to button
  const Component = to ? Link : (as || "button");
  // Size styles (from tokens)
  const sizeStyles = {
    sm: {
      padding: "var(--space-2) var(--space-4)",
      fontSize: "var(--font-size-sm)",
      borderRadius: "var(--radius-md)",
    },
    md: {
      padding: "var(--space-3) var(--space-6)",
      fontSize: "var(--font-size-base)",
      borderRadius: "var(--radius-lg)",
    },
    lg: {
      padding: "var(--space-4) var(--space-8)",
      fontSize: "var(--font-size-lg)",
      borderRadius: "var(--radius-xl)",
    },
  };
  
  // Variant styles (from tokens)
  const variantStyles = {
    primary: {
      backgroundColor: "var(--mkt-primary)",
      color: "white",
    },
    secondary: {
      backgroundColor: "var(--mkt-surface)",
      border: "1px solid var(--mkt-outline)",
      color: "var(--mkt-heading)",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "var(--mkt-heading)",
    },
    destructive: {
      backgroundColor: "var(--mkt-primary)", // Using primary for destructive, or define --mkt-danger if needed
      color: "white",
    },
  };
  
  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--font-family)",
    fontWeight: "var(--font-weight-semibold)",
    transition: "var(--transition-base)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    ...sizeStyles[size],
    ...variantStyles[variant],
  };
  
  // Component-specific props
  const componentProps = {};
  if (Component === "button") {
    componentProps.type = type;
    componentProps.disabled = disabled;
  }
  if (to) {
    componentProps.to = to;
  }
  
  // Extract onClick from props if it exists (for button elements)
  const { onClick, ...restProps } = props;
  if (Component === "button" && onClick) {
    componentProps.onClick = onClick;
  }
  
  // Add hover styles via CSS class
  const hoverClass = disabled ? "" : variant === "primary" 
    ? "hover:opacity-90" 
    : variant === "secondary" 
    ? "hover:bg-opacity-80" 
    : variant === "ghost"
    ? "hover:bg-opacity-10"
    : "";

  return (
    <Component
      ref={ref}
      className={`${className} ${hoverClass}`.trim()}
      style={baseStyle}
      {...componentProps}
      {...restProps}
    >
      {children}
    </Component>
  );
});

export default Button;

