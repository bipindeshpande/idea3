export default function UICard({ as, variant = "default", className = "", children, ...props }) {
  const classes = ["ui-card2", variant !== "default" ? `ui-card2--${variant}` : "", className]
    .filter(Boolean)
    .join(" ");
  const Component = as || "div";
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}


