import UIHeading from "../ui/ui-heading.jsx";

export default function SectionTitle({ title, subtitle, className = "" }) {
  return (
    <div className={className}>
      <UIHeading level="h2">{title}</UIHeading>
      {subtitle ? <p className="text-secondary" style={{ marginTop: 6 }}>{subtitle}</p> : null}
    </div>
  );
}


