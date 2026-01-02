export default function UIButton({ 
  as, 
  variant = "primary", 
  size = "md",
  className = "", 
  type = "button", 
  disabled, 
  ...props 
}) {
  const sizeClass = size !== "md" ? `ui-button--${size}` : "";
  const classes = ["ui-button", `ui-button--${variant}`, sizeClass, className].filter(Boolean).join(" ");
  const Component = as || "button";
  const componentProps = Component === "button" ? { type, disabled } : {};
  return <Component className={classes} {...componentProps} {...props} />;
}


