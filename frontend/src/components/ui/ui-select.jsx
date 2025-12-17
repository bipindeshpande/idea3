export default function UISelect({ className = "", children, ...props }) {
  return (
    <select className={["ui-control", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </select>
  );
}


