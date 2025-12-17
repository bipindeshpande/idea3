export default function UIInput({ className = "", ...props }) {
  return <input className={["ui-control", className].filter(Boolean).join(" ")} {...props} />;
}


