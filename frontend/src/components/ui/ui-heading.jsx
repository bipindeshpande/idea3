export default function UIHeading({ level = "h2", as, className = "", children, ...props }) {
  const Tag = as || level;
  const classes = ["ui-heading", `ui-heading--${level}`, className].filter(Boolean).join(" ");
  return (
    <Tag className={classes} {...props}>
      {children}
    </Tag>
  );
}


