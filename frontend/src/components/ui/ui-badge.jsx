export default function UIBadge({ variant = "info", className = "", children, ...props }) {
  const classes = ["ui-badge", `ui-badge--${variant}`, className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}


