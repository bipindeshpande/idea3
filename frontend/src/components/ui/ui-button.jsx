export default function UIButton({ as, variant = "primary", className = "", type = "button", disabled, ...props }) {
  const classes = ["ui-button", `ui-button--${variant}`, className].filter(Boolean).join(" ");
  const Component = as || "button";
  const componentProps = Component === "button" ? { type, disabled } : {};
  return <Component className={classes} {...componentProps} {...props} />;
}


