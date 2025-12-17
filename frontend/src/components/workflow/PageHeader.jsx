import UIHeading from "../ui/ui-heading.jsx";

export default function PageHeader({ title, subtitle, className = "" }) {
  return (
    <div className={className}>
      <UIHeading level="h1">{title}</UIHeading>
      {subtitle ? <p className="text-secondary" style={{ marginTop: 8 }}>{subtitle}</p> : null}
    </div>
  );
}


