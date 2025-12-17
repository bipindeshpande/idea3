export default function UIDivider({ className = "", ...props }) {
  return <div className={["ui-divider", className].filter(Boolean).join(" ")} {...props} />;
}


