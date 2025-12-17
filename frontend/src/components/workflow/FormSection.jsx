import UICard from "../ui/ui-card.jsx";
import SectionTitle from "./SectionTitle.jsx";

export default function FormSection({ title, subtitle, children, className = "" }) {
  return (
    <UICard className={`p-6 ${className}`}>
      {(title || subtitle) ? <SectionTitle title={title} subtitle={subtitle} /> : null}
      <div style={{ marginTop: 16 }}>{children}</div>
    </UICard>
  );
}


