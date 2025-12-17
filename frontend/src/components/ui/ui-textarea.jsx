export default function UITextarea({ className = "", ...props }) {
  return <textarea className={["ui-control", className].filter(Boolean).join(" ")} {...props} />;
}


